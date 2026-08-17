import { getFaqContent } from '@/lib/pageContent'
import { buildFaqSectionsFromContent } from '@/lib/faqItems'
import { buildPageMetadata } from '@/lib/seo'
import FaqPageClient from './FaqPageClient'

export async function generateMetadata({ params }) {
  const { locale } = await params
  const content = await getFaqContent(locale)

  return buildPageMetadata({
    locale,
    path: '/faq',
    title: content.metaTitle,
    description: content.metaDescription,
  })
}

export default async function FaqPage({ params }) {
  const { locale } = await params
  const content = await getFaqContent(locale)
  const sections = buildFaqSectionsFromContent(content)

  return <FaqPageClient content={content} sections={sections} />
}
