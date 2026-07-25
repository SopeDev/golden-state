import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'
import {
  groupPropertyDocumentsByKind,
  toClientPropertyDocuments,
} from '@/lib/propertyDocuments'

const prisma = new PrismaClient()

export async function GET(_request, { params }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { propertyId } = await params
  if (!propertyId) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 })
  }

  try {
    const isAdmin = session.user.type === 'ADMIN'
    if (!isAdmin) {
      const holding = await prisma.investment.findFirst({
        where: {
          propertyId,
          userId: Number(session.user.id),
        },
        select: { id: true },
      })
      if (!holding) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
      }
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true, name: true },
    })
    if (!property) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 })
    }

    const docs = await prisma.propertyDocument.findMany({
      where: { propertyId },
      orderBy: { uploadedAt: 'desc' },
    })

    return NextResponse.json({
      property,
      documents: toClientPropertyDocuments(docs),
      groups: groupPropertyDocumentsByKind(docs),
    })
  } catch (error) {
    console.error('Investor property documents list error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
