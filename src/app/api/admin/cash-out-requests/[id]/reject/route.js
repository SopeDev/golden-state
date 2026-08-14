import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { cashOutRequestInclude } from '@/lib/investorWallet'

const prisma = new PrismaClient()

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.type !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json().catch(() => ({}))
    const adminNote = typeof body.adminNote === 'string' ? body.adminNote.trim() || null : null

    const row = await prisma.cashOutRequest.findUnique({ where: { id } })
    if (!row) {
      return NextResponse.json({ error: 'Cash-out request not found' }, { status: 404 })
    }
    if (row.status !== 'PENDING') {
      return NextResponse.json({ error: 'Only pending requests can be rejected' }, { status: 400 })
    }

    const updated = await prisma.cashOutRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        adminNote,
        reviewedAt: new Date(),
        reviewedById: Number(session.user.id) || null,
      },
      include: cashOutRequestInclude,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error rejecting cash-out:', error)
    return NextResponse.json({ error: 'Failed to reject cash-out' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
