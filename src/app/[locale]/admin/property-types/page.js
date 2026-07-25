import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server'
import { PrismaClient } from '@prisma/client'
import AdminNav from '../components/AdminNav'
import PropertyTypesAdminClient from './PropertyTypesAdminClient'
import { toClientPropertyType } from '@/lib/propertyTypes'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const prisma = new PrismaClient()

export default async function PropertyTypesAdminPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.type !== 'ADMIN') {
    await redirect('/')
  }

  const t = await getTranslations('Admin.propertyTypes')

  try {
    const types = await prisma.propertyType.findMany({
      orderBy: [{ sortOrder: 'asc' }, { labelEn: 'asc' }],
    })

    const typesWithCounts = await Promise.all(
      types.map(async (type) => {
        const propertyCount = await prisma.property.count({
          where: { typeId: type.id, deletedAt: null },
        })
        const archivedPropertyCount = await prisma.property.count({
          where: { typeId: type.id, deletedAt: { not: null } },
        })
        return {
          ...toClientPropertyType(type),
          propertyCount,
          archivedPropertyCount,
        }
      })
    )

    return (
      <div className="flex-1 bg-background">
        <AdminNav />
        <div className="container mx-auto px-4 py-8">
          <PropertyTypesAdminClient initialTypes={typesWithCounts} />
        </div>
      </div>
    )
  } catch (error) {
    console.error('Property types admin error:', error)
    return (
      <div className="flex-1 bg-background">
        <AdminNav />
        <div className="container mx-auto px-4 py-8">
          <Card className="border-destructive/40">
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
