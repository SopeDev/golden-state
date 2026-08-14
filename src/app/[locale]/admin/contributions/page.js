import InvestmentsSectionPage from '../investments/InvestmentsSectionPage'

export default async function ContributionsAdminPage({ searchParams }) {
  const params = (await searchParams) || {}
  return <InvestmentsSectionPage section="contributions" searchParams={params} />
}
