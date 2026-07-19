import { PrismaClient } from '@prisma/client'
import { getTranslations } from 'next-intl/server'
import HomePage from '@/components/Home/HomePage'
import { getHomeContent } from '@/lib/pageContent'

const prisma = new PrismaClient()

const LIVE_LIMIT = 3
const COMPLETED_LIMIT = 3

export async function generateMetadata({ params }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Home' })

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  }
}

async function loadHomeData() {
  try {
    const [liveOpportunities, completedDeals] = await Promise.all([
      prisma.property.findMany({
        where: { status: { in: ['PLANNING', 'IN_PROGRESS'] } },
        orderBy: { createdAt: 'desc' },
        take: LIVE_LIMIT,
      }),
      prisma.property.findMany({
        where: { status: 'COMPLETED' },
        orderBy: { updatedAt: 'desc' },
        take: COMPLETED_LIMIT,
      }),
    ])
    return { liveOpportunities, completedDeals }
  } catch (error) {
    console.error('Error loading home data:', error)
    return { liveOpportunities: [], completedDeals: [] }
  } finally {
    await prisma.$disconnect()
  }
}

export default async function Home({ params }) {
  const { locale } = await params
  const [content, { liveOpportunities, completedDeals }] = await Promise.all([
    getHomeContent(locale),
    loadHomeData(),
  ])

  return (
    <HomePage
      content={content}
      liveOpportunities={liveOpportunities}
      completedDeals={completedDeals}
    />
  )
}
