import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { investmentIntentInclude, INTENT_STATUSES } from '@/lib/investmentIntents'
import { resolveUserLocale } from '@/lib/auth/userLocale'
import { sendAwaitingWireEmail } from '@/lib/email/mailer'

const prisma = new PrismaClient()

const ADMIN_SETTABLE = new Set([
  'MEETING_REQUESTED',
  'AWAITING_WIRE',
  'COMPLETED',
  'CANCELLED',
  'READY',
])

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.type !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const status = body.status

    if (!INTENT_STATUSES.includes(status) || !ADMIN_SETTABLE.has(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const existing = await prisma.investmentIntent.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, profile: true } },
        property: { select: { name: true, investmentId: true } },
      },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Intent not found' }, { status: 404 })
    }

    const previousStatus = existing.status
    const data = { status }
    if (typeof body.meetingNote === 'string') {
      data.meetingNote = body.meetingNote.trim() || null
    }

    const intent = await prisma.investmentIntent.update({
      where: { id },
      data,
      include: investmentIntentInclude,
    })

    if (
      status === 'AWAITING_WIRE' &&
      previousStatus !== 'AWAITING_WIRE' &&
      existing.user?.email
    ) {
      const locale = resolveUserLocale(existing.user)
      try {
        await sendAwaitingWireEmail({
          to: existing.user.email,
          locale,
          propertyName: existing.property?.name || 'property',
          investmentId: existing.property?.investmentId,
        })
      } catch (emailError) {
        console.error('Awaiting wire investor email failed:', emailError)
      }
    }

    return NextResponse.json(intent)
  } catch (error) {
    console.error('Error updating investment intent:', error)
    return NextResponse.json({ error: 'Failed to update intent' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
