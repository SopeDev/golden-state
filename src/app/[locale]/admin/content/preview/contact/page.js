import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from '@/i18n/navigation'
import ContactPreviewClient from './ContactPreviewClient'

export default async function ContactPreviewPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user?.type !== 'ADMIN') {
    await redirect('/')
  }

  return <ContactPreviewClient />
}
