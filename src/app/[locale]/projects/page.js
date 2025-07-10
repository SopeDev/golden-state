import { PrismaClient } from '@prisma/client'
import ProjectsClient from './ProjectsClient'

const prisma = new PrismaClient()

async function getProperties() {
  try {
    const properties = await prisma.property.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
    return properties
  } catch (error) {
    console.error('Error fetching properties:', error)
    return []
  } finally {
    await prisma.$disconnect()
  }
}

export default async function ProjectsPage() {
  const properties = await getProperties()

  return <ProjectsClient properties={properties} />
} 