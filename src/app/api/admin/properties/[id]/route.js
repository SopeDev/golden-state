import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is authenticated as admin
    if (!session || session.user?.type !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
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
    const duplicateProperty = await prisma.property.findFirst({
      where: {
        OR: [
          { investmentId: body.investmentId },
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
        investmentId: body.investmentId,
        name: body.name,
        slug: body.slug,
        type: body.type,
        city: body.city,
        state: body.state,
        address: body.address,
        price: body.price,
        unitCount: body.unitCount,
        minInvestment: body.minInvestment,
        estimatedROI: body.estimatedROI,
        estimatedMonths: body.estimatedMonths,
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

    const { id } = params

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