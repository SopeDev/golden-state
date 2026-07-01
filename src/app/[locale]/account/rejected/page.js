import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from '@/i18n/navigation'
import { resolveInvestorOnboardingPath } from '@/lib/auth/userStatus'
import AccountRejectedContent from './AccountRejectedContent'

export default async function AccountRejectedPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    await redirect('/login')
  }
  if (session.user.type === 'ADMIN' || session.user.accountStatus === 'ACTIVE') {
    await redirect('/dashboard')
  }
  if (session.user.accountStatus !== 'REJECTED') {
    const onboardingPath = resolveInvestorOnboardingPath(session.user)
    await redirect(onboardingPath || '/account/pending')
  }

  return <AccountRejectedContent />
}
