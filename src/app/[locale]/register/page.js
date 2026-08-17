import { getServerSession } from 'next-auth'
import { getTranslations } from 'next-intl/server'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from '@/i18n/navigation'
import { SITE_NAME, buildPageMetadata } from '@/lib/seo'
import Form from './form'

export async function generateMetadata({ params }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Register' })

  return buildPageMetadata({
    locale,
    path: '/register',
    title: `${t('title')} | ${SITE_NAME}`,
    description: t('subtitle'),
  })
}

export default async function RegisterPage() {
  const session = await getServerSession(authOptions)

  if (session?.user) {
    await redirect('/dashboard')
  }

  return <Form />
}
