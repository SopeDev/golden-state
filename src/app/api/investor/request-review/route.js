import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { notifyAdminsReviewRequested } from '@/lib/email/adminNotify'
import { resolveUserLocale } from '@/lib/auth/userLocale'

const prisma = new PrismaClient()

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  if (session.user.type !== 'INVESTOR') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const scope = body.scope

    if (scope !== 'account' && scope !== 'accreditation') {
      return NextResponse.json({ message: 'Invalid scope' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        investorDocuments: { orderBy: { uploadedAt: 'desc' } },
      },
    })

    if (!user) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 })
    }

    const locale = resolveUserLocale(user)

    if (scope === 'account') {
      if (user.accountStatus !== 'REJECTED') {
        return NextResponse.json({ message: 'Review not available for current status' }, { status: 400 })
      }

      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { accountStatus: 'PENDING_ADMIN' },
      })

      try {
        await notifyAdminsReviewRequested({ investor: updated, scope: 'account', locale })
      } catch (emailError) {
        console.error('Account review request notify failed:', emailError)
      }

      return NextResponse.json({ ok: true, accountStatus: 'PENDING_ADMIN' })
    }

    if (user.accountStatus !== 'ACTIVE') {
      return NextResponse.json({ message: 'Account not active' }, { status: 403 })
    }

    if (user.accreditedStatus !== 'REJECTED') {
      return NextResponse.json({ message: 'Review not available for current status' }, { status: 400 })
    }

    if (user.investorDocuments.length === 0) {
      return NextResponse.json(
        { message: 'Resubmit documents before requesting review', code: 'needs_documents' },
        { status: 400 }
      )
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        accreditedStatus: 'PENDING_REVIEW',
        accreditedSubmittedAt: new Date(),
      },
    })

    try {
      await notifyAdminsReviewRequested({
        investor: { ...updated, investorDocuments: user.investorDocuments },
        scope: 'accreditation',
        locale,
      })
    } catch (emailError) {
      console.error('Accreditation review request notify failed:', emailError)
    }

    return NextResponse.json({ ok: true, accreditedStatus: 'PENDING_REVIEW' })
  } catch (error) {
    console.error('Request review error:', error)
    return NextResponse.json({ message: 'Failed' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
