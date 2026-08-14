import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'
import { resolvePropertyProgressFields } from '@/lib/propertyStatusUi'
import {
  assertCanSetFundedStatus,
  enrichPropertyWithFunding,
  PLATFORM_MIN_INVESTMENT,
} from '@/lib/propertyFunding'
import {
  ensureUniquePropertySlug,
  getPropertyTypeByCode,
  getPropertyTypeById,
  notDeletedProperty,
  propertyTypeInclude,
  toClientProperty,
} from '@/lib/propertyTypes'
import {
  isPropertySummaryComplete,
  normalizePropertySummary,
  toSummaryFields,
} from '@/lib/propertySummary'

const prisma = new PrismaClient()
const parseRequiredInt = (value, field) => {
  const parsed = parseInt(value, 10)
  if (Number.isNaN(parsed)) {
    throw new Error(`${field} must be a whole number`)
  }
  return parsed
}

const parseRequiredFloat = (value, field) => {
  const parsed = parseFloat(value)
  if (Number.isNaN(parsed)) {
    throw new Error(`${field} must be a valid number`)
  }
  return parsed
}

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.type !== 'ADMIN') {
    return null
  }
  return session
}

/** Resolve a live (non-archived) property type from typeId (preferred) or a legacy type code. */
async function resolvePropertyType(body) {
  if (body.typeId) {
    const type = await getPropertyTypeById(prisma, body.typeId)
    if (!type) throw new Error('Property type not found')
    if (type.deletedAt) throw new Error('Cannot assign an archived property type')
    return type
  }
  if (body.type) {
    const type = await getPropertyTypeByCode(prisma, body.type)
    if (!type) throw new Error('Property type not found')
    if (type.deletedAt) throw new Error('Cannot assign an archived property type')
    return type
  }
  throw new Error('Missing required field: typeId')
}

export async function GET(request) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const includeArchived = searchParams.get('includeArchived') === '1'

    const properties = await prisma.property.findMany({
      where: includeArchived ? undefined : notDeletedProperty,
      include: propertyTypeInclude,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(properties.map(toClientProperty))
  } catch (error) {
    console.error('Error listing properties:', error)
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

    let propertyFacts = body.propertyFacts ?? {}
    let investmentDetails = body.investmentDetails ?? {}
    let propertyFactsSummary = body.propertyFactsSummary ?? {}
    let investmentDetailsSummary = body.investmentDetailsSummary ?? {}
    let summary = body.summary ?? {}
    try {
      if (typeof propertyFacts === 'string') {
        propertyFacts = JSON.parse(propertyFacts)
      }
      if (typeof investmentDetails === 'string') {
        investmentDetails = JSON.parse(investmentDetails)
      }
      if (typeof propertyFactsSummary === 'string') {
        propertyFactsSummary = JSON.parse(propertyFactsSummary)
      }
      if (typeof investmentDetailsSummary === 'string') {
        investmentDetailsSummary = JSON.parse(investmentDetailsSummary)
      }
      if (typeof summary === 'string') {
        summary = JSON.parse(summary)
      }
    } catch (e) {
      return NextResponse.json(
        { message: 'propertyFacts and investmentDetails must be valid JSON' },
        { status: 400 }
      )
    }

    summary = normalizePropertySummary(summary)
    propertyFactsSummary = normalizePropertySummary(propertyFactsSummary)
    investmentDetailsSummary = normalizePropertySummary(investmentDetailsSummary)

    if (!isPropertySummaryComplete(summary)) {
      return NextResponse.json(
        { message: 'Summary is required in English and Spanish' },
        { status: 400 }
      )
    }

    const requiredFields = [
      'investmentId',
      'name',
      'city',
      'state',
      'address',
      'price',
      'unitCount',
      'estimatedROI',
      'estimatedMonths',
    ]

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ message: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    let propertyType
    try {
      propertyType = await resolvePropertyType(body)
    } catch (typeError) {
      return NextResponse.json({ message: typeError.message }, { status: 400 })
    }

    let parsedFields
    let progressFields
    try {
      parsedFields = {
        investmentId: parseRequiredInt(body.investmentId, 'investmentId'),
        price: parseRequiredInt(body.price, 'price'),
        unitCount: parseRequiredInt(body.unitCount, 'unitCount'),
        minInvestment: PLATFORM_MIN_INVESTMENT,
        estimatedROI: parseRequiredFloat(body.estimatedROI, 'estimatedROI'),
        estimatedMonths: String(body.estimatedMonths).trim(),
      }
      progressFields = resolvePropertyProgressFields(body)
    } catch (parseError) {
      return NextResponse.json({ message: parseError.message }, { status: 400 })
    }

    if (!parsedFields.estimatedMonths) {
      return NextResponse.json({ message: 'estimatedMonths is required' }, { status: 400 })
    }

    try {
      if (progressFields.status === 'FUNDED') {
        await assertCanSetFundedStatus(prisma, {
          propertyId: null,
          goalPrice: parsedFields.price,
        })
      }
    } catch (fundingError) {
      return NextResponse.json({ message: fundingError.message }, { status: 400 })
    }

    const existingByInvestmentId = await prisma.property.findFirst({
      where: { investmentId: parsedFields.investmentId },
    })

    if (existingByInvestmentId) {
      return NextResponse.json(
        { message: 'Property with this Investment ID already exists' },
        { status: 400 }
      )
    }

    const slug = await ensureUniquePropertySlug(prisma, body.name)

    const property = await prisma.property.create({
      data: {
        investmentId: parsedFields.investmentId,
        name: body.name,
        slug,
        propertyType: { connect: { id: propertyType.id } },
        status: progressFields.status,
        executionStatus: progressFields.executionStatus,
        progressPercent: progressFields.progressPercent,
        startDate: progressFields.startDate,
        targetCompletionDate: progressFields.targetCompletionDate,
        completedAt: progressFields.completedAt,
        city: body.city,
        state: body.state,
        address: body.address,
        price: parsedFields.price,
        unitCount: parsedFields.unitCount,
        minInvestment: parsedFields.minInvestment,
        estimatedROI: parsedFields.estimatedROI,
        estimatedMonths: parsedFields.estimatedMonths,
        ...toSummaryFields(summary),
        propertyFacts: propertyFacts,
        propertyFactsSummary,
        investmentDetails: investmentDetails,
        investmentDetailsSummary,
        images: body.images || [],
      },
      include: propertyTypeInclude,
    })

    return NextResponse.json(
      await enrichPropertyWithFunding(prisma, toClientProperty(property))
    )
  } catch (error) {
    console.error('Error creating property:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
