import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'
import { getPrivateObject } from '@/lib/storage/r2'

const prisma = new PrismaClient()

export async function GET(_request, { params }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  if (!id) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 })
  }

  try {
    const doc = await prisma.propertyDocument.findUnique({
      where: { id },
      select: {
        id: true,
        propertyId: true,
        storageKey: true,
        fileName: true,
        mimeType: true,
      },
    })

    if (!doc) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 })
    }

    const isAdmin = session.user.type === 'ADMIN'
    let canAccess = isAdmin

    if (!canAccess) {
      const holding = await prisma.investment.findFirst({
        where: {
          propertyId: doc.propertyId,
          userId: Number(session.user.id),
        },
        select: { id: true },
      })
      canAccess = Boolean(holding)
    }

    if (!canAccess) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    const { body, contentType } = await getPrivateObject(doc.storageKey)
    const headers = new Headers()
    headers.set('Content-Type', contentType || doc.mimeType || 'application/octet-stream')
    headers.set(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(doc.fileName || 'document')}"`
    )
    headers.set('Cache-Control', 'private, no-store')
    headers.set('X-Content-Type-Options', 'nosniff')

    return new NextResponse(body, { status: 200, headers })
  } catch (error) {
    console.error('Property document stream error:', error)
    return NextResponse.json({ message: 'Failed' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
