import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { investorHoldingWhere } from '@/lib/fundingContributions'

const prisma = new PrismaClient()

/**
 * Properties where the investor has an active holding — used by admin assign form.
 */
export async function GET(_request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['ADMIN', 'OPERATOR'].includes(session.user?.type)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId: userIdParam } = await params
    const userId = Number.parseInt(userIdParam, 10)
    if (!Number.isFinite(userId)) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const holdings = await prisma.fundingContribution.findMany({
      where: investorHoldingWhere(userId),
      select: {
        propertyId: true,
        property: {
          select: {
            id: true,
            name: true,
            investmentId: true,
            status: true,
            city: true,
            state: true,
          },
        },
      },
    })

    const byId = new Map()
    for (const row of holdings) {
      if (row.property && !byId.has(row.property.id)) {
        byId.set(row.property.id, row.property)
      }
    }

    return NextResponse.json(Array.from(byId.values()))
  } catch (error) {
    console.error('Error listing investor holdings:', error)
    return NextResponse.json({ error: 'Failed to list holdings' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
