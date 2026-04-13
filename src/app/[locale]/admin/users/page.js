import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from '@/i18n/navigation'
import { PrismaClient } from '@prisma/client'
import UsersAdminClient from './UsersAdminClient'
import AdminNav from '../components/AdminNav'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const prisma = new PrismaClient()

export default async function UsersAdminPage() {
  const session = await getServerSession(authOptions)
  
  // Redirect if not authenticated as admin
  if (!session || session.user?.type !== 'ADMIN') {
    redirect('/')
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            investments: true
          }
        }
      }
    })

    return (
      <div className="min-h-screen bg-background">
        <AdminNav />
        <UsersAdminClient users={users} />
      </div>
    )
  } catch (error) {
    console.error('Error fetching users:', error)
    return (
      <div className="min-h-screen bg-background">
        <AdminNav />
        <div className="flex min-h-[60vh] items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Error Loading Users</CardTitle>
              <CardDescription>Failed to load users. Please try again.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  } finally {
    await prisma.$disconnect()
  }
} 