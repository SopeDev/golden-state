import AboutPage from '@/components/About/AboutPage'
import { getAboutContent } from '@/lib/pageContent'
import { buildPageMetadata } from '@/lib/seo'

export async function generateMetadata({ params }) {
  const { locale } = await params
  const aboutContent = await getAboutContent(locale)

  return buildPageMetadata({
    locale,
    path: '/about',
    title: aboutContent.metaTitle,
    description: aboutContent.metaDescription,
  })
}

export default async function AboutRoute({ params }) {
  const { locale } = await params
  const aboutContent = await getAboutContent(locale)

  return <AboutPage content={aboutContent} />
}
