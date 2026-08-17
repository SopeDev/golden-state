import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { compare, hash } from 'bcryptjs'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'
import { validateChangePassword } from '@/lib/auth/profileUpdateValidation'
import { resolveUserLocale } from '@/lib/auth/userLocale'
import { sendPasswordChangedEmail } from '@/lib/email/mailer'
import { sendSafely } from '@/lib/email/sendSafely'

const prisma = new PrismaClient()

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  if (session.user.type !== 'INVESTOR') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  }

  if (session.user.provider === 'google') {
    return NextResponse.json({ message: 'Password managed by Google' }, { status: 400 })
  }

  try {
    const body = await request.json()
    const result = validateChangePassword(body)
    if (!result.ok) {
      return NextResponse.json({ message: 'Validation failed', errors: result.errors }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user?.password) {
      return NextResponse.json({ message: 'No password set' }, { status: 400 })
    }

    const valid = await compare(result.data.currentPassword, user.password)
    if (!valid) {
      return NextResponse.json(
        { message: 'Invalid current password', errors: { currentPassword: 'invalid' } },
        { status: 400 }
      )
    }

    const hashedPassword = await hash(result.data.newPassword, 10)
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        password: hashedPassword,
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
    console.error('Change password error:', error)
    return NextResponse.json({ message: 'Failed' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
