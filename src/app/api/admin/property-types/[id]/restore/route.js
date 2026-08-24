import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { toClientPropertyType } from '@/lib/propertyTypes'

const prisma = new PrismaClient()

export async function POST(_request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['ADMIN', 'OPERATOR'].includes(session.user?.type)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const existing = await prisma.propertyType.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ message: 'Property type not found' }, { status: 404 })
    }
    if (!existing.deletedAt) {
      return NextResponse.json({ message: 'Property type is already active' }, { status: 400 })
    }

    const updated = await prisma.propertyType.update({
      where: { id },
      data: { deletedAt: null },
    })

    return NextResponse.json({ type: toClientPropertyType(updated) })
  } catch (error) {
    console.error('Restore property type error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
