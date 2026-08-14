import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { returnDistributionInclude } from '@/lib/investorWallet'
import { investorHoldingWhere } from '@/lib/fundingContributions'

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
    const userId = searchParams.get('userId')
    const propertyId = searchParams.get('propertyId')
    const status = searchParams.get('status')
    const includeVoided = searchParams.get('includeVoided') === '1'

    const where = {}
    if (userId) where.userId = Number.parseInt(userId, 10)
    if (propertyId) where.propertyId = propertyId
    if (!includeVoided) {
      where.status = status === 'VOIDED' ? 'VOIDED' : 'ACTIVE'
    } else if (status && ['ACTIVE', 'VOIDED'].includes(status)) {
      where.status = status
    }

    const rows = await prisma.returnDistribution.findMany({
      where,
      include: returnDistributionInclude,
      orderBy: { distributedAt: 'desc' },
      take: 300,
    })

    return NextResponse.json(rows)
  } catch (error) {
    console.error('Error listing return distributions:', error)
    return NextResponse.json({ error: 'Failed to list distributions' }, { status: 500 })
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
    const userId = Number.parseInt(body.userId, 10)
    const propertyId = typeof body.propertyId === 'string' ? body.propertyId.trim() : ''
    const amount = Number(body.amount)
    const concept = typeof body.concept === 'string' ? body.concept.trim() || null : null
    const note = typeof body.note === 'string' ? body.note.trim() || null : null
    const distributedAt = body.distributedAt ? new Date(body.distributedAt) : new Date()

    if (!Number.isFinite(userId) || !propertyId || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: 'userId, propertyId, and a positive amount are required' },
        { status: 400 }
      )
    }

    if (Number.isNaN(distributedAt.getTime())) {
      return NextResponse.json({ error: 'Invalid distributedAt date' }, { status: 400 })
    }

    const [investor, property, holding] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.property.findUnique({ where: { id: propertyId } }),
      prisma.fundingContribution.findFirst({
        where: investorHoldingWhere(userId, { propertyId }),
        select: { id: true },
      }),
    ])

    if (!investor || investor.type !== 'INVESTOR') {
      return NextResponse.json({ error: 'Investor not found' }, { status: 404 })
    }
    if (!property || property.deletedAt) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }
    if (!holding) {
      return NextResponse.json(
        { error: 'Investor has no active holding in this property' },
        { status: 400 }
      )
    }

    const row = await prisma.returnDistribution.create({
      data: {
        userId,
        propertyId,
        amount,
        concept,
        note,
        distributedAt,
        createdByAdminId: Number(session.user.id) || null,
      },
      include: returnDistributionInclude,
    })

    return NextResponse.json(row, { status: 201 })
  } catch (error) {
    console.error('Error creating return distribution:', error)
    return NextResponse.json({ error: 'Failed to create distribution' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
