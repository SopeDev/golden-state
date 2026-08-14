import { getLocale, getTranslations } from 'next-intl/server'
import { PrismaClient } from '@prisma/client'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  cashOutRequestInclude,
  reinvestRequestInclude,
  returnDistributionInclude,
} from '@/lib/investorWallet'
import ReturnsAdminClient from './ReturnsAdminClient'

const prisma = new PrismaClient()

const SECTIONS = ['distributions', 'cashouts', 'reinvests']

export default async function ReturnsSectionPage({ section }) {
  const resolvedSection = SECTIONS.includes(section) ? section : 'distributions'
  const t = await getTranslations('Admin.returns')
  const locale = await getLocale()

  try {
    const [distributions, cashOuts, reinvests, investors, properties] = await Promise.all([
      resolvedSection === 'distributions'
        ? prisma.returnDistribution.findMany({
            include: returnDistributionInclude,
            orderBy: { distributedAt: 'desc' },
            take: 200,
          })
        : Promise.resolve([]),
      resolvedSection === 'cashouts'
        ? prisma.cashOutRequest.findMany({
            include: cashOutRequestInclude,
            orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
            take: 200,
          })
        : Promise.resolve([]),
      resolvedSection === 'reinvests'
        ? prisma.reinvestRequest.findMany({
            include: reinvestRequestInclude,
            orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
            take: 200,
          })
        : Promise.resolve([]),
      prisma.user.findMany({
        where: { type: 'INVESTOR' },
        select: { id: true, email: true, accountStatus: true },
        orderBy: { email: 'asc' },
      }),
      resolvedSection === 'cashouts'
        ? Promise.resolve([])
        : prisma.property.findMany({
            select: { id: true, name: true, investmentId: true },
            orderBy: { investmentId: 'asc' },
          }),
    ])

    return (
      <div className="flex-1 bg-background">
        <ReturnsAdminClient
          section={resolvedSection}
          initialDistributions={distributions}
          initialCashOuts={cashOuts}
          initialReinvests={reinvests}
          investors={investors}
          properties={properties}
          locale={locale}
        />
      </div>
    )
  } catch (error) {
    console.error('Error loading returns admin:', error)
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
