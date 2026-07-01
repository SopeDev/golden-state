import { redirect } from '@/i18n/navigation'
import { ACCOUNT_STATUS } from '@/lib/auth/userStatus'
import { requireAuthenticated } from '@/lib/auth/requireSession'

export async function requireActiveInvestor() {
  const session = await requireAuthenticated()

  if (session.user.type === 'ADMIN') {
    return session
  }

  if (session.user.accountStatus !== ACCOUNT_STATUS.ACTIVE) {
    await redirect('/dashboard/account')
  }

  return session
}

