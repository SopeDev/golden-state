import ReturnsSectionPage from '../returns/ReturnsSectionPage'

export default async function ReinvestsAdminPage({ searchParams }) {
  const params = (await searchParams) || {}
  return <ReturnsSectionPage section="reinvests" searchParams={params} />
}
