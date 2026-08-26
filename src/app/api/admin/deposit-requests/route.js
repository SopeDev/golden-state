import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import {
  depositRequestInclude,
  toClientDepositRequest,
} from '@/lib/depositRequests'
import { contributionInclude } from '@/lib/fundingContributions'
import { markIntentCompleted } from '@/lib/investmentIntents'
import { assertContributionFitsGoal } from '@/lib/propertyFunding'
import { syncPropertyFundingStatusWithHolderNotify } from '@/lib/investorUpdates'

const prisma = new PrismaClient()

const requireAdmin = async () => {
  const session = await getServerSession(authOptions)
  if (!session || !['ADMIN', 'OPERATOR'].includes(session.user?.type)) return null
  return session
}

export async function GET(request) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const propertyId = searchParams.get('propertyId')
    const userId = searchParams.get('userId')

    const where = {}
    if (status && ['PENDING', 'CONFIRMED', 'REJECTED'].includes(status)) {
      where.status = status
    }
    if (propertyId) where.propertyId = propertyId
    if (userId) {
      const parsedUserId = Number.parseInt(userId, 10)
      if (Number.isFinite(parsedUserId)) where.userId = parsedUserId
    }

    const deposits = await prisma.depositRequest.findMany({
      where,
      include: depositRequestInclude,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(deposits.map(toClientDepositRequest))
  } catch (error) {
    console.error('Error listing deposit requests:', error)
    return NextResponse.json({ error: 'Failed to list deposits' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(request) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const userId = Number.parseInt(body.userId, 10)
    const propertyId = body.propertyId
    const amount = Number(body.amount)
    const reference = typeof body.reference === 'string' ? body.reference.trim() || null : null
    const depositedAt = body.depositedAt ? new Date(body.depositedAt) : null
    const confirmNow = body.confirmNow === true
    const adminId = Number(session.user.id) || null

    if (!userId || !propertyId || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: 'userId, propertyId, and a positive amount are required' },
        { status: 400 }
      )
    }

    const [investor, property] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.property.findUnique({ where: { id: propertyId } }),
    ])

    if (!investor || investor.type !== 'INVESTOR') {
      return NextResponse.json({ error: 'Investor not found' }, { status: 404 })
    }
    if (!property || property.deletedAt) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    try {
      await assertContributionFitsGoal(prisma, { propertyId, amount })
    } catch (err) {
      if (err.code === 'OVERFUND') {
        return NextResponse.json({ error: err.message, code: err.code }, { status: 400 })
      }
      throw err
    }

    if (confirmNow) {
      const result = await prisma.$transaction(async (tx) => {
        const deposit = await tx.depositRequest.create({
          data: {
            userId,
            propertyId,
            amount,
            reference,
            depositedAt:
              depositedAt && !Number.isNaN(depositedAt.getTime()) ? depositedAt : null,
            createdByAdminId: adminId,
            status: 'CONFIRMED',
            reviewedAt: new Date(),
            reviewedById: adminId,
          },
        })

        const contribution = await tx.fundingContribution.create({
          data: {
            propertyId,
            userId,
            amount,
            source: 'INVESTOR',
            note: reference ? `Wire ref: ${reference}` : 'Live call wire',
            createdByAdminId: adminId,
            depositRequestId: deposit.id,
          },
          include: contributionInclude,
        })

        return { deposit, contribution }
      })

      await syncPropertyFundingStatusWithHolderNotify(prisma, propertyId)
      await markIntentCompleted(prisma, { userId, propertyId })

      const fullDeposit = await prisma.depositRequest.findUnique({
        where: { id: result.deposit.id },
        include: depositRequestInclude,
      })

      return NextResponse.json(
        {
          deposit: toClientDepositRequest(fullDeposit),
          contribution: result.contribution,
        },
        { status: 201 }
      )
    }

    const deposit = await prisma.depositRequest.create({
      data: {
        userId,
        propertyId,
        amount,
        reference,
        depositedAt: depositedAt && !Number.isNaN(depositedAt.getTime()) ? depositedAt : null,
        createdByAdminId: adminId,
        status: 'PENDING',
      },
      include: depositRequestInclude,
    })

    return NextResponse.json(toClientDepositRequest(deposit), { status: 201 })
  } catch (error) {
    console.error('Error creating deposit request:', error)
    return NextResponse.json({ error: 'Failed to create deposit' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
