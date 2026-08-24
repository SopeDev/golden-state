import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { notifyHoldersOfNewDocuments } from '@/lib/investorUpdates'

const prisma = new PrismaClient()

export async function POST(_request, { params }) {
  const session = await getServerSession(authOptions)
  if (!session || !['ADMIN', 'OPERATOR'].includes(session.user?.type)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { id: propertyId } = await params

  try {
    const result = await notifyHoldersOfNewDocuments(prisma, propertyId)
    return NextResponse.json(result)
  } catch (error) {
    if (error.code === 'NOT_FOUND') {
      return NextResponse.json({ message: 'Property not found' }, { status: 404 })
    }
    console.error('Notify property documents error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
