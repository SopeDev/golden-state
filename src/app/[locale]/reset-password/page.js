import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import { SITE_NAME, buildPageMetadata } from '@/lib/seo'
import ResetPasswordClient from './ResetPasswordClient'

export async function generateMetadata({ params }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Account' })

  return buildPageMetadata({
    locale,
    path: '/reset-password',
    title: `${t('resetTitle')} | ${SITE_NAME}`,
    noIndex: true,
  })
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex-1 bg-muted/30" />}>
      <ResetPasswordClient />
    </Suspense>
  )
}
