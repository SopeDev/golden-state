import { getTranslations } from 'next-intl/server'
import AboutPage from '@/components/About/AboutPage'

export async function generateMetadata({ params }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'About' })

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  }
}

export default function AboutRoute() {
  return <AboutPage />
}
