import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { contributionInclude } from '@/lib/fundingContributions'
import { reinvestRequestInclude } from '@/lib/investorWallet'
import {
  assertContributionFitsGoal,
  getEffectiveMinInvestment,
  getPropertyFundedAmount,
} from '@/lib/propertyFunding'
import { formatMoneyAmount, formatUsd } from '@/lib/formatMoney'
import { syncPropertyFundingStatusWithHolderNotify } from '@/lib/investorUpdates'
import { resolveUserLocale } from '@/lib/auth/userLocale'
import { investorEmailSelect } from '@/lib/email/appLinks'
import { sendReinvestReviewedEmail } from '@/lib/email/mailer'
import { sendSafely } from '@/lib/email/sendSafely'

const prisma = new PrismaClient()

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['ADMIN', 'OPERATOR'].includes(session.user?.type)) {
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
      return NextResponse.json({ error: 'Only pending requests can be confirmed' }, { status: 400 })
    }

    const property = await prisma.property.findUnique({
      where: { id: row.destinationPropertyId },
      select: { price: true },
    })
    const funded = await getPropertyFundedAmount(prisma, row.destinationPropertyId)
    const minTicket = getEffectiveMinInvestment({
      goal: property?.price,
      fundedAmount: funded,
    })
    if (row.amount < minTicket) {
      return NextResponse.json(
        {
          error: `Amount must be at least $${formatMoneyAmount(minTicket)}`,
          code: 'BELOW_MIN',
        },
        { status: 400 }
      )
    }

    try {
      await assertContributionFitsGoal(prisma, {
        propertyId: row.destinationPropertyId,
        amount: row.amount,
      })
    } catch (err) {
      if (err.code === 'OVERFUND' || err.code === 'NOT_FOUND') {
        return NextResponse.json({ error: err.message, code: err.code }, { status: 400 })
      }
      throw err
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.reinvestRequest.update({
        where: { id },
        data: {
          status: 'CONFIRMED',
          adminNote,
          reviewedAt: new Date(),
          reviewedById: Number(session.user.id) || null,
        },
      })

      const contribution = await tx.fundingContribution.create({
        data: {
          propertyId: row.destinationPropertyId,
          userId: row.userId,
          amount: row.amount,
          source: 'INVESTOR',
          note: 'Reinvestment from wallet returns',
          createdByAdminId: Number(session.user.id) || null,
          reinvestmentRequestId: row.id,
        },
        include: contributionInclude,
      })

      return { request: updated, contribution }
    })

    await syncPropertyFundingStatusWithHolderNotify(prisma, row.destinationPropertyId)

    const full = await prisma.reinvestRequest.findUnique({
      where: { id },
      include: reinvestRequestInclude,
    })

    const investor = await prisma.user.findUnique({
      where: { id: row.userId },
      select: investorEmailSelect,
    })
    if (investor?.email) {
      const locale = resolveUserLocale(investor)
      await sendSafely('Reinvest confirmed email', () =>
        sendReinvestReviewedEmail({
          to: investor.email,
          locale,
          confirmed: true,
          propertyName: full?.destinationProperty?.name || 'property',
          amountLabel: formatUsd(row.amount),
          adminNote,
        })
      )
    }

    return NextResponse.json({
      request: full,
      contribution: result.contribution,
    })
  } catch (error) {
    console.error('Error confirming reinvest:', error)
    return NextResponse.json({ error: 'Failed to confirm reinvest' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
