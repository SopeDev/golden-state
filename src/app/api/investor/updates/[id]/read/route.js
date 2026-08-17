import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { canAccessPortfolio } from '@/lib/auth/userStatus'

const prisma = new PrismaClient()

export async function POST(_request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (session.user.type === 'ADMIN' || !canAccessPortfolio(session.user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const userId = Number(session.user.id)
    const existing = await prisma.investorUpdate.findFirst({
      where: { id, userId },
      select: { id: true, readAt: true },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (!existing.readAt) {
      await prisma.investorUpdate.update({
        where: { id: existing.id },
        data: { readAt: new Date() },
      })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error marking investor update read:', error)
    return NextResponse.json({ error: 'Failed to mark update read' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
