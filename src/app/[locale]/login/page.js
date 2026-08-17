import { Suspense } from 'react'
import { getServerSession } from 'next-auth'
import { getTranslations } from 'next-intl/server'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from '@/i18n/navigation'
import { resolveLoginDestination } from '@/lib/auth/userStatus'
import { SITE_NAME, buildPageMetadata } from '@/lib/seo'
import LoginForm from './LoginForm'

export async function generateMetadata({ params }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Login' })

  return buildPageMetadata({
    locale,
    path: '/login',
    title: `${t('title')} | ${SITE_NAME}`,
    description: t('subtitle'),
    noIndex: true,
  })
}

export default async function LoginPage({ searchParams }) {
  const session = await getServerSession(authOptions)

  if (session?.user) {
    const params = await searchParams
    const callbackUrl = typeof params?.callbackUrl === 'string' ? params.callbackUrl : ''
    await redirect(resolveLoginDestination(session.user, callbackUrl))
  }

  return (
    <Suspense fallback={<div className="flex-1 bg-muted/30" />}>
      <LoginForm />
    </Suspense>
  )
}
