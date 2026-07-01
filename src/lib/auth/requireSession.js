import { getServerSession } from 'next-auth'
import { redirect } from '@/i18n/navigation'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import {
  canAccessPortfolio,
  resolvePortfolioAccessRedirect,
} from '@/lib/auth/userStatus'

export async function requireAuthenticated() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    await redirect('/login')
  }

  return session
}

export async function requirePortfolioAccess() {
  const session = await requireAuthenticated()

  if (session.user.type === 'ADMIN') {
    return session
  }

  const redirectPath = resolvePortfolioAccessRedirect(session.user)
  if (redirectPath) {
    await redirect(redirectPath)
  }

  if (!canAccessPortfolio(session.user)) {
    await redirect('/dashboard')
  }

  return session
}
