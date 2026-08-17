import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { cashOutRequestInclude, toClientCashOutRequest } from '@/lib/investorWallet'
import { resolveUserLocale } from '@/lib/auth/userLocale'
import { investorEmailSelect } from '@/lib/email/appLinks'
import { sendCashOutReviewedEmail } from '@/lib/email/mailer'
import { sendSafely } from '@/lib/email/sendSafely'
import { formatUsd } from '@/lib/formatMoney'

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

    const investor = await prisma.user.findUnique({
      where: { id: updated.userId },
      select: investorEmailSelect,
    })
    if (investor?.email) {
      const locale = resolveUserLocale(investor)
      await sendSafely('Cash-out rejected email', () =>
        sendCashOutReviewedEmail({
          to: investor.email,
          locale,
          confirmed: false,
          amountLabel: formatUsd(updated.amount),
          adminNote,
        })
      )
    }

    return NextResponse.json(toClientCashOutRequest(updated))
  } catch (error) {
    console.error('Error rejecting cash-out:', error)
    return NextResponse.json({ error: 'Failed to reject cash-out' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
