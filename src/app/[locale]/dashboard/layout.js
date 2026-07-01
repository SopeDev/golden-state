import { requireAuthenticated } from '@/lib/auth/requireSession'

export default async function DashboardLayout({ children }) {
  await requireAuthenticated()
  return children
}
