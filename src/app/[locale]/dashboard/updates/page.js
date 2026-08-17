import { requirePortfolioAccess } from '@/lib/auth/requireSession'
import UpdatesClient from './UpdatesClient'

export default async function UpdatesPage() {
  await requirePortfolioAccess()
  return <UpdatesClient />
}
