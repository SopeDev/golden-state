import { Suspense } from 'react'
import { requirePortfolioAccess } from '@/lib/auth/requireSession'
import ActivityClient from './ActivityClient'

export default async function ActivityPage() {
  await requirePortfolioAccess()
  return (
    <Suspense fallback={null}>
      <ActivityClient />
    </Suspense>
  )
}
