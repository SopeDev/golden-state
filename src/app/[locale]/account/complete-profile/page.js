import { getServerSession } from 'next-auth'
import { getLocale } from 'next-intl/server'
import { headers } from 'next/headers'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from '@/i18n/navigation'
import { needsEmailVerification } from '@/lib/auth/userStatus'
import {
  getRequestCountryCode,
  resolveDefaultInvestorLocation,
} from '@/lib/auth/investorProfileOptions'
import CompleteProfileClient from './CompleteProfileClient'

export default async function CompleteProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    await redirect('/login')
  }
  if (needsEmailVerification(session.user)) {
    await redirect('/register/check-email')
  }
  if (session.user.profileComplete) {
    await redirect(session.user.accountStatus === 'ACTIVE' ? '/dashboard' : '/account/pending')
  }

  const locale = await getLocale()
  const requestHeaders = await headers()
  const defaultLocation = resolveDefaultInvestorLocation({
    locale,
    countryCode: getRequestCountryCode(requestHeaders),
  })

  return <CompleteProfileClient defaultLocation={defaultLocation} />
}
