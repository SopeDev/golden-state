import { PrismaClient } from '@prisma/client'
import { getTranslations } from 'next-intl/server'
import ProjectsClient from './ProjectsClient'
import {
  ACTIVE_PROPERTY_STATUSES,
  notDeletedProperty,
  propertyTypeInclude,
  toClientProperties,
} from '@/lib/projectTypes'
import { attachFundingToProperties } from '@/lib/propertyFunding'

const prisma = new PrismaClient()

export async function generateMetadata({ params }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Projects' })

  return {
    title: t('headers.all.metaTitle'),
    description: t('headers.all.metaDescription'),
  }
}

async function getProperties() {
  try {
    const properties = await prisma.property.findMany({
      where: {
        ...notDeletedProperty,
        status: { in: ACTIVE_PROPERTY_STATUSES },
      },
      include: propertyTypeInclude,
      orderBy: {
        createdAt: 'desc',
      },
    })
    return attachFundingToProperties(prisma, toClientProperties(properties))
  } catch (error) {
    console.error('Error fetching properties:', error)
    return []
  } finally {
    await prisma.$disconnect()
  }
}

export default async function ProjectsPage() {
  const properties = await getProperties()

  return <ProjectsClient properties={properties} headerKey="all" />
}
