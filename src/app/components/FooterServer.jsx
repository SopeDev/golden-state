import { PrismaClient } from '@prisma/client'
import Footer from './Footer'
import { listActivePropertyTypes, toClientPropertyType } from '@/lib/propertyTypes'

const prisma = new PrismaClient()

async function getPropertyTypes() {
  try {
    const types = await listActivePropertyTypes(prisma)
    return types.map(toClientPropertyType)
  } catch (error) {
    console.error('Error loading footer property types:', error)
    return []
  } finally {
    await prisma.$disconnect()
  }
}

export default async function FooterServer() {
  const propertyTypes = await getPropertyTypes()
  return <Footer propertyTypes={propertyTypes} />
}
