import { requirePortfolioAccess } from '@/lib/auth/requireSession'
import ActivityClient from './ActivityClient'

export default async function ActivityPage() {
  await requirePortfolioAccess()
  return <ActivityClient />
}
