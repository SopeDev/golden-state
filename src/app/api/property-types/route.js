import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { listActivePropertyTypes, toClientPropertyType } from '@/lib/propertyTypes'

const prisma = new PrismaClient()

/** Public list of active property types for nav, filters, questionnaires. */
export async function GET() {
  try {
    const types = await listActivePropertyTypes(prisma)
    return NextResponse.json({
      types: types.map(toClientPropertyType),
    })
  } catch (error) {
    console.error('Public property types error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
