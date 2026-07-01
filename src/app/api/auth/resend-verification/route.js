import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { generateSecureToken, verificationExpiry } from '@/lib/auth/tokens'
import { sendVerificationEmail } from '@/lib/email/mailer'

const prisma = new PrismaClient()

export async function POST(request) {
  try {
    const body = await request.json()
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const locale = body.locale === 'es' ? 'es' : 'en'

    if (!email) {
      return NextResponse.json({ message: 'Email required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })

    if (user?.provider === 'credentials' && !user.emailVerifiedAt) {
      const token = generateSecureToken()
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerificationToken: token,
          emailVerificationExpires: verificationExpiry(),
        },
      })
      await sendVerificationEmail({ to: email, token, locale })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json({ message: 'Failed' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
