import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { buildWalletSummary } from '@/lib/investorWallet'
import {
  attachFundingToProperties,
  isPropertyOpenForInvestment,
} from '@/lib/propertyFunding'
import { notDeletedProperty } from '@/lib/propertyTypes'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = Number(session.user.id)
    const summary = await buildWalletSummary(prisma, userId)

    const openProperties = await prisma.property.findMany({
      where: {
        ...notDeletedProperty,
        status: 'FUNDING',
      },
      select: {
        id: true,
        name: true,
        investmentId: true,
        slug: true,
        city: true,
        state: true,
        status: true,
        price: true,
      },
      orderBy: { investmentId: 'asc' },
    })

    const withFunding = await attachFundingToProperties(prisma, openProperties)
    const reinvestTargets = withFunding
      .filter((p) => {
        if (!isPropertyOpenForInvestment(p.status)) return false
        const remaining = Number(p.remainingCapacity) || 0
        const minTicket = Number(p.effectiveMinInvestment) || 0
        return remaining > 0 && remaining + 1e-6 >= minTicket
      })
      .map((p) => ({
        id: p.id,
        name: p.name,
        investmentId: p.investmentId,
        slug: p.slug,
        city: p.city,
        state: p.state,
        status: p.status,
        remainingCapacity: p.remainingCapacity,
        investmentGoal: p.investmentGoal,
        effectiveMinInvestment: p.effectiveMinInvestment,
      }))

    return NextResponse.json({
      ...summary,
      reinvestTargets,
    })
  } catch (error) {
    console.error('Error loading investor wallet:', error)
    return NextResponse.json({ error: 'Failed to load wallet' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
