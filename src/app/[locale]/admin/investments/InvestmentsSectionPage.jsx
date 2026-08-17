import { getLocale, getTranslations } from 'next-intl/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from '@/i18n/navigation'
import { PrismaClient } from '@prisma/client'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import InvestmentsAdminClient from './InvestmentsAdminClient'
import { contributionInclude } from '@/lib/fundingContributions'
import { depositRequestInclude } from '@/lib/depositRequests'
import { notDeletedProperty } from '@/lib/propertyTypes'

const prisma = new PrismaClient()
const SECTIONS = ['intents', 'contributions', 'deposits']

export default async function InvestmentsSectionPage({ section, searchParams }) {
  const resolvedSection = SECTIONS.includes(section) ? section : 'intents'
  const t = await getTranslations('Admin.investments')
  const locale = await getLocale()
  const session = await getServerSession(authOptions)
  const params = searchParams || {}
  const initialPropertyId =
    typeof params.propertyId === 'string' && params.propertyId.trim()
      ? params.propertyId.trim()
      : ''
  const initialRecordId =
    typeof params.id === 'string' && params.id.trim() ? params.id.trim() : ''

  if (!session || session.user?.type !== 'ADMIN') {
    await redirect('/')
  }

  try {
    const [contributions, deposits, properties, investors] = await Promise.all([
      resolvedSection === 'contributions'
        ? prisma.fundingContribution.findMany({
            where: initialPropertyId ? { propertyId: initialPropertyId } : undefined,
            include: contributionInclude,
            orderBy: { createdAt: 'desc' },
            take: 200,
          })
        : Promise.resolve([]),
      resolvedSection === 'deposits'
        ? prisma.depositRequest.findMany({
            where: initialPropertyId ? { propertyId: initialPropertyId } : undefined,
            include: depositRequestInclude,
            orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
            take: 200,
          })
        : Promise.resolve([]),
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
        <InvestmentsAdminClient
          section={resolvedSection}
          initialContributions={contributions}
          initialDeposits={deposits}
          properties={properties}
          investors={investors}
          locale={locale}
          initialPropertyId={resolvedPropertyId}
          initialRecordId={initialRecordId}
        />
      </div>
    )
  } catch (error) {
    console.error('Error loading investments admin:', error)
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
