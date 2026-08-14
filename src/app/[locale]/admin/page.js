import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from '@/i18n/navigation'
import AdminDashboardClient from './AdminDashboardClient'

export default async function AdminHomePage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user?.type !== 'ADMIN') {
    await redirect('/')
  }

  return (
    <div className="flex-1 bg-background">
      <AdminDashboardClient />
    </div>
  )
}
