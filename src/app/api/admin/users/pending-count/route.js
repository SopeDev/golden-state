import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.type !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [
      pendingApproval,
      meetingRequests,
      pendingDeposits,
      pendingCashOuts,
      pendingReinvests,
    ] = await Promise.all([
      prisma.user.count({
        where: {
          type: 'INVESTOR',
          accountStatus: 'PENDING_ADMIN',
        },
      }),
      prisma.investmentIntent.count({
        where: { status: 'MEETING_REQUESTED' },
      }),
      prisma.depositRequest.count({
        where: { status: 'PENDING' },
      }),
      prisma.cashOutRequest.count({
        where: { status: 'PENDING' },
      }),
      prisma.reinvestRequest.count({
        where: { status: 'PENDING' },
      }),
    ])

    return NextResponse.json({
      pendingApproval,
      meetingRequests,
      pendingDeposits,
      pendingCashOuts,
      pendingReinvests,
    })
  } catch (error) {
    console.error('Pending count error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
