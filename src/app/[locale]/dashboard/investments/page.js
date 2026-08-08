import { requirePortfolioAccess } from '@/lib/auth/requireSession'
import InvestmentsClient from './InvestmentsClient'

export default async function InvestmentsPage() {
  await requirePortfolioAccess()
  return <InvestmentsClient />
}
