import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from '@/i18n/navigation'
import { needsEmailVerification, resolveInvestorOnboardingPath } from '@/lib/auth/userStatus'
import CheckEmailClient from './CheckEmailClient'

export default async function CheckEmailPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    await redirect('/login?callbackUrl=/register/check-email')
  }

  if (!needsEmailVerification(session.user)) {
    const nextPath = resolveInvestorOnboardingPath(session.user) || '/dashboard'
    await redirect(nextPath)
  }

  return <CheckEmailClient email={session.user.email} />
}
