import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from '@/i18n/navigation'
import { PrismaClient } from '@prisma/client'
import PropertiesAdminClient from './PropertiesAdminClient'
import AdminNav from '../components/AdminNav'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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
      <div className="min-h-screen bg-background">
        <AdminNav />
        <div className="flex min-h-[60vh] items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Error Loading Properties</CardTitle>
              <CardDescription>Failed to load properties. Please try again.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  } finally {
    await prisma.$disconnect()
  }
} 