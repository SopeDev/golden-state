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
import { storeTransferReceipt, validateReceiptFile } from '@/lib/transferReceipts'

const prisma = new PrismaClient()

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.type !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const formData = await request.formData()
    const adminNoteRaw = formData.get('adminNote')
    const adminNote =
      typeof adminNoteRaw === 'string' ? adminNoteRaw.trim() || null : null
    const receipt = formData.get('receipt')
    const receiptError = validateReceiptFile(receipt)
    if (receiptError.error) {
      return NextResponse.json({ error: receiptError.error }, { status: 400 })
    }

    const row = await prisma.cashOutRequest.findUnique({ where: { id } })
    if (!row) {
      return NextResponse.json({ error: 'Cash-out request not found' }, { status: 404 })
    }
    if (row.status !== 'PENDING') {
      return NextResponse.json({ error: 'Only pending requests can be confirmed' }, { status: 400 })
    }

    const stored = await storeTransferReceipt({
      prefix: 'cash-out-receipts',
      userId: row.userId,
      file: receipt,
    })

    const updated = await prisma.cashOutRequest.update({
      where: { id },
      data: {
        status: 'CONFIRMED',
        adminNote,
        reviewedAt: new Date(),
        reviewedById: Number(session.user.id) || null,
        receiptStorageKey: stored.receiptStorageKey,
        receiptFileName: stored.receiptFileName,
        receiptMimeType: stored.receiptMimeType,
      },
      include: cashOutRequestInclude,
    })

    const investor = await prisma.user.findUnique({
      where: { id: updated.userId },
      select: investorEmailSelect,
    })
    if (investor?.email) {
      const locale = resolveUserLocale(investor)
      await sendSafely('Cash-out confirmed email', () =>
        sendCashOutReviewedEmail({
          to: investor.email,
          locale,
          confirmed: true,
          amountLabel: formatUsd(updated.amount),
          adminNote,
        })
      )
    }

    return NextResponse.json(toClientCashOutRequest(updated))
  } catch (error) {
    console.error('Error confirming cash-out:', error)
    return NextResponse.json({ error: 'Failed to confirm cash-out' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
