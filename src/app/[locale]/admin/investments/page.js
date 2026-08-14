import { redirect } from '@/i18n/navigation'
import InvestmentsSectionPage from './InvestmentsSectionPage'

export default async function InvestmentsAdminPage({ searchParams }) {
  const params = (await searchParams) || {}
  const tab = typeof params.tab === 'string' ? params.tab : ''
  const propertyQuery =
    typeof params.propertyId === 'string' && params.propertyId.trim()
      ? `?propertyId=${encodeURIComponent(params.propertyId.trim())}`
      : ''

  if (tab === 'deposits') await redirect(`/admin/deposits${propertyQuery}`)
  if (tab === 'contributions') await redirect(`/admin/contributions${propertyQuery}`)

  return <InvestmentsSectionPage section="intents" searchParams={params} />
}
