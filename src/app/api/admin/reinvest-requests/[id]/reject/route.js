import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { reinvestRequestInclude } from '@/lib/investorWallet'
import { resolveUserLocale } from '@/lib/auth/userLocale'
import { investorEmailSelect } from '@/lib/email/appLinks'
import { sendReinvestReviewedEmail } from '@/lib/email/mailer'
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

    const row = await prisma.reinvestRequest.findUnique({ where: { id } })
    if (!row) {
      return NextResponse.json({ error: 'Reinvest request not found' }, { status: 404 })
    }
    if (row.status !== 'PENDING') {
      return NextResponse.json({ error: 'Only pending requests can be rejected' }, { status: 400 })
    }

    const updated = await prisma.reinvestRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        adminNote,
        reviewedAt: new Date(),
        reviewedById: Number(session.user.id) || null,
      },
      include: reinvestRequestInclude,
    })

    const investor = await prisma.user.findUnique({
      where: { id: updated.userId },
      select: investorEmailSelect,
    })
    if (investor?.email) {
      const locale = resolveUserLocale(investor)
      await sendSafely('Reinvest rejected email', () =>
        sendReinvestReviewedEmail({
          to: investor.email,
          locale,
          confirmed: false,
          propertyName: updated.destinationProperty?.name || 'property',
          amountLabel: formatUsd(updated.amount),
          adminNote,
        })
      )
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error rejecting reinvest:', error)
    return NextResponse.json({ error: 'Failed to reject reinvest' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
