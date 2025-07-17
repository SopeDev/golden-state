import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { PrismaClient } from '@prisma/client'
import PropertiesAdminClient from './PropertiesAdminClient'
import AdminNav from '../components/AdminNav'

const prisma = new PrismaClient()

export default async function PropertiesAdminPage() {
  const session = await getServerSession(authOptions)
  
  // Redirect if not authenticated as admin
  if (!session || session.user?.type !== 'ADMIN') {
    redirect('/')
  }

  try {
    const properties = await prisma.property.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return (
      <div className="min-h-screen bg-background">
        <AdminNav />
        <PropertiesAdminClient properties={properties} />
      </div>
    )
  } catch (error) {
    console.error('Error fetching properties:', error)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-main-blue mb-4">Error Loading Properties</h1>
          <p className="text-main-text">Failed to load properties. Please try again.</p>
        </div>
      </div>
    )
  } finally {
    await prisma.$disconnect()
  }
} 