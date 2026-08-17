import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { contributionInclude } from '@/lib/fundingContributions'
import { assertContributionFitsGoal } from '@/lib/propertyFunding'
import { syncPropertyFundingStatusWithHolderNotify } from '@/lib/investorUpdates'
import { markIntentCompleted } from '@/lib/investmentIntents'
import { resolveUserLocale } from '@/lib/auth/userLocale'
import { investorEmailSelect } from '@/lib/email/appLinks'
import { sendContributionAssignedEmail } from '@/lib/email/mailer'
import { sendSafely } from '@/lib/email/sendSafely'
import { formatUsd } from '@/lib/formatMoney'

const prisma = new PrismaClient()

const requireAdmin = async () => {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.type !== 'ADMIN') return null
  return session
}

export async function GET(request) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('propertyId')
    const userId = searchParams.get('userId')
    const source = searchParams.get('source')
    const statusParam = searchParams.get('status')
    const includeCancelled = searchParams.get('includeCancelled') === '1'

    const where = {}
    if (propertyId) where.propertyId = propertyId
    if (userId) {
      const parsedUserId = Number.parseInt(userId, 10)
      if (Number.isFinite(parsedUserId)) where.userId = parsedUserId
    }
    if (source && ['INVESTOR', 'MANUAL'].includes(source)) where.source = source
    if (!includeCancelled) {
      where.status = statusParam === 'CANCELLED' ? 'CANCELLED' : 'ACTIVE'
    } else if (statusParam && ['ACTIVE', 'CANCELLED'].includes(statusParam)) {
      where.status = statusParam
    }

    const contributions = await prisma.fundingContribution.findMany({
      where,
      include: contributionInclude,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(contributions)
  } catch (error) {
    console.error('Error listing funding contributions:', error)
    return NextResponse.json({ error: 'Failed to list contributions' }, { status: 500 })
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
    const source = body.source === 'MANUAL' ? 'MANUAL' : 'INVESTOR'
    const propertyId = body.propertyId
    const amount = Number(body.amount)
    const note = typeof body.note === 'string' ? body.note.trim() || null : null
    const label = typeof body.label === 'string' ? body.label.trim() || null : null
    const userId =
      body.userId != null && body.userId !== ''
        ? Number.parseInt(body.userId, 10)
        : null

    if (!propertyId || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: 'propertyId and a positive amount are required' },
        { status: 400 }
      )
    }

    if (source === 'INVESTOR') {
      if (!userId) {
        return NextResponse.json({ error: 'userId is required for investor contributions' }, { status: 400 })
      }
      const investor = await prisma.user.findUnique({ where: { id: userId } })
      if (!investor || investor.type !== 'INVESTOR') {
        return NextResponse.json({ error: 'Investor not found' }, { status: 404 })
      }
    }

    if (source === 'MANUAL' && !label) {
      return NextResponse.json(
        { error: 'label is required for manual contributions' },
        { status: 400 }
      )
    }

    try {
      await assertContributionFitsGoal(prisma, { propertyId, amount })
    } catch (err) {
      if (err.code === 'NOT_FOUND') {
        return NextResponse.json({ error: 'Property not found' }, { status: 404 })
      }
      if (err.code === 'OVERFUND') {
        return NextResponse.json({ error: err.message, code: err.code }, { status: 400 })
      }
      throw err
    }

    const contribution = await prisma.fundingContribution.create({
      data: {
        propertyId,
        userId: source === 'INVESTOR' ? userId : null,
        amount,
        source,
        label,
        note,
        createdByAdminId: Number(session.user.id) || null,
      },
      include: contributionInclude,
    })

    await syncPropertyFundingStatusWithHolderNotify(prisma, propertyId)

    if (source === 'INVESTOR' && userId) {
      await markIntentCompleted(prisma, { userId, propertyId })

      const investor = await prisma.user.findUnique({
        where: { id: userId },
        select: investorEmailSelect,
      })
      if (investor?.email) {
        const locale = resolveUserLocale(investor)
        await sendSafely('Contribution assigned email', () =>
          sendContributionAssignedEmail({
            to: investor.email,
            locale,
            propertyName: contribution.property?.name || 'property',
            amountLabel: formatUsd(contribution.amount),
          })
        )
      }
    }

    return NextResponse.json(contribution, { status: 201 })
  } catch (error) {
    console.error('Error creating funding contribution:', error)
    return NextResponse.json({ error: 'Failed to create contribution' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
