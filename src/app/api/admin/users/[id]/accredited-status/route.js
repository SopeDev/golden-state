import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'
import { resolveUserLocale } from '@/lib/auth/userLocale'
import { sendAccreditationApprovedEmail, sendAccreditationRejectedEmail, sendAccreditationResubmitEmail } from '@/lib/email/mailer'
import { sendSafely } from '@/lib/email/sendSafely'
import { getDocumentEmailLabels, parseResubmitKinds } from '@/lib/investorDocumentResubmit'

const prisma = new PrismaClient()

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.type !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = parseInt((await params).id, 10)
    if (Number.isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    }

    const body = await request.json()
    const action = body.action
    const note = typeof body.note === 'string' ? body.note : null

    if (action === 'approve') {
      const existing = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          accountStatus: true,
          accreditedStatus: true,
          _count: { select: { investorDocuments: true } },
        },
      })

      if (!existing) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
      }

      if (existing.accountStatus !== 'ACTIVE') {
        return NextResponse.json({ error: 'Account must be approved first' }, { status: 400 })
      }

      if (existing._count.investorDocuments === 0) {
        return NextResponse.json({ error: 'No accreditation documents submitted' }, { status: 400 })
      }

      if (existing.accreditedStatus === 'APPROVED') {
        return NextResponse.json({ error: 'Already approved' }, { status: 400 })
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          accreditedStatus: 'APPROVED',
          accreditedReviewedAt: new Date(),
          accreditedReviewNote: note,
          accreditationResubmitKinds: null,
        },
      })

      await prisma.investmentIntent.updateMany({
        where: {
          userId,
          status: { in: ['STARTED', 'ACCREDITATION_PENDING'] },
        },
        data: { status: 'READY' },
      })

      const locale = resolveUserLocale(user)
      try {
        await sendAccreditationApprovedEmail({ to: user.email, locale })
      } catch (emailError) {
        console.error('Accreditation approved email failed:', emailError)
      }

      const { password: _, ...safe } = user
      return NextResponse.json(safe)
    }

    if (action === 'reject') {
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          accreditedStatus: 'REJECTED',
          accreditedReviewedAt: new Date(),
          accreditedReviewNote: note,
          accreditationResubmitKinds: null,
        },
      })

      const locale = resolveUserLocale(user)
      await sendSafely('Accreditation rejected email', () =>
        sendAccreditationRejectedEmail({ to: user.email, locale, reviewNote: note })
      )

      const { password: _, ...safe } = user
      return NextResponse.json(safe)
    }

    if (action === 'request_resubmit') {
      const resubmitKinds = parseResubmitKinds(body.resubmitKinds)
      if (resubmitKinds.length === 0) {
        return NextResponse.json({ error: 'Select at least one document' }, { status: 400 })
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          accreditedStatus: 'REJECTED',
          accreditedReviewedAt: new Date(),
          accreditedReviewNote: note,
          accreditationResubmitKinds: resubmitKinds,
        },
      })

      const locale = resolveUserLocale(user)
      try {
        await sendAccreditationResubmitEmail({
          to: user.email,
          locale,
          documentLabels: getDocumentEmailLabels(resubmitKinds, locale),
          reviewNote: note,
        })
      } catch (emailError) {
        console.error('Accreditation resubmit email failed:', emailError)
      }

      const { password: _, ...safe } = user
      return NextResponse.json(safe)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Accredited status error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
