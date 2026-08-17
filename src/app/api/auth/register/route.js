import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { validateAccountRegistration } from '@/lib/auth/registerValidation'
import { generateSecureToken, hashAuthToken, verificationExpiry } from '@/lib/auth/tokens'
import { sendVerificationEmail } from '@/lib/email/mailer'
import { enforceRateLimit, RATE_LIMITS } from '@/lib/security/rateLimit'

const prisma = new PrismaClient()

export async function POST(request) {
  const limited = enforceRateLimit(request, 'register', RATE_LIMITS.register)
  if (limited) return limited

  try {
    const body = await request.json()
    const locale = body.locale === 'es' ? 'es' : 'en'
    const result = validateAccountRegistration(body)

    if (!result.ok) {
      return NextResponse.json({ message: 'Validation failed', errors: result.errors }, { status: 400 })
    }

    const { email, password } = result.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { message: 'Email already registered', errors: { email: 'email_taken' } },
        { status: 409 }
      )
    }

    const hashedPassword = await hash(password, 10)
    const token = generateSecureToken()

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        type: 'INVESTOR',
        provider: 'credentials',
        accountStatus: 'PENDING_EMAIL',
        emailVerificationToken: hashAuthToken(token),
        emailVerificationExpires: verificationExpiry(),
      },
    })

    try {
      await sendVerificationEmail({ to: email, token, locale })
    } catch (emailError) {
      await prisma.user.delete({ where: { id: user.id } }).catch(() => {})
      console.error('Register verification email failed:', emailError)
      return NextResponse.json({ message: 'Email delivery failed' }, { status: 503 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ message: 'Registration failed' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
