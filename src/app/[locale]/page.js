import { PrismaClient } from '@prisma/client'
import { getTranslations } from 'next-intl/server'
import HomePage from '@/components/Home/HomePage'
import { getHomeContent } from '@/lib/pageContent'
import {
  activeProjectWhere,
  completedProjectWhere,
  listActivePropertyTypes,
  notDeletedProperty,
  propertyTypeInclude,
  toClientProperties,
  toClientPropertyType,
} from '@/lib/projectTypes'
import { attachFundingToProperties } from '@/lib/propertyFunding'

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
    const [liveRaw, completedRaw, typesRaw] = await Promise.all([
      prisma.property.findMany({
        where: { ...notDeletedProperty, ...activeProjectWhere },
        include: propertyTypeInclude,
        orderBy: { createdAt: 'desc' },
        take: LIVE_LIMIT,
      }),
      prisma.property.findMany({
        where: { ...notDeletedProperty, ...completedProjectWhere },
        include: propertyTypeInclude,
        orderBy: { updatedAt: 'desc' },
        take: COMPLETED_LIMIT,
      }),
      listActivePropertyTypes(prisma),
    ])
    const [liveOpportunities, completedDeals] = await Promise.all([
      attachFundingToProperties(prisma, toClientProperties(liveRaw)),
      attachFundingToProperties(prisma, toClientProperties(completedRaw)),
    ])
    return {
      liveOpportunities,
      completedDeals,
      propertyTypes: typesRaw.map(toClientPropertyType),
    }
  } catch (error) {
    console.error('Error loading home data:', error)
    return { liveOpportunities: [], completedDeals: [], propertyTypes: [] }
  } finally {
    await prisma.$disconnect()
  }
}

export default async function Home({ params }) {
  const { locale } = await params
  const [content, homeData] = await Promise.all([
    getHomeContent(locale),
    loadHomeData(),
  ])

  return (
    <HomePage
      content={content}
      liveOpportunities={homeData.liveOpportunities}
      completedDeals={homeData.completedDeals}
      propertyTypes={homeData.propertyTypes}
    />
  )
}
