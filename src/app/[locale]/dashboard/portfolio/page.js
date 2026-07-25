import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'
import PortfolioClient from './PortfolioClient'
import { attachFundingToProperties } from '@/lib/propertyFunding'
import { propertyTypeInclude, toClientProperties } from '@/lib/propertyTypes'

const prisma = new PrismaClient()

export default async function PortfolioPage() {
  const session = await getServerSession(authOptions)

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        investments: {
          include: {
            property: { include: propertyTypeInclude },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    if (!user) {
      return <PortfolioClient investments={[]} />
    }

    const properties = user.investments.map((row) => row.property).filter(Boolean)
    const withFunding = await attachFundingToProperties(prisma, toClientProperties(properties))
    const byId = Object.fromEntries(withFunding.map((p) => [p.id, p]))

    const investments = user.investments.map((row) => ({
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
