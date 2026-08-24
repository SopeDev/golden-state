import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { reinvestRequestInclude } from '@/lib/investorWallet'

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
    const userId = searchParams.get('userId')
    const propertyId = searchParams.get('propertyId')

    const where = {}
    if (status && ['PENDING', 'CONFIRMED', 'REJECTED'].includes(status)) {
      where.status = status
    }
    if (userId) where.userId = Number.parseInt(userId, 10)
    if (propertyId) where.destinationPropertyId = propertyId

    const rows = await prisma.reinvestRequest.findMany({
      where,
      include: reinvestRequestInclude,
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      take: 300,
    })

    return NextResponse.json(rows)
  } catch (error) {
    console.error('Error listing reinvest requests:', error)
    return NextResponse.json({ error: 'Failed to list reinvest requests' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
