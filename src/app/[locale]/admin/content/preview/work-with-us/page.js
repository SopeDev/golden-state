import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from '@/i18n/navigation'
import WorkWithUsPreviewClient from './WorkWithUsPreviewClient'

export default async function WorkWithUsPreviewPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user?.type !== 'ADMIN') {
    await redirect('/')
  }

  return <WorkWithUsPreviewClient />
}
