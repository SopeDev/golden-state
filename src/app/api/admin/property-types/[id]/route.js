import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { slugifyPropertyType, toClientPropertyType } from '@/lib/propertyTypes'

const prisma = new PrismaClient()

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || !['ADMIN', 'OPERATOR'].includes(session.user?.type)) {
    return null
  }
  return session
}

export async function PUT(request, { params }) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const existing = await prisma.propertyType.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ message: 'Property type not found' }, { status: 404 })
    }
    if (existing.deletedAt) {
      return NextResponse.json(
        { message: 'Cannot edit an archived property type. Restore it first.' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const labelEn = String(body.labelEn ?? existing.labelEn).trim()
    const labelEs = String(body.labelEs ?? existing.labelEs).trim() || labelEn
    if (!labelEn) {
      return NextResponse.json({ message: 'English label is required' }, { status: 400 })
    }

    let slug = slugifyPropertyType(body.slug ?? existing.slug)
    if (!slug) {
      return NextResponse.json({ message: 'Slug is required' }, { status: 400 })
    }

    const slugTaken = await prisma.propertyType.findFirst({
      where: { slug, NOT: { id } },
    })
    if (slugTaken) {
      return NextResponse.json({ message: 'Slug already exists' }, { status: 400 })
    }

    const sortOrder =
      body.sortOrder != null && body.sortOrder !== ''
        ? Number.parseInt(body.sortOrder, 10)
        : existing.sortOrder

    const updated = await prisma.propertyType.update({
      where: { id },
      data: {
        slug,
        labelEn,
        labelEs,
        descriptionEn: String(body.descriptionEn ?? existing.descriptionEn).trim(),
        descriptionEs: String(body.descriptionEs ?? existing.descriptionEs).trim(),
        sortOrder: Number.isFinite(sortOrder) ? sortOrder : existing.sortOrder,
      },
    })

    return NextResponse.json({ type: toClientPropertyType(updated) })
  } catch (error) {
    console.error('Update property type error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * Soft-delete a property type.
 * When live properties still use this type, body must include:
 * {
 *   propertyActions: [
 *     { propertyId: string, action: 'reassign', reassignTypeId: string }
 *     | { propertyId: string, action: 'archive' }
 *   ]
 * }
 * Every live property must have exactly one action.
 */
export async function DELETE(request, { params }) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const existing = await prisma.propertyType.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ message: 'Property type not found' }, { status: 404 })
    }
    if (existing.deletedAt) {
      return NextResponse.json({ message: 'Property type already archived' }, { status: 400 })
    }

    const liveProperties = await prisma.property.findMany({
      where: { typeId: id, deletedAt: null },
      select: { id: true, name: true, investmentId: true },
      orderBy: { name: 'asc' },
    })

    let body = {}
    try {
      body = await request.json()
    } catch {
      body = {}
    }

    if (liveProperties.length > 0) {
      const actions = Array.isArray(body.propertyActions) ? body.propertyActions : []
      const liveIds = new Set(liveProperties.map((property) => property.id))
      const seenIds = new Set()

      if (actions.length === 0) {
        return NextResponse.json(
          {
            message:
              'This type still has live properties. Choose reassign or archive for each one.',
            code: 'HAS_LIVE_PROPERTIES',
            properties: liveProperties,
          },
          { status: 409 }
        )
      }

      const reassignOps = []
      const archiveIds = []

      for (const entry of actions) {
        const propertyId = entry?.propertyId
        const action = entry?.action
        if (!propertyId || !liveIds.has(propertyId)) {
          return NextResponse.json(
            { message: 'One or more property decisions are invalid.' },
            { status: 400 }
          )
        }
        if (seenIds.has(propertyId)) {
          return NextResponse.json(
            { message: 'Duplicate property decision.' },
            { status: 400 }
          )
        }
        seenIds.add(propertyId)

        if (action === 'archive') {
          archiveIds.push(propertyId)
          continue
        }

        if (action === 'reassign') {
          const reassignTypeId = entry.reassignTypeId
          if (!reassignTypeId || reassignTypeId === id) {
            return NextResponse.json(
              { message: 'Choose a different active type for each reassigned property.' },
              { status: 400 }
            )
          }
          reassignOps.push({ propertyId, reassignTypeId })
          continue
        }

        return NextResponse.json(
          { message: 'Each property must be reassigned or archived.' },
          { status: 400 }
        )
      }

      if (seenIds.size !== liveIds.size) {
        return NextResponse.json(
          {
            message: 'Decide for every live property before archiving this type.',
            code: 'INCOMPLETE_PROPERTY_ACTIONS',
          },
          { status: 400 }
        )
      }

      const targetIds = [...new Set(reassignOps.map((op) => op.reassignTypeId))]
      if (targetIds.length > 0) {
        const targets = await prisma.propertyType.findMany({
          where: { id: { in: targetIds }, deletedAt: null },
          select: { id: true },
        })
        if (targets.length !== targetIds.length) {
          return NextResponse.json(
            { message: 'One or more target property types are missing or archived.' },
            { status: 400 }
          )
        }
      }

      const now = new Date()
      await prisma.$transaction([
        ...reassignOps.map((op) =>
          prisma.property.update({
            where: { id: op.propertyId },
            data: { typeId: op.reassignTypeId },
          })
        ),
        ...(archiveIds.length > 0
          ? [
              prisma.property.updateMany({
                where: { id: { in: archiveIds }, typeId: id, deletedAt: null },
                data: { deletedAt: now },
              }),
            ]
          : []),
        prisma.propertyType.update({
          where: { id },
          data: { deletedAt: now },
        }),
      ])
    } else {
      await prisma.propertyType.update({
        where: { id },
        data: { deletedAt: new Date() },
      })
    }

    const updated = await prisma.propertyType.findUnique({ where: { id } })
    return NextResponse.json({ type: toClientPropertyType(updated) })
  } catch (error) {
    console.error('Delete property type error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
