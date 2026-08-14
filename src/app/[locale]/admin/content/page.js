import { getTranslations } from 'next-intl/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from '@/i18n/navigation'
import { PrismaClient } from '@prisma/client'
import ContentAdminClient from './ContentAdminClient'
import {
  getAboutFallbackByLocale,
  getContactFallbackByLocale,
  getFaqFallbackByLocale,
  getHomeFallbackByLocale,
} from '@/lib/pageContent'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const prisma = new PrismaClient()

export default async function ContentAdminPage() {
  const t = await getTranslations('Admin.content')
  const session = await getServerSession(authOptions)

  if (!session || session.user?.type !== 'ADMIN') {
    await redirect('/')
  }

  try {
    const records = await prisma.pageContent.findMany({
      where: {
        pageKey: {
          in: ['HOME', 'ABOUT', 'FAQ', 'CONTACT'],
        },
      },
      orderBy: [{ pageKey: 'asc' }, { locale: 'asc' }],
    })

    const fallbackByPage = {
      HOME: getHomeFallbackByLocale(),
      ABOUT: getAboutFallbackByLocale(),
      FAQ: getFaqFallbackByLocale(),
      CONTACT: getContactFallbackByLocale(),
    }

    return (
      <div className="flex-1 bg-background">
        <ContentAdminClient records={records} fallbackByPage={fallbackByPage} />
      </div>
    )
  } catch (error) {
    console.error('Error fetching page content:', error)
    return (
      <div className="flex-1 bg-background">
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
