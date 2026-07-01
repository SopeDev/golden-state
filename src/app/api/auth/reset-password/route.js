import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request) {
  try {
    const body = await request.json()
    const token = typeof body.token === 'string' ? body.token : ''
    const password = typeof body.password === 'string' ? body.password : ''

    if (!token || password.length < 8) {
      return NextResponse.json({ message: 'Invalid request' }, { status: 400 })
    }

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: { gt: new Date() },
      },
    })

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
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ message: 'Failed' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
