import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { assertCanReserveWallet, reinvestRequestInclude } from '@/lib/investorWallet'
import {
  assertContributionFitsGoal,
  getEffectiveMinInvestment,
  getPropertyFundedAmount,
  getRemainingCapacity,
  isPropertyOpenForInvestment,
} from '@/lib/propertyFunding'
import { formatMoneyAmount } from '@/lib/formatMoney'
import { notDeletedProperty } from '@/lib/propertyTypes'
import { resolveUserLocale } from '@/lib/auth/userLocale'
import { notifyAdminsReinvestRequested } from '@/lib/email/adminNotify'
import { investorEmailSelect } from '@/lib/email/appLinks'
import { sendSafely } from '@/lib/email/sendSafely'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = Number(session.user.id)
    const rows = await prisma.reinvestRequest.findMany({
      where: { userId },
      include: reinvestRequestInclude,
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return NextResponse.json(rows)
  } catch (error) {
    console.error('Error listing investor reinvests:', error)
    return NextResponse.json({ error: 'Failed to list reinvest requests' }, { status: 500 })
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
    if (session.user.type === 'ADMIN') {
      return NextResponse.json({ error: 'Admins cannot request reinvestment' }, { status: 403 })
    }

    const userId = Number(session.user.id)
    const body = await request.json()
    const amount = Number(body.amount)
    const destinationPropertyId =
      typeof body.destinationPropertyId === 'string' ? body.destinationPropertyId.trim() : ''

    if (!destinationPropertyId) {
      return NextResponse.json({ error: 'destinationPropertyId is required' }, { status: 400 })
    }

    const property = await prisma.property.findFirst({
      where: { id: destinationPropertyId, ...notDeletedProperty },
    })
    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }
    if (!isPropertyOpenForInvestment(property.status)) {
      return NextResponse.json(
        { error: 'Property is not open for investment', code: 'NOT_OPEN' },
        { status: 400 }
      )
    }

    const funded = await getPropertyFundedAmount(prisma, property.id)
    const remaining = getRemainingCapacity(property.price, funded)
    const minTicket = getEffectiveMinInvestment({
      goal: property.price,
      fundedAmount: funded,
    })
    if (amount > remaining + 1e-6) {
      return NextResponse.json(
        {
          error: 'Amount exceeds remaining raise capacity',
          code: 'OVERFUND',
          remaining,
        },
        { status: 400 }
      )
    }
    if (!Number.isFinite(amount) || amount < minTicket) {
      return NextResponse.json(
        {
          error: `Amount must be at least $${formatMoneyAmount(minTicket)}`,
          code: 'BELOW_MIN',
          min: minTicket,
        },
        { status: 400 }
      )
    }

    try {
      await assertContributionFitsGoal(prisma, {
        propertyId: property.id,
        amount,
      })
      await assertCanReserveWallet(prisma, { userId, amount })
    } catch (err) {
      if (
        err.code === 'INVALID_AMOUNT' ||
        err.code === 'INSUFFICIENT_FUNDS' ||
        err.code === 'OVERFUND'
      ) {
        return NextResponse.json(
          { error: err.message, code: err.code, available: err.available },
          { status: 400 }
        )
      }
      throw err
    }

    const row = await prisma.$transaction(async (tx) => {
      await assertCanReserveWallet(tx, { userId, amount })
      return tx.reinvestRequest.create({
        data: {
          userId,
          amount,
          destinationPropertyId: property.id,
        },
        include: reinvestRequestInclude,
      })
    })

    const investor = await prisma.user.findUnique({
      where: { id: userId },
      select: investorEmailSelect,
    })
    if (investor?.email) {
      const locale = resolveUserLocale(investor)
      await sendSafely('Reinvest requested admin notify', () =>
        notifyAdminsReinvestRequested({
          investor,
          property,
          amount,
          reinvestId: row.id,
          locale,
        })
      )
    }

    return NextResponse.json(row, { status: 201 })
  } catch (error) {
    console.error('Error creating reinvest request:', error)
    if (
      error.code === 'INVALID_AMOUNT' ||
      error.code === 'INSUFFICIENT_FUNDS' ||
      error.code === 'OVERFUND'
    ) {
      return NextResponse.json(
        { error: error.message, code: error.code, available: error.available },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: 'Failed to create reinvest request' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
