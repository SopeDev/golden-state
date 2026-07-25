import { getServerSession } from 'next-auth'
import { getTranslations } from 'next-intl/server'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from '@/i18n/navigation'
import { PrismaClient } from '@prisma/client'
import UsersAdminClient from './UsersAdminClient'
import AdminNav from '../components/AdminNav'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toClientInvestorDocuments } from '@/lib/storage/r2'

const prisma = new PrismaClient()

export default async function UsersAdminPage() {
  const t = await getTranslations('Admin.users')
  const session = await getServerSession(authOptions)
  
  // Redirect if not authenticated as admin
  if (!session || session.user?.type !== 'ADMIN') {
    await redirect('/')
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        investorDocuments: { orderBy: { uploadedAt: 'desc' } },
        _count: {
          select: {
            investments: true,
          },
        },
      },
    })

    const usersForClient = users.map((user) => ({
      ...user,
      investorDocuments: toClientInvestorDocuments(user.investorDocuments),
    }))

    return (
      <div className="flex-1 bg-background">
        <AdminNav />
        <UsersAdminClient users={usersForClient} />
      </div>
    )
  } catch (error) {
    console.error('Error fetching users:', error)
    return (
      <div className="flex-1 bg-background">
        <AdminNav />
        <div className="flex min-h-[60vh] items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{t('loadErrorTitle')}</CardTitle>
              <CardDescription>{t('loadErrorDesc')}</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  } finally {
    await prisma.$disconnect()
  }
} 