import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { userSecretOmit } from '@/lib/auth/prismaUserSelect'
import { DEFAULT_OPERATOR_PERMISSIONS, normalizeOperatorPermissions } from '@/lib/operatorPermissions'

const prisma = new PrismaClient()

// GET /api/admin/users - List all users
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is authenticated and is admin
    if (!session || !['ADMIN', 'OPERATOR'].includes(session.user?.type)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const users = await prisma.user.findMany({
      where: session.user.type === 'OPERATOR' ? { type: 'INVESTOR' } : undefined,
      orderBy: { createdAt: 'desc' },
      omit: userSecretOmit,
      include: {
        _count: {
          select: {
            fundingContributions: true
          }
        }
      }
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// POST /api/admin/users - Create new user
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is authenticated and is admin
    if (!session || !['ADMIN', 'OPERATOR'].includes(session.user?.type)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { email, password, type } = body

    // Validate required fields
    if (!email || !password || !type) {
      return NextResponse.json(
        { error: 'Email, password, and type are required' },
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

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        type,
        operatorPermissions:
          type === 'OPERATOR'
            ? normalizeOperatorPermissions(body.operatorPermissions || DEFAULT_OPERATOR_PERMISSIONS)
            : [],
        provider: 'credentials' // Always credentials for admin-created users
      },
      omit: userSecretOmit,
      include: {
        _count: {
          select: {
            fundingContributions: true
          }
        }
      }
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
