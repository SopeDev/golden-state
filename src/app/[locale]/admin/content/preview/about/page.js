import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from '@/i18n/navigation'
import AboutPreviewClient from './AboutPreviewClient'

export default async function AboutPreviewPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user?.type !== 'ADMIN') {
    await redirect('/')
  }

  return <AboutPreviewClient />
}
