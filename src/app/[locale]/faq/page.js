import { getFaqContent } from '@/lib/pageContent'
import { buildFaqSectionsFromContent } from '@/lib/faqItems'
import FaqPageClient from './FaqPageClient'

export async function generateMetadata({ params }) {
  const { locale } = await params
  const content = await getFaqContent(locale)

  return {
    title: content.metaTitle,
    description: content.metaDescription,
  }
}

export default async function FaqPage({ params }) {
  const { locale } = await params
  const content = await getFaqContent(locale)
  const sections = buildFaqSectionsFromContent(content)

  return <FaqPageClient content={content} sections={sections} />
}
