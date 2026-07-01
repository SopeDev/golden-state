import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  if (session.user.type === 'ADMIN') {
    return NextResponse.json({
      email: session.user.email,
      provider: session.user.provider || 'credentials',
      type: 'ADMIN',
      accountStatus: null,
      profile: null,
      accreditedStatus: null,
      accreditedSubmittedAt: null,
      investorDocuments: [],
    })
  }

  if (session.user.type !== 'INVESTOR') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        email: true,
        provider: true,
        type: true,
        accountStatus: true,
        profile: true,
        accreditedStatus: true,
        accreditedSubmittedAt: true,
        accreditedReviewedAt: true,
        accreditationResubmitKinds: true,
        investorDocuments: {
          orderBy: { uploadedAt: 'desc' },
          select: {
            id: true,
            kind: true,
            fileName: true,
            uploadedAt: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Investor account GET error:', error)
    return NextResponse.json({ message: 'Failed' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
