import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'
import { validateProfileBasicsUpdate } from '@/lib/auth/profileUpdateValidation'

const prisma = new PrismaClient()

export async function PATCH(request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  if (session.user.type !== 'INVESTOR') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const result = validateProfileBasicsUpdate(body)
    if (!result.ok) {
      return NextResponse.json({ message: 'Validation failed', errors: result.errors }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 })
    }

    const existingProfile =
      user.profile && typeof user.profile === 'object' && !Array.isArray(user.profile)
        ? user.profile
        : {}

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        profile: {
          ...existingProfile,
          fullName: result.data.fullName,
          phone: result.data.phone,
        },
      },
      select: {
        email: true,
        provider: true,
        profile: true,
        accreditedStatus: true,
      },
    })

    return NextResponse.json({ ok: true, profile: updated.profile })
  } catch (error) {
    console.error('Investor profile PATCH error:', error)
    return NextResponse.json({ message: 'Failed' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
