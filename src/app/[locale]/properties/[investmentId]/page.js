import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import PropertyDetailsClient from './PropertyDetailsClient'
import { enrichPropertyWithFunding } from '@/lib/propertyFunding'
import { propertyTypeInclude, toClientProperty } from '@/lib/propertyTypes'
import { userHasActiveHolding } from '@/lib/fundingContributions'

const prisma = new PrismaClient()

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
