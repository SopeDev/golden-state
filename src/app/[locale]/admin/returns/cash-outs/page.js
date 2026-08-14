import { redirect } from '@/i18n/navigation'

export default async function ReturnsCashOutsRedirectPage() {
  await redirect('/admin/cash-outs')
}
