import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { notifyAdminsInvestorPendingApproval } from '@/lib/email/adminNotify'
import { validateProfileCompletion } from '@/lib/auth/registerValidation'

const prisma = new PrismaClient()

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const result = validateProfileCompletion(body)
    if (!result.ok) {
      return NextResponse.json({ message: 'Validation failed', errors: result.errors }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user || user.type !== 'INVESTOR') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    const emailVerified = Boolean(user.emailVerifiedAt) || user.provider === 'google'
    if (!emailVerified) {
      return NextResponse.json({ message: 'Email not verified' }, { status: 403 })
    }

    const wasProfileComplete = Boolean(user.profile?.completedAt)

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        profile: result.profile,
        accountStatus: 'PENDING_ADMIN',
      },
    })

    if (!wasProfileComplete) {
      const locale = body.locale === 'es' ? 'es' : 'en'
      await notifyAdminsInvestorPendingApproval({ investor: updated, locale })
    }

    return NextResponse.json({ ok: true, accountStatus: 'PENDING_ADMIN' })
  } catch (error) {
    console.error('Complete profile error:', error)
    return NextResponse.json({ message: 'Failed' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
