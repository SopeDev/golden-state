import ReturnsSectionPage from '../returns/ReturnsSectionPage'

export default async function CashOutsAdminPage({ searchParams }) {
  const params = (await searchParams) || {}
  return <ReturnsSectionPage section="cashouts" searchParams={params} />
}
