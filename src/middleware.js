import createMiddleware from 'next-intl/middleware'
import { NextResponse } from 'next/server'
import { routing } from './i18n/routing'
import { resolvePortfolioAccessRedirect } from './lib/auth/userStatus'

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

export default async function middleware(request) {
  const { pathname } = request.nextUrl
  const { locale, pathname: pathWithoutLocale } = parsePathname(pathname)

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
  matcher: '/((?!api|trpc|_next|_vercel|opengraph-image|twitter-image|.*\\..*).*)',
}
