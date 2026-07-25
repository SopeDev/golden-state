import { getTranslations } from 'next-intl/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from '@/i18n/navigation'
import { PrismaClient } from '@prisma/client'
import PropertiesAdminClient from './PropertiesAdminClient'
import AdminNav from '../components/AdminNav'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { attachFundingToProperties } from '@/lib/propertyFunding'
import {
  listAllPropertyTypes,
  notDeletedProperty,
  propertyTypeInclude,
  toClientProperties,
  toClientPropertyType,
} from '@/lib/propertyTypes'

const prisma = new PrismaClient()

export default async function PropertiesAdminPage({ searchParams }) {
  const t = await getTranslations('Admin.properties')
  const session = await getServerSession(authOptions)
  const { includeArchived } = (await searchParams) || {}

  // Redirect if not authenticated as admin
  if (!session || session.user?.type !== 'ADMIN') {
    await redirect('/')
  }

  try {
    const [properties, propertyTypes] = await Promise.all([
      prisma.property.findMany({
        where: includeArchived === '1' ? undefined : notDeletedProperty,
        include: propertyTypeInclude,
        orderBy: { createdAt: 'desc' },
      }),
      listAllPropertyTypes(prisma, { includeDeleted: true }),
    ])
    const withFunding = await attachFundingToProperties(prisma, toClientProperties(properties))

    return (
      <div className="flex-1 bg-background">
        <AdminNav />
        <PropertiesAdminClient
          properties={withFunding}
          propertyTypes={propertyTypes.map(toClientPropertyType)}
        />
      </div>
    )
  } catch (error) {
    console.error('Error fetching properties:', error)
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