import { PrismaClient } from '@prisma/client'
import { COMPLETED_PROJECTS_SLUG, notDeletedProperty } from '@/lib/propertyTypes'
import {
  PUBLIC_SITEMAP_PATHS,
  buildSitemapEntry,
} from '@/lib/seo'

export const revalidate = 3600

const prisma = new PrismaClient()

export default async function sitemap() {
  const entries = PUBLIC_SITEMAP_PATHS.map((item) =>
    buildSitemapEntry(item.href, {
      changeFrequency: item.changeFrequency,
      priority: item.priority,
    })
  )

  try {
    const [types, properties] = await Promise.all([
      prisma.propertyType.findMany({
        where: { deletedAt: null },
        select: { slug: true, updatedAt: true },
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.property.findMany({
        where: notDeletedProperty,
        select: { investmentId: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
      }),
    ])

    types.forEach((type) => {
      if (!type.slug || type.slug === COMPLETED_PROJECTS_SLUG) return
      entries.push(
        buildSitemapEntry(`/projects/${type.slug}`, {
          lastModified: type.updatedAt,
          changeFrequency: 'weekly',
          priority: 0.7,
        })
      )
    })

    properties.forEach((property) => {
      entries.push(
        buildSitemapEntry(`/properties/${property.investmentId}`, {
          lastModified: property.updatedAt,
          changeFrequency: 'weekly',
          priority: 0.8,
        })
      )
    })
  } catch (error) {
    console.error('Error building sitemap listings:', error)
  } finally {
    await prisma.$disconnect()
  }

  return entries
}
