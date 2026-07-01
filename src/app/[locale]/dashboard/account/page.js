import { requireAuthenticated } from '@/lib/auth/requireSession'
import AccountHubClient from './AccountHubClient'

export default async function AccountPage() {
  await requireAuthenticated()
  return <AccountHubClient />
}
