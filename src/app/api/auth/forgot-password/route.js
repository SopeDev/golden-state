import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { generateSecureToken, hashAuthToken, passwordResetExpiry } from '@/lib/auth/tokens'
import { sendPasswordResetEmail } from '@/lib/email/mailer'
import { consumeRateLimit, enforceRateLimit, RATE_LIMITS } from '@/lib/security/rateLimit'

const prisma = new PrismaClient()

export async function POST(request) {
  const limited = enforceRateLimit(request, 'forgot-password', RATE_LIMITS.forgotPasswordIp)
  if (limited) return limited

  try {
    const body = await request.json()
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const locale = body.locale === 'es' ? 'es' : 'en'

    if (!email) {
      return NextResponse.json({ message: 'Email required' }, { status: 400 })
    }

    const emailLimit = consumeRateLimit(
      `forgot-email:${email}`,
      RATE_LIMITS.forgotPasswordEmail.limit,
      RATE_LIMITS.forgotPasswordEmail.windowMs
    )
    if (!emailLimit.ok) {
      return NextResponse.json({ ok: true })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (user?.password) {
      const token = generateSecureToken()
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: hashAuthToken(token),
          passwordResetExpires: passwordResetExpiry(),
        },
      })
      await sendPasswordResetEmail({ to: email, token, locale })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ message: 'Failed' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
