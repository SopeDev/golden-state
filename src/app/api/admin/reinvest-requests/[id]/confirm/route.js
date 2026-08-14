import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { contributionInclude } from '@/lib/fundingContributions'
import { reinvestRequestInclude } from '@/lib/investorWallet'
import {
  assertContributionFitsGoal,
  syncPropertyFundingStatus,
} from '@/lib/propertyFunding'

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
      return NextResponse.json({ error: 'Only pending requests can be confirmed' }, { status: 400 })
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

    await syncPropertyFundingStatus(prisma, row.destinationPropertyId)

    const full = await prisma.reinvestRequest.findUnique({
      where: { id },
      include: reinvestRequestInclude,
    })

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
