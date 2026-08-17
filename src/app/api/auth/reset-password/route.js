import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { resolveUserLocale } from '@/lib/auth/userLocale'
import { sendPasswordChangedEmail } from '@/lib/email/mailer'
import { sendSafely } from '@/lib/email/sendSafely'
import { findUserByHashedToken } from '@/lib/auth/tokens'
import { enforceRateLimit, RATE_LIMITS } from '@/lib/security/rateLimit'

const prisma = new PrismaClient()

export async function POST(request) {
  const limited = enforceRateLimit(request, 'reset-password', RATE_LIMITS.resetPassword)
  if (limited) return limited

  try {
    const body = await request.json()
    const token = typeof body.token === 'string' ? body.token : ''
    const password = typeof body.password === 'string' ? body.password : ''

    if (!token || password.length < 8) {
      return NextResponse.json({ message: 'Invalid request' }, { status: 400 })
    }

    const user = await findUserByHashedToken(
      prisma,
      'passwordResetToken',
      token,
      'passwordResetExpires'
    )

    if (!user) {
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 400 })
    }

    const hashedPassword = await hash(password, 10)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
        sessionEpoch: { increment: 1 },
      },
    })

    if (user.email) {
      const locale = resolveUserLocale(user)
      await sendSafely('Password changed email', () =>
        sendPasswordChangedEmail({ to: user.email, locale })
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ message: 'Failed' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
