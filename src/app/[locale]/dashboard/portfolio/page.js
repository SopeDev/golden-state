import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'
import PortfolioClient from './PortfolioClient'
import { attachFundingToProperties } from '@/lib/propertyFunding'
import {
  aggregateHoldingsByProperty,
  investorHoldingWhere,
} from '@/lib/fundingContributions'
import { getPerPropertyReturnTotals } from '@/lib/investorWallet'
import { propertyTypeInclude, toClientProperties } from '@/lib/propertyTypes'

function toGrowthEvent(row, at) {
  return {
    propertyId: row.propertyId,
    amount: Number(row.amount) || 0,
    at: at instanceof Date ? at.toISOString() : at,
    status: row.status || 'ACTIVE',
  }
}

const prisma = new PrismaClient()

export default async function PortfolioPage() {
  const session = await getServerSession(authOptions)

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!user) {
      return <PortfolioClient investments={[]} growthEvents={{ contributions: [], distributions: [] }} />
    }

    const [contributions, returnTotals, distributions] = await Promise.all([
      prisma.fundingContribution.findMany({
        where: investorHoldingWhere(user.id),
        include: {
          property: { include: propertyTypeInclude },
        },
        orderBy: { createdAt: 'desc' },
      }),
      getPerPropertyReturnTotals(prisma, user.id),
      prisma.returnDistribution.findMany({
        where: { userId: user.id, status: 'ACTIVE' },
        select: {
          propertyId: true,
          amount: true,
          distributedAt: true,
          createdAt: true,
          status: true,
        },
        orderBy: { distributedAt: 'asc' },
      }),
    ])

    const returnsByProperty = Object.fromEntries(
      returnTotals.map((row) => [row.propertyId, row.totalReturns])
    )

    const holdings = aggregateHoldingsByProperty(contributions)
    const properties = holdings.map((row) => row.property).filter(Boolean)
    const withFunding = await attachFundingToProperties(prisma, toClientProperties(properties))
    const byId = Object.fromEntries(withFunding.map((p) => [p.id, p]))

    const investments = holdings.map((row) => ({
      ...row,
      property: byId[row.propertyId] || row.property,
      totalReturns: returnsByProperty[row.propertyId] || 0,
    }))

    const growthEvents = {
      contributions: contributions.map((row) => toGrowthEvent(row, row.createdAt)),
      distributions: distributions.map((row) =>
        toGrowthEvent(row, row.distributedAt || row.createdAt)
      ),
    }

    return <PortfolioClient investments={investments} growthEvents={growthEvents} />
  } catch (error) {
    console.error('Error fetching portfolio:', error)
    return (
      <PortfolioClient investments={[]} growthEvents={{ contributions: [], distributions: [] }} />
    )
  } finally {
    await prisma.$disconnect()
  }
}
