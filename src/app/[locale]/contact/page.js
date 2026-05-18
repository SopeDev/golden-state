import { getTranslations } from 'next-intl/server'
import ContactPageClient from './ContactPageClient'

export async function generateMetadata({ params }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Contact' })

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  }
}

export default function ContactPage() {
  return <ContactPageClient />
}
