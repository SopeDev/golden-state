import { getTranslations } from 'next-intl/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from '@/i18n/navigation'
import { PrismaClient } from '@prisma/client'
import PropertiesAdminClient from './PropertiesAdminClient'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { hasOperatorPermission, OPERATOR_PERMISSIONS } from '@/lib/operatorPermissions'

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
  const params = (await searchParams) || {}
  const { includeArchived } = params

  // Redirect if not authenticated as admin
  if (!session || !['ADMIN', 'OPERATOR'].includes(session.user?.type)) {
    await redirect('/')
  }
  const canViewPropertyDetails = hasOperatorPermission(
    session.user,
    OPERATOR_PERMISSIONS.VIEW_PROPERTIES
  )
  const initialSelectedId =
    canViewPropertyDetails && typeof params.id === 'string' && params.id.trim()
      ? params.id.trim()
      : ''

  try {
    const [properties, propertyTypes] = await Promise.all([
      prisma.property.findMany({
        where: includeArchived === '1' ? undefined : notDeletedProperty,
        include: propertyTypeInclude,
        orderBy: { createdAt: 'desc' },
      }),
      listAllPropertyTypes(prisma, { includeDeleted: true }),
    ])
    const clientProperties = toClientProperties(properties)
    const withFunding = canViewPropertyDetails
      ? await attachFundingToProperties(prisma, clientProperties)
      : clientProperties.map((property) => ({
          id: property.id,
          investmentId: property.investmentId,
          name: property.name,
          city: property.city,
          state: property.state,
          typeId: property.typeId,
          propertyType: property.propertyType,
          status: property.status,
          executionStatus: property.executionStatus,
          deletedAt: property.deletedAt,
        }))

    return (
      <div className="flex-1 bg-background">
        <PropertiesAdminClient
          properties={withFunding}
          propertyTypes={propertyTypes.map(toClientPropertyType)}
          initialSelectedId={initialSelectedId}
          canViewPropertyDetails={canViewPropertyDetails}
        />
      </div>
    )
  } catch (error) {
    console.error('Error fetching properties:', error)
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
