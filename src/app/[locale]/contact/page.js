import ContactPageClient from './ContactPageClient'
import { getContactContent } from '@/lib/pageContent'

export async function generateMetadata({ params }) {
  const { locale } = await params
  const contactContent = await getContactContent(locale)

  return {
    title: contactContent.metaTitle,
    description: contactContent.metaDescription,
  }
}

export default async function ContactPage({ params }) {
  const { locale } = await params
  const contactContent = await getContactContent(locale)

  return <ContactPageClient content={contactContent} />
}
