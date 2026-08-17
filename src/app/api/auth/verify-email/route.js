import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { notifyAdminsInvestorPendingApproval } from '@/lib/email/adminNotify'
import { sendPendingAdminEmail } from '@/lib/email/mailer'
import { findUserByHashedToken } from '@/lib/auth/tokens'

const prisma = new PrismaClient()

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  const locale = searchParams.get('locale') === 'es' ? 'es' : 'en'

  const base = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const redirectFail = `${base}/${locale}/register/verify-failed`

  if (!token) {
    return NextResponse.redirect(redirectFail)
  }

  try {
    const user = await findUserByHashedToken(
      prisma,
      'emailVerificationToken',
      token,
      'emailVerificationExpires'
    )

    if (!user) {
      return NextResponse.redirect(redirectFail)
    }

    const profileComplete = Boolean(user.profile?.completedAt)
    const nextStatus = profileComplete ? 'PENDING_ADMIN' : 'PENDING_EMAIL'

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifiedAt: new Date(),
        emailVerificationToken: null,
        emailVerificationExpires: null,
        accountStatus: nextStatus,
      },
    })

    if (profileComplete) {
      await sendPendingAdminEmail({ to: user.email, locale })
      await notifyAdminsInvestorPendingApproval({ investor: updated, locale })
    }

    const redirectOk = profileComplete
      ? `${base}/${locale}/register/verified`
      : `${base}/${locale}/register/verified?next=profile`

    return NextResponse.redirect(redirectOk)
  } catch (error) {
    console.error('Verify email error:', error)
    return NextResponse.redirect(redirectFail)
  } finally {
    await prisma.$disconnect()
  }
}
