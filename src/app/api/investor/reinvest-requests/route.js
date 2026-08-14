import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { assertCanReserveWallet, reinvestRequestInclude } from '@/lib/investorWallet'
import {
  assertContributionFitsGoal,
  getPropertyFundedAmount,
  getRemainingCapacity,
  isPropertyOpenForInvestment,
} from '@/lib/propertyFunding'
import { notDeletedProperty } from '@/lib/propertyTypes'

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
