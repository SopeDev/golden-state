import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import {
  codeFromSlug,
  listAllPropertyTypes,
  slugifyPropertyType,
  toClientPropertyType,
} from '@/lib/propertyTypes'

const prisma = new PrismaClient()

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.type !== 'ADMIN') {
    return null
  }
  return session
}

export async function GET() {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const types = await listAllPropertyTypes(prisma, { includeDeleted: true })
    const withCounts = await Promise.all(
      types.map(async (type) => {
        const propertyCount = await prisma.property.count({
          where: { typeId: type.id, deletedAt: null },
        })
        const archivedPropertyCount = await prisma.property.count({
          where: { typeId: type.id, deletedAt: { not: null } },
        })
        return {
          ...toClientPropertyType(type),
          propertyCount,
          archivedPropertyCount,
        }
      })
    )

    return NextResponse.json({ types: withCounts })
  } catch (error) {
    console.error('List property types error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(request) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const labelEn = String(body.labelEn || '').trim()
    const labelEs = String(body.labelEs || '').trim() || labelEn
    if (!labelEn) {
      return NextResponse.json({ message: 'English label is required' }, { status: 400 })
    }

    let slug = slugifyPropertyType(body.slug || labelEn)
    if (!slug) {
      return NextResponse.json({ message: 'Slug is required' }, { status: 400 })
    }

    let code = String(body.code || codeFromSlug(slug))
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9_]/g, '_')
    if (!code) {
      return NextResponse.json({ message: 'Code is required' }, { status: 400 })
    }

    const existingSlug = await prisma.propertyType.findUnique({ where: { slug } })
    if (existingSlug) {
      return NextResponse.json({ message: 'Slug already exists' }, { status: 400 })
    }
    const existingCode = await prisma.propertyType.findUnique({ where: { code } })
    if (existingCode) {
      return NextResponse.json({ message: 'Code already exists' }, { status: 400 })
    }

    const maxSort = await prisma.propertyType.aggregate({ _max: { sortOrder: true } })
    const sortOrder =
      body.sortOrder != null && body.sortOrder !== ''
        ? Number.parseInt(body.sortOrder, 10)
        : (maxSort._max.sortOrder || 0) + 1

    const created = await prisma.propertyType.create({
      data: {
        code,
        slug,
        labelEn,
        labelEs,
        descriptionEn: String(body.descriptionEn || '').trim(),
        descriptionEs: String(body.descriptionEs || '').trim(),
        sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
      },
    })

    return NextResponse.json({ type: toClientPropertyType(created) }, { status: 201 })
  } catch (error) {
    console.error('Create property type error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
