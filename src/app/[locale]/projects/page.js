import { PrismaClient } from '@prisma/client'
import { getTranslations } from 'next-intl/server'
import ProjectsClient from './ProjectsClient'
import { ACTIVE_PROPERTY_STATUSES } from '@/lib/projectTypes'

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
    return await prisma.property.findMany({
      where: {
        status: { in: ACTIVE_PROPERTY_STATUSES },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
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
