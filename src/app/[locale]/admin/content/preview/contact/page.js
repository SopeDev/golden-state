import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from '@/i18n/navigation'
import ContactPreviewClient from './ContactPreviewClient'

export default async function ContactPreviewPage() {
  const session = await getServerSession(authOptions)

  if (!session || !['ADMIN', 'OPERATOR'].includes(session.user?.type)) {
    await redirect('/')
  }

  return <ContactPreviewClient />
}
