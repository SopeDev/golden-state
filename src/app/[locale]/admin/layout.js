import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from '@/i18n/navigation'
import AdminShell from './components/AdminShell'

export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions)

  if (!session || !['ADMIN', 'OPERATOR'].includes(session.user?.type)) {
    await redirect('/')
  }

  return <AdminShell>{children}</AdminShell>
}
