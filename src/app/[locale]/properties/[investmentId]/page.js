import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import PropertyDetailsClient from './PropertyDetailsClient'
import { enrichPropertyWithFunding } from '@/lib/propertyFunding'
import { propertyTypeInclude, toClientProperty } from '@/lib/propertyTypes'
import { userHasActiveHolding } from '@/lib/fundingContributions'
import { getLocalizedPropertySummary } from '@/lib/propertySummary'
import { SITE_NAME, buildPageMetadata } from '@/lib/seo'

const prisma = new PrismaClient()

export async function generateMetadata({ params }) {
  const { locale, investmentId } = await params
  const path = `/properties/${investmentId}`
  const parsedId = parseInt(investmentId, 10)

  if (!Number.isFinite(parsedId)) {
    return buildPageMetadata({
      locale,
      path,
      title: `Property | ${SITE_NAME}`,
      noIndex: true,
    })
  }

  try {
    const property = await prisma.property.findFirst({
      where: { investmentId: parsedId, deletedAt: null },
      select: {
        name: true,
        summary: true,
        summaryEn: true,
        summaryEs: true,
        images: true,
        city: true,
        state: true,
      },
    })

    if (!property) {
      return buildPageMetadata({
        locale,
        path,
        title: `Property | ${SITE_NAME}`,
        noIndex: true,
      })
    }

    const summary = getLocalizedPropertySummary(property, locale)
    const location = [property.city, property.state].filter(Boolean).join(', ')
    const description =
      summary || `${property.name}${location ? ` · ${location}` : ''}`

    return buildPageMetadata({
      locale,
      path,
      title: `${property.name} | ${SITE_NAME}`,
      description,
      image: property.images?.[0],
      imageAlt: property.name,
    })
  } catch (error) {
    console.error('Error building property metadata:', error)
    return buildPageMetadata({
      locale,
      path,
      title: `Property | ${SITE_NAME}`,
      noIndex: true,
    })
  }
}

export default async function PropertyDetailsPage({ params }) {
  const { investmentId } = await params

  try {
    const property = await prisma.property.findFirst({
      where: {
        investmentId: parseInt(investmentId, 10),
        deletedAt: null,
      },
      include: propertyTypeInclude,
    })

    if (!property) {
      return <PropertyDetailsClient property={null} />
    }

    const [enrichedProperty, session] = await Promise.all([
      enrichPropertyWithFunding(prisma, toClientProperty(property)),
      getServerSession(authOptions),
    ])
    const userId = session?.user?.id ? Number(session.user.id) : null
    const canViewProgressDocuments = userId
      ? await userHasActiveHolding(prisma, { userId, propertyId: property.id })
      : false

    return (
      <PropertyDetailsClient
        property={enrichedProperty}
        canViewProgressDocuments={canViewProgressDocuments}
      />
    )
  } catch (error) {
    console.error('Error fetching property:', error)
    return <PropertyDetailsClient property={null} />
  } finally {
    await prisma.$disconnect()
  }
}
