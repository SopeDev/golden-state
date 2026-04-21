import AboutPage from '@/components/About/AboutPage'
import { getAboutContent } from '@/lib/pageContent'

export async function generateMetadata({ params }) {
  const { locale } = await params
  const aboutContent = await getAboutContent(locale)

  return {
    title: aboutContent.metaTitle,
    description: aboutContent.metaDescription,
  }
}

export default async function AboutRoute({ params }) {
  const { locale } = await params
  const aboutContent = await getAboutContent(locale)

  return <AboutPage content={aboutContent} />
}
