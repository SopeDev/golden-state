import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'
import { resolvePropertyProgressFields } from '@/lib/propertyStatusUi'

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

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.type !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    let propertyFacts = body.propertyFacts ?? {}
    let investmentDetails = body.investmentDetails ?? {}
    try {
      if (typeof propertyFacts === 'string') {
        propertyFacts = JSON.parse(propertyFacts)
      }
      if (typeof investmentDetails === 'string') {
        investmentDetails = JSON.parse(investmentDetails)
      }
    } catch (e) {
      return NextResponse.json(
        { message: 'propertyFacts and investmentDetails must be valid JSON' },
        { status: 400 }
      )
    }

    const requiredFields = [
      'investmentId',
      'name',
      'slug',
      'type',
      'city',
      'state',
      'address',
      'price',
      'unitCount',
      'minInvestment',
      'estimatedROI',
      'estimatedMonths',
      'summary',
    ]

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ message: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    let parsedFields
    let progressFields
    try {
      parsedFields = {
        investmentId: parseRequiredInt(body.investmentId, 'investmentId'),
        price: parseRequiredInt(body.price, 'price'),
        unitCount: parseRequiredInt(body.unitCount, 'unitCount'),
        minInvestment: parseRequiredInt(body.minInvestment, 'minInvestment'),
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

    const existingProperty = await prisma.property.findFirst({
      where: {
        OR: [{ investmentId: parsedFields.investmentId }, { slug: body.slug }],
      },
    })

    if (existingProperty) {
      return NextResponse.json(
        { message: 'Property with this Investment ID or slug already exists' },
        { status: 400 }
      )
    }

    const property = await prisma.property.create({
      data: {
        investmentId: parsedFields.investmentId,
        name: body.name,
        slug: body.slug,
        type: body.type,
        status: progressFields.status,
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
        summary: body.summary,
        propertyFacts: propertyFacts,
        investmentDetails: investmentDetails,
        images: body.images || [],
      },
    })

    return NextResponse.json(property)
  } catch (error) {
    console.error('Error creating property:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
