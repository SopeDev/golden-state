import { getLocale, getTranslations } from 'next-intl/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from '@/i18n/navigation'
import { PrismaClient } from '@prisma/client'
import AdminNav from '../components/AdminNav'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import InvestmentsAdminClient from './InvestmentsAdminClient'
import { contributionInclude } from '@/lib/fundingContributions'
import { depositRequestInclude } from '@/lib/depositRequests'
import { notDeletedProperty } from '@/lib/propertyTypes'

const prisma = new PrismaClient()

export default async function InvestmentsAdminPage({ searchParams }) {
  const t = await getTranslations('Admin.investments')
  const locale = await getLocale()
  const session = await getServerSession(authOptions)
  const params = (await searchParams) || {}
  const requestedTab = typeof params.tab === 'string' ? params.tab : ''
  const initialTab = ['intents', 'contributions', 'deposits'].includes(requestedTab)
    ? requestedTab
    : 'intents'
  const initialPropertyId =
    typeof params.propertyId === 'string' && params.propertyId.trim()
      ? params.propertyId.trim()
      : ''

  if (!session || session.user?.type !== 'ADMIN') {
    await redirect('/')
  }

  try {
    const [contributions, deposits, properties, investors] = await Promise.all([
      prisma.fundingContribution.findMany({
        where: initialPropertyId ? { propertyId: initialPropertyId } : undefined,
        include: contributionInclude,
        orderBy: { createdAt: 'desc' },
        take: 200,
      }),
      prisma.depositRequest.findMany({
        where: initialPropertyId ? { propertyId: initialPropertyId } : undefined,
        include: depositRequestInclude,
        orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
        take: 200,
      }),
      prisma.property.findMany({
        where: notDeletedProperty,
        select: {
          id: true,
          name: true,
          investmentId: true,
          price: true,
          status: true,
        },
        orderBy: { investmentId: 'asc' },
      }),
      prisma.user.findMany({
        where: { type: 'INVESTOR' },
        select: { id: true, email: true, accountStatus: true },
        orderBy: { email: 'asc' },
      }),
    ])

    const propertyExists = properties.some((property) => property.id === initialPropertyId)
    const resolvedPropertyId = propertyExists ? initialPropertyId : ''

    return (
      <div className="flex-1 bg-background">
        <AdminNav />
        <div className="container mx-auto px-4 py-8">
          <Card className="mb-6 border-border/80">
            <CardHeader>
              <CardTitle className="font-heading text-2xl text-primary">{t('title')}</CardTitle>
              <CardDescription>{t('subtitle')}</CardDescription>
            </CardHeader>
          </Card>
          <InvestmentsAdminClient
            initialContributions={contributions}
            initialDeposits={deposits}
            properties={properties}
            investors={investors}
            locale={locale}
            initialTab={initialTab}
            initialPropertyId={resolvedPropertyId}
          />
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error loading investments admin:', error)
    return (
      <div className="flex-1 bg-background">
        <AdminNav />
        <div className="container mx-auto px-4 py-8">
          <Card>
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
