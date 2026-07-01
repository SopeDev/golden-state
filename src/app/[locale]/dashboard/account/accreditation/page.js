import { requireActiveInvestor } from '@/lib/auth/requireActiveInvestor'
import AccountAccreditationClient from './AccountAccreditationClient'

export default async function AccountAccreditationPage() {
  await requireActiveInvestor()
  return <AccountAccreditationClient />
}
