import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getPrivateObject } from '@/lib/storage/r2'
import { hasOperatorPermission, OPERATOR_PERMISSIONS as P } from '@/lib/operatorPermissions'

const prisma = new PrismaClient()

export async function GET(_request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const cashOut = await prisma.cashOutRequest.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        receiptStorageKey: true,
        receiptFileName: true,
        receiptMimeType: true,
      },
    })

    if (!cashOut?.receiptStorageKey) {
      return NextResponse.json({ error: 'Bank notice not found' }, { status: 404 })
    }

    const isAdmin = hasOperatorPermission(session.user, P.VIEW_FINANCIAL_ACTIVITY)
    const isOwner = Number(session.user.id) === cashOut.userId
    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { body, contentType } = await getPrivateObject(cashOut.receiptStorageKey)
    const headers = new Headers()
    headers.set('Content-Type', cashOut.receiptMimeType || contentType || 'application/octet-stream')
    headers.set(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(cashOut.receiptFileName || 'bank-notice')}"`
    )
    headers.set('Cache-Control', 'private, no-store')

    return new NextResponse(body, { status: 200, headers })
  } catch (error) {
    console.error('Error streaming cash-out bank notice:', error)
    return NextResponse.json({ error: 'Failed to load bank notice' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
