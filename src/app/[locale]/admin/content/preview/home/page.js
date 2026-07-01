import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from '@/i18n/navigation'
import HomePreviewClient from './HomePreviewClient'

export default async function HomePreviewPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user?.type !== 'ADMIN') {
    await redirect('/')
  }

  return <HomePreviewClient />
}
