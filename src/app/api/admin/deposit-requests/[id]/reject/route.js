import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { depositRequestInclude } from '@/lib/depositRequests'

const prisma = new PrismaClient()

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.type !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const deposit = await prisma.depositRequest.findUnique({ where: { id } })
    if (!deposit) {
      return NextResponse.json({ error: 'Deposit not found' }, { status: 404 })
    }
    if (deposit.status !== 'PENDING') {
      return NextResponse.json({ error: 'Only pending deposits can be rejected' }, { status: 400 })
    }

    const body = await request.json().catch(() => ({}))
    const adminNote = typeof body.adminNote === 'string' ? body.adminNote.trim() || null : null

    const updated = await prisma.depositRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        adminNote,
        reviewedAt: new Date(),
        reviewedById: Number(session.user.id) || null,
      },
      include: depositRequestInclude,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error rejecting deposit:', error)
    return NextResponse.json({ error: 'Failed to reject deposit' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
