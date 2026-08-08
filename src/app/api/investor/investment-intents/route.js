import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import {
  investmentIntentInclude,
  MEETING_CHANNELS,
  MIN_INTENDED_INVESTMENT_AMOUNT,
  canInvestorCancelMeetingRequest,
} from '@/lib/investmentIntents'
import { formatMoneyAmount } from '@/lib/formatMoney'
import { resolveUserLocale } from '@/lib/auth/userLocale'
import { sendMeetingRequestedEmail } from '@/lib/email/mailer'
import { notifyAdminsMeetingRequested } from '@/lib/email/adminNotify'
import {
  getEffectiveMinInvestment,
  getPropertyFundedAmount,
  getRemainingCapacity,
  isPropertyOpenForInvestment,
} from '@/lib/propertyFunding'

const prisma = new PrismaClient()

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = Number(session.user.id)
    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('propertyId')

    const where = { userId }
    if (propertyId) where.propertyId = propertyId

    const intents = await prisma.investmentIntent.findMany({
      where,
      include: investmentIntentInclude,
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json(propertyId ? intents[0] || null : intents)
  } catch (error) {
    console.error('Error listing investment intents:', error)
    return NextResponse.json({ error: 'Failed to load intents' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (session.user.type === 'INVESTOR' && session.user.accreditedStatus !== 'APPROVED') {
      return NextResponse.json({ error: 'Accredited status required' }, { status: 403 })
    }

    const userId = Number(session.user.id)
    const body = await request.json()
    const propertyId = body.propertyId
    const channel = body.channel
    const intendedAmount =
      body.intendedAmount != null && body.intendedAmount !== ''
        ? Number(body.intendedAmount)
        : null

    if (!propertyId || !MEETING_CHANNELS.includes(channel)) {
      return NextResponse.json(
        { error: 'propertyId and channel (VIDEO_CALL, PHONE_CALL, or IN_PERSON) are required' },
        { status: 400 }
      )
    }

    if (intendedAmount == null || !Number.isFinite(intendedAmount)) {
      return NextResponse.json(
        { error: 'Intended amount is required' },
        { status: 400 }
      )
    }

    const property = await prisma.property.findFirst({
      where: { id: propertyId, deletedAt: null },
    })
    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }
    if (!isPropertyOpenForInvestment(property.status)) {
      return NextResponse.json(
        { error: 'This property is not open for new investment' },
        { status: 403 }
      )
    }

    const fundedAmount = await getPropertyFundedAmount(prisma, property.id)
    const remaining = getRemainingCapacity(property.price, fundedAmount)
    const effectiveMin = getEffectiveMinInvestment({
      goal: property.price,
      fundedAmount,
      platformFloor: MIN_INTENDED_INVESTMENT_AMOUNT,
    })

    if (remaining <= 0) {
      return NextResponse.json(
        { error: 'This property is fully funded' },
        { status: 403 }
      )
    }

    if (intendedAmount < effectiveMin) {
      return NextResponse.json(
        {
          error: `Intended amount must be at least $${formatMoneyAmount(effectiveMin)}`,
        },
        { status: 400 }
      )
    }

    if (intendedAmount > remaining + 1e-6) {
      return NextResponse.json(
        {
          error: `Only $${formatMoneyAmount(remaining)} remains on this raise`,
        },
        { status: 400 }
      )
    }

    const existing = await prisma.investmentIntent.findUnique({
      where: { userId_propertyId: { userId, propertyId } },
      select: { status: true },
    })
    const shouldNotify = existing?.status !== 'MEETING_REQUESTED'

    const intent = await prisma.investmentIntent.upsert({
      where: { userId_propertyId: { userId, propertyId } },
      create: {
        userId,
        propertyId,
        status: 'MEETING_REQUESTED',
        channel,
        intendedAmount,
        meetingRequestedAt: new Date(),
      },
      update: {
        status: 'MEETING_REQUESTED',
        channel,
        intendedAmount,
        meetingRequestedAt: new Date(),
      },
      include: investmentIntentInclude,
    })

    if (shouldNotify) {
      const investor = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, profile: true },
      })
      if (investor?.email) {
        const locale = resolveUserLocale(investor)
        try {
          await sendMeetingRequestedEmail({
            to: investor.email,
            locale,
            propertyName: property.name,
            investmentId: property.investmentId,
            channel,
            intendedAmount,
          })
        } catch (emailError) {
          console.error('Meeting requested investor email failed:', emailError)
        }
        try {
          await notifyAdminsMeetingRequested({
            investor,
            property,
            channel,
            intendedAmount,
            locale,
          })
        } catch (emailError) {
          console.error('Meeting requested admin notify failed:', emailError)
        }
      }
    }

    return NextResponse.json(intent, { status: 201 })
  } catch (error) {
    console.error('Error creating investment intent:', error)
    return NextResponse.json({ error: 'Failed to save intent' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = Number(session.user.id)
    const body = await request.json()
    const propertyId = body.propertyId
    const action = body.action

    if (!propertyId || action !== 'cancel') {
      return NextResponse.json(
        { error: 'propertyId and action cancel are required' },
        { status: 400 }
      )
    }

    const existing = await prisma.investmentIntent.findUnique({
      where: { userId_propertyId: { userId, propertyId } },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Investment request not found' }, { status: 404 })
    }

    if (!canInvestorCancelMeetingRequest(existing.status)) {
      return NextResponse.json(
        { error: 'Only a pending meeting request can be cancelled' },
        { status: 400 }
      )
    }

    const intent = await prisma.investmentIntent.update({
      where: { userId_propertyId: { userId, propertyId } },
      data: { status: 'CANCELLED' },
      include: investmentIntentInclude,
    })

    return NextResponse.json(intent)
  } catch (error) {
    console.error('Error cancelling investment intent:', error)
    return NextResponse.json({ error: 'Failed to cancel request' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
