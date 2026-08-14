import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import {
  canVoidDistribution,
  getWalletBalance,
  returnDistributionInclude,
} from '@/lib/investorWallet'

const prisma = new PrismaClient()

export async function POST(_request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.type !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const row = await prisma.returnDistribution.findUnique({ where: { id } })
    if (!row) {
      return NextResponse.json({ error: 'Distribution not found' }, { status: 404 })
    }
    if (row.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Only active distributions can be voided' }, { status: 400 })
    }

    const balance = await getWalletBalance(prisma, row.userId)
    if (!canVoidDistribution(balance.available, row.amount)) {
      return NextResponse.json(
        {
          error:
            'Cannot void: amount already reserved or paid out. Reject pending requests first.',
          code: 'ALREADY_SPENT',
          available: balance.available,
        },
        { status: 400 }
      )
    }

    const updated = await prisma.returnDistribution.update({
      where: { id },
      data: {
        status: 'VOIDED',
        voidedAt: new Date(),
      },
      include: returnDistributionInclude,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error voiding return distribution:', error)
    return NextResponse.json({ error: 'Failed to void distribution' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
