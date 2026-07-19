import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
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

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is authenticated as admin
    if (!session || session.user?.type !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = [
      'investmentId', 'name', 'slug', 'type', 'city', 'state', 
      'address', 'price', 'unitCount', 'minInvestment', 
      'estimatedROI', 'estimatedMonths', 'summary'
    ]
    
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { message: `Missing required field: ${field}` }, 
          { status: 400 }
        )
      }
    }

    // Validate propertyFacts and investmentDetails as valid JSON objects
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

    // Check if property exists
    const existingProperty = await prisma.property.findUnique({
      where: { id }
    })

    if (!existingProperty) {
      return NextResponse.json(
        { message: 'Property not found' }, 
        { status: 404 }
      )
    }

    // Check if investmentId or slug already exists (excluding current property)
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
      progressFields = resolvePropertyProgressFields(body, existingProperty)
    } catch (parseError) {
      return NextResponse.json({ message: parseError.message }, { status: 400 })
    }

    if (!parsedFields.estimatedMonths) {
      return NextResponse.json({ message: 'estimatedMonths is required' }, { status: 400 })
    }

    const duplicateProperty = await prisma.property.findFirst({
      where: {
        OR: [
          { investmentId: parsedFields.investmentId },
          { slug: body.slug }
        ],
        NOT: { id }
      }
    })

    if (duplicateProperty) {
      return NextResponse.json(
        { message: 'Property with this Investment ID or slug already exists' }, 
        { status: 400 }
      )
    }

    // Update the property
    const property = await prisma.property.update({
      where: { id },
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
        images: body.images || []
      }
    })

    return NextResponse.json(property)
  } catch (error) {
    console.error('Error updating property:', error)
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is authenticated as admin
    if (!session || session.user?.type !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check if property exists
    const existingProperty = await prisma.property.findUnique({
      where: { id },
      include: {
        _count: {
          select: { investments: true }
        }
      }
    })

    if (!existingProperty) {
      return NextResponse.json(
        { message: 'Property not found' }, 
        { status: 404 }
      )
    }

    // Check if property has investments
    if (existingProperty._count.investments > 0) {
      return NextResponse.json(
        { message: 'Cannot delete property with existing investments' }, 
        { status: 400 }
      )
    }

    // Delete the property
    await prisma.property.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Property deleted successfully' })
  } catch (error) {
    console.error('Error deleting property:', error)
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 