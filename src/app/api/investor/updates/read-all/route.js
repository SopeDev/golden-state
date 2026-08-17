import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { canAccessPortfolio } from '@/lib/auth/userStatus'

const prisma = new PrismaClient()

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (session.user.type === 'ADMIN' || !canAccessPortfolio(session.user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const userId = Number(session.user.id)
    const result = await prisma.investorUpdate.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    })

    return NextResponse.json({ ok: true, updated: result.count })
  } catch (error) {
    console.error('Error marking investor updates read:', error)
    return NextResponse.json({ error: 'Failed to mark updates read' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
