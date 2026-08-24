import createMiddleware from 'next-intl/middleware'
import { NextResponse } from 'next/server'
import { routing } from './i18n/routing'
import { resolvePortfolioAccessRedirect } from './lib/auth/userStatus'
import { hasOperatorPermission, OPERATOR_PERMISSIONS as P } from './lib/operatorPermissions'

const intlMiddleware = createMiddleware(routing)

const locales = routing.locales

const parsePathname = (pathname) => {
  const segments = pathname.split('/').filter(Boolean)
  const first = segments[0]

  if (locales.includes(first)) {
    return {
      locale: first,
      pathname: `/${segments.slice(1).join('/')}`,
    }
  }

  return {
    locale: routing.defaultLocale,
    pathname: pathname || '/',
  }
}

const fetchSessionUser = async (request) => {
  const sessionUrl = new URL('/api/auth/session', request.url)
  const response = await fetch(sessionUrl, {
    headers: {
      cookie: request.headers.get('cookie') ?? '',
    },
    cache: 'no-store',
  })

  if (!response.ok) return null

  const session = await response.json()
  return session?.user ?? null
}

const adminPermissionFor = (pathname, method) => {
  const write = method !== 'GET' && method !== 'HEAD'
  const path = pathname.replace(/^\/(?:en|es)/, '')

  if (path === '/admin' || path.startsWith('/api/admin/dashboard')) return P.VIEW_DASHBOARD
  if (path.includes('/admin/users/pending-count')) return P.VIEW_DASHBOARD
  if (path.includes('/admin/properties/') && path.includes('/notify-documents')) return P.NOTIFY_PROPERTY_INVESTORS
  if (path.includes('/admin/properties/') && path.includes('/documents')) return P.MANAGE_PROPERTY_DOCUMENTS
  if (path.includes('/admin/uploads/property-images')) return P.EDIT_PROPERTIES
  if (path.startsWith('/admin/property-types') || path.startsWith('/api/admin/property-types')) {
    return write ? P.MANAGE_PROPERTY_TYPES : P.VIEW_PROPERTIES
  }
  if (path.startsWith('/admin/properties') || path.startsWith('/api/admin/properties')) {
    if (!write) return P.VIEW_PROPERTIES
    if (method === 'POST' && !/\/properties\/[^/]+$/.test(path)) return P.CREATE_PROPERTIES
    if (method === 'DELETE' || method === 'POST') return P.ARCHIVE_PROPERTIES
    return P.EDIT_PROPERTIES
  }
  if (path.includes('/admin/users/') && path.includes('/account-status')) return P.REVIEW_INVESTOR_ACCOUNTS
  if (path.includes('/admin/users/') && path.includes('/accredited-status')) return P.REVIEW_ACCREDITATION
  if (path.startsWith('/api/admin/investors/')) return P.VIEW_INVESTORS
  if (path.startsWith('/admin/users') || path.startsWith('/api/admin/users')) {
    if (!write) return P.VIEW_INVESTORS
    if (method === 'PUT' && /^\/api\/admin\/users\/\d+$/.test(path)) return P.EDIT_INVESTORS
    return null
  }
  if (path.startsWith('/admin/investments') || path.startsWith('/api/admin/investment-intents')) {
    return P.MANAGE_INVESTMENT_REQUESTS
  }
  if (path.startsWith('/admin/deposits') || path.startsWith('/api/admin/deposit-requests')) {
    return write ? P.REVIEW_DEPOSITS : P.VIEW_FINANCIAL_ACTIVITY
  }
  if (path.startsWith('/admin/contributions') || path.startsWith('/api/admin/funding-contributions')) {
    return write ? P.MANAGE_CONTRIBUTIONS : P.VIEW_FINANCIAL_ACTIVITY
  }
  if (path.startsWith('/admin/distributions') || path.startsWith('/api/admin/return-distributions')) {
    return write ? P.MANAGE_RETURN_DISTRIBUTIONS : P.VIEW_FINANCIAL_ACTIVITY
  }
  if (path.startsWith('/admin/cash-outs') || path.startsWith('/api/admin/cash-out-requests')) {
    return write ? P.REVIEW_CASH_OUTS : P.VIEW_FINANCIAL_ACTIVITY
  }
  if (path.startsWith('/admin/reinvests') || path.startsWith('/api/admin/reinvest-requests')) {
    return write ? P.REVIEW_REINVESTMENTS : P.VIEW_FINANCIAL_ACTIVITY
  }
  if (path.startsWith('/admin/content') || path.startsWith('/api/admin/content')) return P.EDIT_WEBSITE_CONTENT
  if (path.startsWith('/admin/data') || path.startsWith('/admin/schema')) return P.VIEW_TECHNICAL_DATA
  return null
}

export default async function middleware(request) {
  const { pathname } = request.nextUrl
  const { locale, pathname: pathWithoutLocale } = parsePathname(pathname)

  const isAdminRoute = pathWithoutLocale === '/admin' || pathWithoutLocale.startsWith('/admin/')
  const isAdminApi = pathname.startsWith('/api/admin/')
  if (isAdminRoute || isAdminApi) {
    const user = await fetchSessionUser(request)
    if (!user || (user.type !== 'ADMIN' && user.type !== 'OPERATOR')) {
      if (isAdminApi) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      const url = request.nextUrl.clone()
      url.pathname = `/${locale}`
      return NextResponse.redirect(url)
    }

    if (user.type === 'OPERATOR') {
      const permission = adminPermissionFor(pathname, request.method)
      if (!permission || !hasOperatorPermission(user, permission)) {
        if (isAdminApi) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        const url = request.nextUrl.clone()
        url.pathname = `/${locale}`
        return NextResponse.redirect(url)
      }
    }

    if (isAdminApi) return NextResponse.next()
  }

  const isAccreditedAreaRoute =
    pathWithoutLocale === '/dashboard/portfolio' ||
    pathWithoutLocale.startsWith('/dashboard/portfolio/') ||
    pathWithoutLocale === '/dashboard/activity' ||
    pathWithoutLocale.startsWith('/dashboard/activity/') ||
    pathWithoutLocale === '/dashboard/updates' ||
    pathWithoutLocale.startsWith('/dashboard/updates/') ||
    pathWithoutLocale === '/dashboard/investments' ||
    pathWithoutLocale.startsWith('/dashboard/investments/')

  if (isAccreditedAreaRoute) {
    const user = await fetchSessionUser(request)
    const redirectPath = resolvePortfolioAccessRedirect(user)

    if (redirectPath) {
      const url = request.nextUrl.clone()
      url.pathname = `/${locale}${redirectPath}`
      return NextResponse.redirect(url)
    }
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: ['/api/admin/:path*', '/((?!api|trpc|_next|_vercel|opengraph-image|twitter-image|.*\\..*).*)'],
}
