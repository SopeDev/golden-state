import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { generateSecureToken, hashAuthToken, verificationExpiry } from '@/lib/auth/tokens'
import { sendVerificationEmail, verificationEmailLink } from '@/lib/email/mailer'
import { enforceRateLimit, RATE_LIMITS } from '@/lib/security/rateLimit'

const prisma = new PrismaClient()

export async function POST(request) {
  const limited = enforceRateLimit(request, 'resend-verification', RATE_LIMITS.resendVerification)
  if (limited) return limited

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const locale = body.locale === 'es' ? 'es' : 'en'
    const email = session.user.email.trim().toLowerCase()

    const user = await prisma.user.findUnique({ where: { email } })

    let devVerificationLink

    if (user?.provider === 'credentials' && !user.emailVerifiedAt) {
      const token = generateSecureToken()
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerificationToken: hashAuthToken(token),
          emailVerificationExpires: verificationExpiry(),
        },
      })
      await sendVerificationEmail({ to: email, token, locale })
      if (process.env.NODE_ENV === 'development') {
        devVerificationLink = verificationEmailLink(token, locale)
      }
    }

    return NextResponse.json({
      ok: true,
      ...(devVerificationLink ? { devVerificationLink } : {}),
    })
  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json({ message: 'Failed' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
