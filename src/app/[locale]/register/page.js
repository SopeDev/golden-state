import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from '@/i18n/navigation'
import Form from './form'

export default async function RegisterPage() {
  const session = await getServerSession(authOptions)

  if (session?.user) {
    await redirect('/dashboard')
  }

  return <Form />
}
