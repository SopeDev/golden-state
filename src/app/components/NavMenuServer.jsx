import { PrismaClient } from '@prisma/client'
import NavMenu from './NavMenu'
import { listActivePropertyTypes, toClientPropertyType } from '@/lib/propertyTypes'

const prisma = new PrismaClient()

async function getPropertyTypes() {
  try {
    const types = await listActivePropertyTypes(prisma)
    return types.map(toClientPropertyType)
  } catch (error) {
    console.error('Error loading nav property types:', error)
    return []
  } finally {
    await prisma.$disconnect()
  }
}

export default async function NavMenuServer({ session }) {
  const propertyTypes = await getPropertyTypes()
  return <NavMenu session={session} propertyTypes={propertyTypes} />
}
