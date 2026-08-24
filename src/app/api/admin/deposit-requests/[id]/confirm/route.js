import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { depositRequestInclude, toClientDepositRequest } from '@/lib/depositRequests'
import { contributionInclude } from '@/lib/fundingContributions'
import { markIntentCompleted } from '@/lib/investmentIntents'
import { assertContributionFitsGoal } from '@/lib/propertyFunding'
import { syncPropertyFundingStatusWithHolderNotify } from '@/lib/investorUpdates'
import { resolveUserLocale } from '@/lib/auth/userLocale'
import { investorEmailSelect } from '@/lib/email/appLinks'
import { sendDepositConfirmedEmail } from '@/lib/email/mailer'
import { sendSafely } from '@/lib/email/sendSafely'
import { formatUsd } from '@/lib/formatMoney'

const prisma = new PrismaClient()

export async function POST(_request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['ADMIN', 'OPERATOR'].includes(session.user?.type)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const deposit = await prisma.depositRequest.findUnique({ where: { id } })
    if (!deposit) {
      return NextResponse.json({ error: 'Deposit not found' }, { status: 404 })
    }
    if (deposit.status !== 'PENDING') {
      return NextResponse.json({ error: 'Only pending deposits can be confirmed' }, { status: 400 })
    }

    try {
      await assertContributionFitsGoal(prisma, {
        propertyId: deposit.propertyId,
        amount: deposit.amount,
      })
    } catch (err) {
      if (err.code === 'OVERFUND') {
        return NextResponse.json({ error: err.message, code: err.code }, { status: 400 })
      }
      throw err
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.depositRequest.update({
        where: { id },
        data: {
          status: 'CONFIRMED',
          reviewedAt: new Date(),
          reviewedById: Number(session.user.id) || null,
        },
      })

      const contribution = await tx.fundingContribution.create({
        data: {
          propertyId: deposit.propertyId,
          userId: deposit.userId,
          amount: deposit.amount,
          source: 'INVESTOR',
          note: deposit.reference ? `Wire ref: ${deposit.reference}` : null,
          createdByAdminId: Number(session.user.id) || null,
          depositRequestId: deposit.id,
        },
        include: contributionInclude,
      })

      return { deposit: updated, contribution }
    })

    await syncPropertyFundingStatusWithHolderNotify(prisma, deposit.propertyId)
    await markIntentCompleted(prisma, {
      userId: deposit.userId,
      propertyId: deposit.propertyId,
    })

    const fullDeposit = await prisma.depositRequest.findUnique({
      where: { id },
      include: depositRequestInclude,
    })

    const investor = await prisma.user.findUnique({
      where: { id: deposit.userId },
      select: investorEmailSelect,
    })
    if (investor?.email) {
      const locale = resolveUserLocale(investor)
      await sendSafely('Deposit confirmed email', () =>
        sendDepositConfirmedEmail({
          to: investor.email,
          locale,
          propertyName: fullDeposit?.property?.name || 'property',
          amountLabel: formatUsd(deposit.amount),
        })
      )
    }

    return NextResponse.json({
      deposit: toClientDepositRequest(fullDeposit),
      contribution: result.contribution,
    })
  } catch (error) {
    console.error('Error confirming deposit:', error)
    return NextResponse.json({ error: 'Failed to confirm deposit' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

