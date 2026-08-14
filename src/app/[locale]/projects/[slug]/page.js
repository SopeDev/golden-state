import { PrismaClient } from '@prisma/client'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import ProjectsClient from '../ProjectsClient'
import {
  activeProjectWhere,
  completedProjectWhere,
  getPropertyTypeBySlug,
  isCompletedProjectsSlug,
  notDeletedProperty,
  propertyTypeInclude,
  slugToHeaderKey,
  toClientProperties,
} from '@/lib/projectTypes'
import { attachFundingToProperties } from '@/lib/propertyFunding'

const prisma = new PrismaClient()

export async function generateMetadata({ params }) {
  const { slug, locale } = await params

  if (isCompletedProjectsSlug(slug)) {
    const t = await getTranslations({ locale, namespace: 'Projects' })
    return {
      title: t('headers.completed.metaTitle'),
      description: t('headers.completed.metaDescription'),
    }
  }

  const propertyType = await getPropertyTypeBySlug(prisma, slug)
  if (!propertyType) {
    return { title: 'Projects' }
  }

  const headerKey = slugToHeaderKey[slug]
  if (headerKey) {
    const t = await getTranslations({ locale, namespace: 'Projects' })
    return {
      title: t(`headers.${headerKey}.metaTitle`),
      description: t(`headers.${headerKey}.metaDescription`),
    }
  }

  return {
    title: `${propertyType.labelEn} | Projects`,
    description: locale === 'es' ? propertyType.descriptionEs : propertyType.descriptionEn,
  }
}

export default async function ProjectsByTypePage({ params }) {
  const { slug, locale } = await params
  const isCompleted = isCompletedProjectsSlug(slug)

  let propertyType = null
  if (!isCompleted) {
    propertyType = await getPropertyTypeBySlug(prisma, slug)
    if (!propertyType) {
      await prisma.$disconnect()
      notFound()
    }
  }

  const headerKey = slugToHeaderKey[slug]
  // New DB-managed types have no i18n header key — fall back to their DB label/description.
  const fallbackHeader = !headerKey && propertyType
    ? {
        title: locale === 'es' ? propertyType.labelEs : propertyType.labelEn,
        subtitle: locale === 'es' ? propertyType.descriptionEs : propertyType.descriptionEn,
      }
    : null

  let properties = []
  try {
    if (isCompleted) {
      properties = await prisma.property.findMany({
        where: { ...notDeletedProperty, ...completedProjectWhere },
        include: propertyTypeInclude,
        orderBy: { updatedAt: 'desc' },
      })
    } else {
      properties = await prisma.property.findMany({
        where: {
          ...notDeletedProperty,
          typeId: propertyType.id,
          ...activeProjectWhere,
        },
        include: propertyTypeInclude,
        orderBy: { createdAt: 'desc' },
      })
    }
    properties = await attachFundingToProperties(prisma, toClientProperties(properties))
  } catch (error) {
    console.error('Error fetching properties:', error)
  } finally {
    await prisma.$disconnect()
  }

  return (
    <ProjectsClient
      properties={properties}
      variant="filtered"
      headerKey={headerKey}
      fallbackHeader={fallbackHeader}
    />
  )
}
