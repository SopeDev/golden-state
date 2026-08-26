import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'
import { hasOperatorPermission, OPERATOR_PERMISSIONS as P } from '@/lib/operatorPermissions'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['ADMIN', 'OPERATOR'].includes(session.user?.type)) {
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
          OR: [
            { accountStatus: 'PENDING_ADMIN' },
            { accreditedStatus: 'PENDING_REVIEW' },
          ],
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
      pendingApproval: hasOperatorPermission(session.user, P.VIEW_INVESTORS) ? pendingApproval : 0,
      meetingRequests: hasOperatorPermission(session.user, P.MANAGE_INVESTMENT_REQUESTS) ? meetingRequests : 0,
      pendingDeposits: hasOperatorPermission(session.user, P.VIEW_FINANCIAL_ACTIVITY) ? pendingDeposits : 0,
      pendingCashOuts: hasOperatorPermission(session.user, P.VIEW_RETURN_ACTIVITY) ? pendingCashOuts : 0,
      pendingReinvests: hasOperatorPermission(session.user, P.VIEW_RETURN_ACTIVITY) ? pendingReinvests : 0,
    })
  } catch (error) {
    console.error('Pending count error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
