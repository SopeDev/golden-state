import InvestmentsSectionPage from '../investments/InvestmentsSectionPage'

export default async function DepositsAdminPage({ searchParams }) {
  const params = (await searchParams) || {}
  return <InvestmentsSectionPage section="deposits" searchParams={params} />
}
