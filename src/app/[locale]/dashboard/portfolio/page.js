import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'
import PortfolioClient from './PortfolioClient'
import { attachFundingToProperties } from '@/lib/propertyFunding'
import {
  aggregateHoldingsByProperty,
  investorHoldingWhere,
} from '@/lib/fundingContributions'
import { propertyTypeInclude, toClientProperties } from '@/lib/propertyTypes'

const prisma = new PrismaClient()

export default async function PortfolioPage() {
  const session = await getServerSession(authOptions)

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!user) {
      return <PortfolioClient investments={[]} />
    }

    const contributions = await prisma.fundingContribution.findMany({
      where: investorHoldingWhere(user.id),
      include: {
        property: { include: propertyTypeInclude },
      },
      orderBy: { createdAt: 'desc' },
    })

    const holdings = aggregateHoldingsByProperty(contributions)
    const properties = holdings.map((row) => row.property).filter(Boolean)
    const withFunding = await attachFundingToProperties(prisma, toClientProperties(properties))
    const byId = Object.fromEntries(withFunding.map((p) => [p.id, p]))

    const investments = holdings.map((row) => ({
      ...row,
      property: byId[row.propertyId] || row.property,
    }))

    return <PortfolioClient investments={investments} />
  } catch (error) {
    console.error('Error fetching portfolio:', error)
    return <PortfolioClient investments={[]} />
  } finally {
    await prisma.$disconnect()
  }
}
