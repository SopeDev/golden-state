import { redirect } from '@/i18n/navigation'

export default async function ReturnsReinvestsRedirectPage() {
  await redirect('/admin/reinvests')
}
