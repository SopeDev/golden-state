import { redirect } from '@/i18n/navigation'

export default async function InvestmentsContributionsRedirectPage({ searchParams }) {
  const params = (await searchParams) || {}
  const propertyQuery =
    typeof params.propertyId === 'string' && params.propertyId.trim()
      ? `?propertyId=${encodeURIComponent(params.propertyId.trim())}`
      : ''
  await redirect(`/admin/contributions${propertyQuery}`)
}
