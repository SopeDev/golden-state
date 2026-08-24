import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { investmentIntentInclude, INTENT_STATUSES } from '@/lib/investmentIntents'

const prisma = new PrismaClient()

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['ADMIN', 'OPERATOR'].includes(session.user?.type)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const propertyId = searchParams.get('propertyId')
    const userId = searchParams.get('userId')

    const where = {}
    if (status && INTENT_STATUSES.includes(status)) where.status = status
    if (propertyId) where.propertyId = propertyId
    if (userId) {
      const parsedUserId = Number.parseInt(userId, 10)
      if (Number.isFinite(parsedUserId)) where.userId = parsedUserId
    }

    const intents = await prisma.investmentIntent.findMany({
      where,
      include: investmentIntentInclude,
      orderBy: { updatedAt: 'desc' },
      take: 200,
    })

    return NextResponse.json(intents)
  } catch (error) {
    console.error('Error listing admin intents:', error)
    return NextResponse.json({ error: 'Failed to list intents' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
