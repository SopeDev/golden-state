import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from '@/i18n/navigation'
import { resolveInvestorOnboardingPath } from '@/lib/auth/userStatus'
import AccountOnboardingRedirect from '../AccountOnboardingRedirect'
import AccountPendingContent from './AccountPendingContent'

export default async function AccountPendingPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    await redirect('/login')
  }
  if (session.user.accountStatus === 'ACTIVE' || session.user.type === 'ADMIN') {
    await redirect('/dashboard')
  }

  const onboardingPath = resolveInvestorOnboardingPath(session.user)
  if (onboardingPath && onboardingPath !== '/account/pending') {
    await redirect(onboardingPath)
  }

  return (
    <>
      <AccountOnboardingRedirect allowedPath="/account/pending" />
      <AccountPendingContent email={session.user.email} />
    </>
  )
}
