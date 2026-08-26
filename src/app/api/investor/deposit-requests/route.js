import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import {
  depositRequestInclude,
  toClientDepositRequest,
} from '@/lib/depositRequests'
import { canInvestorSubmitDeposit } from '@/lib/investmentIntents'
import { notifyAdminsDepositSubmitted } from '@/lib/email/adminNotify'
import { investorEmailSelect } from '@/lib/email/appLinks'
import { sendSafely } from '@/lib/email/sendSafely'
import { resolveUserLocale } from '@/lib/auth/userLocale'
import { putPrivateObject } from '@/lib/storage/r2'
import { formatMoneyAmount } from '@/lib/formatMoney'
import {
  getEffectiveMinInvestment,
  getPropertyFundedAmount,
  getRemainingCapacity,
} from '@/lib/propertyFunding'

const prisma = new PrismaClient()

const ALLOWED_RECEIPT_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
])

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

    const deposits = await prisma.depositRequest.findMany({
      where,
      include: depositRequestInclude,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(deposits.map(toClientDepositRequest))
  } catch (error) {
    console.error('Error listing investor deposits:', error)
    return NextResponse.json({ error: 'Failed to load deposits' }, { status: 500 })
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
    const formData = await request.formData()
    const propertyId = formData.get('propertyId')
    const amount = Number(formData.get('amount'))
    const reference =
      typeof formData.get('reference') === 'string'
        ? formData.get('reference').trim() || null
        : null
    const depositedAtRaw = formData.get('depositedAt')
    const depositedAt =
      typeof depositedAtRaw === 'string' && depositedAtRaw
        ? new Date(depositedAtRaw)
        : null
    const receipt = formData.get('receipt')

    if (!propertyId || typeof propertyId !== 'string') {
      return NextResponse.json({ error: 'propertyId is required' }, { status: 400 })
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'A positive amount is required' }, { status: 400 })
    }
    if (!(receipt instanceof File) || receipt.size <= 0) {
      return NextResponse.json(
        { error: 'A receipt photo or PDF is required' },
        { status: 400 }
      )
    }
    if (!ALLOWED_RECEIPT_TYPES.has(receipt.type)) {
      return NextResponse.json(
        { error: 'Receipt must be PDF, JPG, PNG, or WebP' },
        { status: 400 }
      )
    }

    const property = await prisma.property.findFirst({
      where: { id: propertyId, deletedAt: null },
    })
    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    const fundedAmount = await getPropertyFundedAmount(prisma, property.id)
    const remaining = getRemainingCapacity(property.price, fundedAmount)
    const minTicket = getEffectiveMinInvestment({
      goal: property.price,
      fundedAmount,
    })
    if (amount < minTicket) {
      return NextResponse.json(
        { error: `Amount must be at least $${formatMoneyAmount(minTicket)}` },
        { status: 400 }
      )
    }
    if (remaining <= 0) {
      return NextResponse.json({ error: 'This property is fully funded' }, { status: 400 })
    }
    if (amount > remaining + 1e-6) {
      return NextResponse.json(
        { error: `Only $${formatMoneyAmount(remaining)} remains on this raise`, code: 'OVERFUND' },
        { status: 400 }
      )
    }

    const pending = await prisma.depositRequest.findFirst({
      where: { userId, propertyId, status: 'PENDING' },
      select: { id: true },
    })
    if (pending) {
      return NextResponse.json(
        { error: 'You already have a pending deposit for this property' },
        { status: 400 }
      )
    }

    const intent = await prisma.investmentIntent.findUnique({
      where: { userId_propertyId: { userId, propertyId } },
    })
    if (!intent || !canInvestorSubmitDeposit(intent.status)) {
      return NextResponse.json(
        {
          error:
            'Deposit confirmation is not available until our team approves your investment after your call',
        },
        { status: 403 }
      )
    }

    const extension = receipt.name.includes('.')
      ? receipt.name.split('.').pop().toLowerCase()
      : 'bin'
    const objectKey = `deposit-receipts/${userId}/${propertyId}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}.${extension}`

    const bytes = await receipt.arrayBuffer()
    await putPrivateObject({
      key: objectKey,
      body: Buffer.from(bytes),
      contentType: receipt.type,
    })

    const deposit = await prisma.$transaction(async (tx) => {
      const created = await tx.depositRequest.create({
        data: {
          userId,
          propertyId,
          investmentIntentId: intent.id,
          amount,
          reference,
          depositedAt:
            depositedAt && !Number.isNaN(depositedAt.getTime()) ? depositedAt : null,
          receiptStorageKey: objectKey,
          receiptFileName: receipt.name,
          receiptMimeType: receipt.type,
        },
        include: depositRequestInclude,
      })

      await tx.investmentIntent.update({
        where: { id: intent.id },
        data: {
          status: intent.status === 'COMPLETED' ? 'COMPLETED' : 'AWAITING_WIRE',
        },
      })

      return created
    })

    const investor = await prisma.user.findUnique({
      where: { id: userId },
      select: investorEmailSelect,
    })
    if (investor?.email) {
      const locale = resolveUserLocale(investor)
      await sendSafely('Deposit submitted admin notify', () =>
        notifyAdminsDepositSubmitted({
          investor,
          property,
          amount,
          reference,
          depositId: deposit.id,
          locale,
        })
      )
    }

    return NextResponse.json(toClientDepositRequest(deposit), { status: 201 })
  } catch (error) {
    console.error('Error submitting deposit:', error)
    return NextResponse.json({ error: 'Failed to submit deposit' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
