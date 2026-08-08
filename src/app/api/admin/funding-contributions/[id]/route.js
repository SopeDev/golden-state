import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { contributionInclude } from '@/lib/fundingContributions'
import {
  assertContributionFitsGoal,
  syncPropertyFundingStatus,
} from '@/lib/propertyFunding'

const prisma = new PrismaClient()

const requireAdmin = async () => {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.type !== 'ADMIN') return null
  return session
}

export async function PATCH(request, { params }) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const existing = await prisma.fundingContribution.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Contribution not found' }, { status: 404 })
    }
    if (existing.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Only active contributions can be edited' }, { status: 400 })
    }

    const body = await request.json()
    const data = {}

    if (body.amount != null) {
      const amount = Number(body.amount)
      if (!Number.isFinite(amount) || amount <= 0) {
        return NextResponse.json({ error: 'amount must be a positive number' }, { status: 400 })
      }
      try {
        await assertContributionFitsGoal(prisma, {
          propertyId: existing.propertyId,
          amount,
          excludeContributionId: existing.id,
        })
      } catch (err) {
        if (err.code === 'OVERFUND') {
          return NextResponse.json({ error: err.message, code: err.code }, { status: 400 })
        }
        throw err
      }
      data.amount = amount
    }

    if (typeof body.note === 'string') {
      data.note = body.note.trim() || null
    }
    if (typeof body.label === 'string') {
      data.label = body.label.trim() || null
    }
    if (existing.source === 'MANUAL' && data.label === null) {
      return NextResponse.json({ error: 'label is required for manual contributions' }, { status: 400 })
    }

    const contribution = await prisma.fundingContribution.update({
      where: { id },
      data,
      include: contributionInclude,
    })

    await syncPropertyFundingStatus(prisma, existing.propertyId)

    return NextResponse.json(contribution)
  } catch (error) {
    console.error('Error updating funding contribution:', error)
    return NextResponse.json({ error: 'Failed to update contribution' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function DELETE(_request, { params }) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const existing = await prisma.fundingContribution.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Contribution not found' }, { status: 404 })
    }
    if (existing.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Contribution already cancelled' }, { status: 400 })
    }

    const contribution = await prisma.fundingContribution.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
      include: contributionInclude,
    })

    await syncPropertyFundingStatus(prisma, existing.propertyId)

    return NextResponse.json(contribution)
  } catch (error) {
    console.error('Error cancelling funding contribution:', error)
    return NextResponse.json({ error: 'Failed to cancel contribution' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
