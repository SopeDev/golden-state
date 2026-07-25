import { PrismaClient } from '@prisma/client'
import PropertyDetailsClient from './PropertyDetailsClient'
import { withFundingFields, getPropertyFundedAmount } from '@/lib/propertyFunding'
import { propertyTypeInclude, toClientProperty } from '@/lib/propertyTypes'

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

    const fundedAmount = await getPropertyFundedAmount(prisma, property.id)
    return (
      <PropertyDetailsClient
        property={withFundingFields(toClientProperty(property), fundedAmount)}
      />
    )
  } catch (error) {
    console.error('Error fetching property:', error)
    return <PropertyDetailsClient property={null} />
  } finally {
    await prisma.$disconnect()
  }
}
