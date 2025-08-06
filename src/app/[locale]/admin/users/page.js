import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { PrismaClient } from '@prisma/client'
import UsersAdminClient from './UsersAdminClient'
import AdminNav from '../components/AdminNav'

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-main-blue mb-4">Error Loading Users</h1>
          <p className="text-main-text">Failed to load users. Please try again.</p>
        </div>
      </div>
    )
  } finally {
    await prisma.$disconnect()
  }
} 