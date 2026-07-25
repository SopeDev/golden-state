import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function DELETE(_request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.type !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { id: propertyId, docId } = await params

    const doc = await prisma.propertyDocument.findFirst({
      where: { id: docId, propertyId },
    })

    if (!doc) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 })
    }

    // Keep object in R2 for now (no delete API wired); remove DB row so it is inaccessible.
    await prisma.propertyDocument.delete({ where: { id: docId } })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Delete property document error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
