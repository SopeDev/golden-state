import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { assertCanReserveWallet, cashOutRequestInclude, toClientCashOutRequest } from '@/lib/investorWallet'
import { resolveUserLocale } from '@/lib/auth/userLocale'
import { notifyAdminsCashOutRequested } from '@/lib/email/adminNotify'
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
    const rows = await prisma.cashOutRequest.findMany({
      where: { userId },
      include: cashOutRequestInclude,
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return NextResponse.json(rows.map(toClientCashOutRequest))
  } catch (error) {
    console.error('Error listing investor cash-outs:', error)
    return NextResponse.json({ error: 'Failed to list cash-out requests' }, { status: 500 })
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
      return NextResponse.json({ error: 'Admins cannot request cash-outs' }, { status: 403 })
    }

    const userId = Number(session.user.id)
    const body = await request.json()
    const amount = Number(body.amount)

    try {
      await assertCanReserveWallet(prisma, { userId, amount })
    } catch (err) {
      if (err.code === 'INVALID_AMOUNT' || err.code === 'INSUFFICIENT_FUNDS') {
        return NextResponse.json(
          { error: err.message, code: err.code, available: err.available },
          { status: 400 }
        )
      }
      throw err
    }

    const row = await prisma.$transaction(async (tx) => {
      await assertCanReserveWallet(tx, { userId, amount })
      return tx.cashOutRequest.create({
        data: { userId, amount },
        include: cashOutRequestInclude,
      })
    })

    const investor = await prisma.user.findUnique({
      where: { id: userId },
      select: investorEmailSelect,
    })
    if (investor?.email) {
      const locale = resolveUserLocale(investor)
      await sendSafely('Cash-out requested admin notify', () =>
        notifyAdminsCashOutRequested({
          investor,
          amount,
          cashOutId: row.id,
          locale,
        })
      )
    }

    return NextResponse.json(toClientCashOutRequest(row), { status: 201 })
  } catch (error) {
    console.error('Error creating cash-out request:', error)
    if (error.code === 'INVALID_AMOUNT' || error.code === 'INSUFFICIENT_FUNDS') {
      return NextResponse.json(
        { error: error.message, code: error.code, available: error.available },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: 'Failed to create cash-out request' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
