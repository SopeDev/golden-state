import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is authenticated as admin
    if (!session || session.user?.type !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Convert investmentId to integer and validate
    const investmentId = parseInt(body.investmentId, 10)
    if (isNaN(investmentId)) {
      return NextResponse.json(
        { message: 'Invalid investmentId: must be a number' },
        { status: 400 }
      )
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

    // Check if investmentId or slug already exists
    const existingProperty = await prisma.property.findFirst({
      where: {
        OR: [
          { investmentId: investmentId },
          { slug: body.slug }
        ]
      }
    })

    if (existingProperty) {
      return NextResponse.json(
        { message: 'Property with this Investment ID or slug already exists' }, 
        { status: 400 }
      )
    }

    // Create the property
    const property = await prisma.property.create({
      data: {
        investmentId: investmentId,
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
    console.error('Error creating property:', error)
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 