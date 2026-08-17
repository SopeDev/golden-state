import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { cashOutRequestInclude, toClientCashOutRequest } from '@/lib/investorWallet'

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
    const status = searchParams.get('status')
    const userId = searchParams.get('userId')

    const where = {}
    if (status && ['PENDING', 'CONFIRMED', 'REJECTED'].includes(status)) {
      where.status = status
    }
    if (userId) where.userId = Number.parseInt(userId, 10)

    const rows = await prisma.cashOutRequest.findMany({
      where,
      include: cashOutRequestInclude,
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      take: 300,
    })

    return NextResponse.json(rows.map(toClientCashOutRequest))
  } catch (error) {
    console.error('Error listing cash-out requests:', error)
    return NextResponse.json({ error: 'Failed to list cash-out requests' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
