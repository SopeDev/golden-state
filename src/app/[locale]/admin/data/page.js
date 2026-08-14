import { getLocale, getTranslations } from 'next-intl/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from '@/i18n/navigation'
import { PrismaClient } from '@prisma/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatUsd } from '@/lib/formatMoney'
import { getPropertyTypeLabel, propertyTypeInclude, toClientProperties } from '@/lib/propertyTypes'
import { AdminPageFrame, AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminInvestorLink, AdminPropertyLink } from '@/components/admin/AdminEntityLinks'

const prisma = new PrismaClient()

const badgeClass =
  'inline-flex items-center rounded-md bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground'

export default async function DataPage() {
  const t = await getTranslations('Admin.data')
  const locale = await getLocale()
  const dateLocale = locale === 'es' ? 'es-ES' : 'en-US'
  const session = await getServerSession(authOptions)

  if (!session || session.user?.type !== 'ADMIN') {
    await redirect('/')
  }

  try {
    const [propertiesRaw, users, investments] = await Promise.all([
      prisma.property.findMany({
        include: propertyTypeInclude,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.findMany({
        select: {
          id: true,
          email: true,
          type: true,
          provider: true,
          createdAt: true,
          _count: {
            select: { fundingContributions: true },
          },
        },
      }),
      prisma.fundingContribution.findMany({
        where: { status: 'ACTIVE' },
        include: {
          user: { select: { email: true } },
          property: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ])
    const properties = toClientProperties(propertiesRaw)

    const formatCurrency = (amount) => formatUsd(amount)

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString(dateLocale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    }

    return (
      <div className="flex-1 bg-background">
        <AdminPageFrame>
          <AdminPageHeader
            className="mb-8"
            eyebrow={t('eyebrow')}
            title={t('title')}
            description={t('subtitle')}
          />

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              {t('propertiesSection', { count: properties.length })}
            </h2>
            <div className="grid gap-4">
              {properties.map((property) => (
                <Card key={property.id}>
                  <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2 border-b pb-4">
                    <div>
                    <CardTitle className="text-lg">
                      <AdminPropertyLink property={property} />
                    </CardTitle>
                    </div>
                    <span className={badgeClass}>
                      {getPropertyTypeLabel(property.propertyType, locale)}
                    </span>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <p className="font-medium text-foreground">{t('investmentId')}</p>
                      <p className="text-muted-foreground">#{property.investmentId}</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{t('location')}</p>
                      <p className="text-muted-foreground">
                        {property.city}, {property.state}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{t('estimatedRoi')}</p>
                      <p className="text-amber-600 dark:text-amber-400">{property.estimatedROI}%</p>
                    </div>
                  </CardContent>
                  <div className="px-4 pb-4 text-xs text-muted-foreground">
                    {t('created')}: {formatDate(property.createdAt)}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              {t('usersSection', { count: users.length })}
            </h2>
            <div className="grid gap-4">
              {users.map((user) => (
                <Card key={user.id}>
                  <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2 border-b pb-4">
                    <CardTitle className="text-lg">
                      <AdminInvestorLink user={user} />
                    </CardTitle>
                    <span className={badgeClass}>{user.type}</span>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                    <div>
                      <p className="font-medium text-foreground">{t('userId')}</p>
                      <p className="text-muted-foreground">#{user.id}</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{t('provider')}</p>
                      <p className="text-muted-foreground">{user.provider || 'credentials'}</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{t('investments')}</p>
                      <p className="text-amber-600 dark:text-amber-400">{user._count.fundingContributions}</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{t('joined')}</p>
                      <p className="text-muted-foreground">{formatDate(user.createdAt)}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              {t('investmentsSection', { count: investments.length })}
            </h2>
            <div className="grid gap-4">
              {investments.map((investment) => (
                <Card key={investment.id}>
                  <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2 border-b pb-4">
                    <CardTitle className="text-base font-medium leading-snug">
                      {investment.user ? (
                        <AdminInvestorLink user={investment.user} />
                      ) : (
                        'Manual'
                      )}{' '}
                      → <AdminPropertyLink property={investment.property} />
                      {investment.source === 'MANUAL' ? ` (${investment.label || 'manual'})` : ''}
                    </CardTitle>
                    <span className={badgeClass}>{formatCurrency(investment.amount)}</span>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                    <div>
                      <p className="font-medium text-foreground">{t('investmentId')}</p>
                      <p className="text-muted-foreground">{investment.id}</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{t('property')}</p>
                      <p className="text-muted-foreground">
                        <AdminPropertyLink property={investment.property} />
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{t('date')}</p>
                      <p className="text-muted-foreground">{formatDate(investment.createdAt)}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </AdminPageFrame>
      </div>
    )
  } catch (error) {
    console.error('Error fetching data:', error)
    const tErr = await getTranslations('Admin.data')
    return (
      <div className="flex-1 bg-background">
        <div className="flex min-h-[60vh] items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{tErr('loadErrorTitle')}</CardTitle>
              <CardDescription>{tErr('loadErrorDesc')}</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  } finally {
    await prisma.$disconnect()
  }
}
