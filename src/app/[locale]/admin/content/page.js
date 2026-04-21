import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from '@/i18n/navigation'
import { PrismaClient } from '@prisma/client'
import AdminNav from '../components/AdminNav'
import ContentAdminClient from './ContentAdminClient'
import { getAboutFallbackByLocale } from '@/lib/pageContent'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const prisma = new PrismaClient()

export default async function ContentAdminPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user?.type !== 'ADMIN') {
    redirect('/')
  }

  try {
    const records = await prisma.pageContent.findMany({
      where: {
        pageKey: {
          in: ['HOME', 'ABOUT', 'FAQ'],
        },
      },
      orderBy: [{ pageKey: 'asc' }, { locale: 'asc' }],
    })

    const fallbackByPage = {
      HOME: { en: {}, es: {} },
      ABOUT: getAboutFallbackByLocale(),
      FAQ: { en: {}, es: {} },
    }

    return (
      <div className="min-h-screen bg-background">
        <AdminNav />
        <ContentAdminClient records={records} fallbackByPage={fallbackByPage} />
      </div>
    )
  } catch (error) {
    console.error('Error fetching page content:', error)
    return (
      <div className="min-h-screen bg-background">
        <AdminNav />
        <div className="flex min-h-[60vh] items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Error Loading Content</CardTitle>
              <CardDescription>Failed to load content records. Please try again.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  } finally {
    await prisma.$disconnect()
  }
}
