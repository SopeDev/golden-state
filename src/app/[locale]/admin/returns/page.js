import { redirect } from '@/i18n/navigation'

export default async function ReturnsAdminPage({ searchParams }) {
  const params = (await searchParams) || {}
  const tab = typeof params.tab === 'string' ? params.tab : ''

  if (tab === 'cashouts') await redirect('/admin/cash-outs')
  if (tab === 'reinvests') await redirect('/admin/reinvests')

  await redirect('/admin/distributions')
}
