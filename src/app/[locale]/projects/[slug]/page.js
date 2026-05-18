import { PrismaClient } from '@prisma/client'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import ProjectsClient from '../ProjectsClient'
import { isValidProjectFilterSlug, slugToHeaderKey, slugToPropertyType } from '@/lib/projectTypes'

const prisma = new PrismaClient()

export async function generateMetadata({ params }) {
  const { slug, locale } = await params

  if (!isValidProjectFilterSlug(slug)) {
    return { title: 'Projects' }
  }

  const headerKey = slugToHeaderKey[slug]
  const t = await getTranslations({ locale, namespace: 'Projects' })

  return {
    title: t(`headers.${headerKey}.metaTitle`),
    description: t(`headers.${headerKey}.metaDescription`),
  }
}

export default async function ProjectsByTypePage({ params }) {
  const { slug } = await params

  if (!isValidProjectFilterSlug(slug)) {
    notFound()
  }

  const propertyType = slugToPropertyType[slug]
  const headerKey = slugToHeaderKey[slug]

  let properties = []
  try {
    properties = await prisma.property.findMany({
      where: { type: propertyType },
      orderBy: { createdAt: 'desc' },
    })
  } catch (error) {
    console.error('Error fetching properties:', error)
  } finally {
    await prisma.$disconnect()
  }

  return <ProjectsClient properties={properties} variant="filtered" headerKey={headerKey} />
}
