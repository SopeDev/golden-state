import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { canAccessPortfolio } from '@/lib/auth/userStatus'
import { serializeInvestorUpdate } from '@/lib/investorUpdates'

const prisma = new PrismaClient()
const LIST_LIMIT = 50

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.type === 'ADMIN' || !canAccessPortfolio(session.user)) {
      return NextResponse.json({ updates: [], unreadCount: 0 })
    }

    const userId = Number(session.user.id)
    const countOnly = request.nextUrl.searchParams.get('countOnly') === '1'

    const unreadCount = await prisma.investorUpdate.count({
      where: { userId, readAt: null },
    })

    if (countOnly) {
      return NextResponse.json({ unreadCount })
    }

    const rows = await prisma.investorUpdate.findMany({
      where: { userId },
      include: { property: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      take: LIST_LIMIT,
    })

    return NextResponse.json({
      unreadCount,
      updates: rows.map(serializeInvestorUpdate),
    })
  } catch (error) {
    console.error('Error loading investor updates:', error)
    return NextResponse.json({ error: 'Failed to load updates' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
