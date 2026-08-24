import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'
import { resolveUserLocale } from '@/lib/auth/userLocale'
import { sendAccountApprovedEmail, sendAccountRejectedEmail } from '@/lib/email/mailer'
import { sendSafely } from '@/lib/email/sendSafely'

const prisma = new PrismaClient()

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['ADMIN', 'OPERATOR'].includes(session.user?.type)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = parseInt((await params).id, 10)
    if (Number.isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    }

    const target = await prisma.user.findFirst({ where: { id: userId, type: 'INVESTOR' } })
    if (!target) {
      return NextResponse.json({ error: 'Investor not found' }, { status: 404 })
    }

    const body = await request.json()
    const action = body.action

    if (action === 'approve') {
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          accountStatus: 'ACTIVE',
          adminApprovedAt: new Date(),
          adminApprovedById: session.user.id,
        },
      })

      const locale = resolveUserLocale(user)
      try {
        await sendAccountApprovedEmail({ to: user.email, locale })
      } catch (emailError) {
        console.error('Account approved email failed:', emailError)
      }

      const { password: _, ...safe } = user
      return NextResponse.json(safe)
    }

    if (action === 'reject') {
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          accountStatus: 'REJECTED',
          accreditedReviewNote: typeof body.note === 'string' ? body.note : null,
        },
      })

      const locale = resolveUserLocale(user)
      await sendSafely('Account rejected email', () =>
        sendAccountRejectedEmail({ to: user.email, locale })
      )

      const { password: _, ...safe } = user
      return NextResponse.json(safe)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Account status error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
