import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { userSecretOmit } from '@/lib/auth/prismaUserSelect'
import { normalizeOperatorPermissions } from '@/lib/operatorPermissions'
import { hasOperatorPermission, OPERATOR_PERMISSIONS } from '@/lib/operatorPermissions'

const prisma = new PrismaClient()

// GET /api/admin/users/[id] - Get single user
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is authenticated and is admin
    if (!session || !['ADMIN', 'OPERATOR'].includes(session.user?.type)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const userId = parseInt(id)

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      omit: userSecretOmit,
      include: {
        _count: {
          select: {
            fundingContributions: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// PUT /api/admin/users/[id] - Update user
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is authenticated and is admin
    if (!session || !['ADMIN', 'OPERATOR'].includes(session.user?.type)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const userId = parseInt(id)

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { email, password, type } = body

    // Validate required fields
    if (!email || !type) {
      return NextResponse.json(
        { error: 'Email and type are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate user type
    if (!['ADMIN', 'OPERATOR', 'INVESTOR'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid user type' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if email is already taken by another user
    const userWithEmail = await prisma.user.findUnique({
      where: { email }
    })

    if (userWithEmail && userWithEmail.id !== userId) {
      return NextResponse.json(
        { error: 'Email is already taken by another user' },
        { status: 409 }
      )
    }

    // Prepare update data
    const updateData = {
      email,
      type,
      operatorPermissions:
        type === 'OPERATOR' ? normalizeOperatorPermissions(body.operatorPermissions) : [],
      // Don't update provider - it should remain as originally set
    }

    if (
      session.user.type === 'OPERATOR' &&
      (existingUser.type !== 'INVESTOR' ||
        type !== 'INVESTOR' ||
        !hasOperatorPermission(session.user, OPERATOR_PERMISSIONS.EDIT_INVESTORS))
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Only update password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 12)
      updateData.sessionEpoch = { increment: 1 }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      omit: userSecretOmit,
      include: {
        _count: {
          select: {
            fundingContributions: true
          }
        }
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// DELETE /api/admin/users/[id] - Delete user
// Optional ?force=true removes investment/deposit ledger rows first (for test resets).
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'OPERATOR'].includes(session.user?.type)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const userId = parseInt(id)
    const force = new URL(request.url).searchParams.get('force') === 'true'

    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    if (Number(session.user.id) === userId) {
      return NextResponse.json(
        { error: 'You cannot delete your own admin account', code: 'SELF_DELETE' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            fundingContributions: { where: { status: 'ACTIVE' } },
            depositRequests: true,
          },
        },
      },
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const hasLedger =
      existingUser._count.fundingContributions > 0 || existingUser._count.depositRequests > 0

    if (hasLedger && !force) {
      return NextResponse.json(
        {
          error:
            'Cannot delete user with existing investments or deposit records. Confirm force delete to remove their ledger data and try again.',
          code: 'HAS_INVESTMENTS',
          fundingContributions: existingUser._count.fundingContributions,
          depositRequests: existingUser._count.depositRequests,
        },
        { status: 400 }
      )
    }

    await prisma.$transaction(async (tx) => {
      if (force) {
        await tx.fundingContribution.deleteMany({ where: { userId } })
        await tx.depositRequest.deleteMany({ where: { userId } })
        await tx.investmentIntent.deleteMany({ where: { userId } })
      } else {
        // Cancelled contributions no longer represent a holding and should not
        // prevent removal of an otherwise unreferenced test/inactive user.
        await tx.fundingContribution.deleteMany({
          where: { userId, status: 'CANCELLED' },
        })
      }

      await tx.user.updateMany({
        where: { adminApprovedById: userId },
        data: { adminApprovedById: null },
      })

      await tx.user.delete({ where: { id: userId } })
    })

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
