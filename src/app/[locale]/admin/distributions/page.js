import ReturnsSectionPage from '../returns/ReturnsSectionPage'

export default async function DistributionsAdminPage({ searchParams }) {
  const params = (await searchParams) || {}
  return <ReturnsSectionPage section="distributions" searchParams={params} />
}
