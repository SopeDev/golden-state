import { permanentRedirect } from '@/i18n/navigation'

/** Legacy path — activity & wallet now live at /dashboard/activity. */
export default async function InvestmentsRedirectPage() {
  await permanentRedirect('/dashboard/activity')
}
