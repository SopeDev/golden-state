import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from '@/i18n/navigation'
import FaqPreviewClient from './FaqPreviewClient'

export default async function FaqPreviewPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user?.type !== 'ADMIN') {
    redirect('/')
  }

  return <FaqPreviewClient />
}
