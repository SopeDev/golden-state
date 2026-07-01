'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getPropertyTypeBadgeClass, getPropertyTypeLabelKey } from '@/lib/propertyTypeUi'

export default function PortfolioClient({ investments }) {
  const t = useTranslations('Portfolio')
  const tProjects = useTranslations('Projects')

  const totalInvested = investments.reduce((sum, investment) => sum + investment.amount, 0)
  const totalProperties = investments.length
  const averageROI =
    investments.length > 0
      ? investments.reduce((sum, investment) => sum + investment.property.estimatedROI, 0) /
        investments.length
      : 0

  return (
    <div className="flex-1 bg-background">
      <header className="bg-primary py-12 text-primary-foreground md:py-16">
        <div className="container mx-auto px-4">
          <Link
            href="/dashboard"
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'sm' }),
              'mb-4 text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground'
            )}
          >
            {t('backToDashboard')}
          </Link>
          <h1 className="font-heading text-4xl font-semibold md:text-5xl">{t('myPortfolio')}</h1>
          <p className="mt-3 text-lg text-primary-foreground/85">{t('portfolioSubtitle')}</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-10 md:px-6">
        {investments.length > 0 && (
          <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
            <Card className="border-border/80 shadow-sm">
              <CardContent className="flex items-center justify-between pt-6">
                <div>
                  <p className="text-sm text-muted-foreground">{t('totalProperties')}</p>
                  <p className="text-3xl font-semibold text-primary">{totalProperties}</p>
                </div>
                <div className="text-main-gold">
                  <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-sm">
              <CardContent className="flex items-center justify-between pt-6">
                <div>
                  <p className="text-sm text-muted-foreground">{t('totalInvested')}</p>
                  <p className="text-3xl font-semibold text-primary">
                    ${totalInvested.toLocaleString()}
                  </p>
                </div>
                <div className="text-main-gold">
                  <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-sm">
              <CardContent className="flex items-center justify-between pt-6">
                <div>
                  <p className="text-sm text-muted-foreground">{t('averageRoi')}</p>
                  <p className="text-3xl font-semibold text-main-gold">{averageROI.toFixed(1)}%</p>
                </div>
                <div className="text-main-gold">
                  <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L12 10.586 17.586 5H12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="overflow-hidden border-border/80 shadow-sm">
          <CardHeader className="border-b border-border bg-muted/30">
            <CardTitle className="font-heading text-2xl text-primary">{t('myInvestments')}</CardTitle>
          </CardHeader>

          {investments.length === 0 ? (
            <CardContent className="py-14 text-center">
              <div className="mb-4 text-muted-foreground opacity-50">
                <svg className="mx-auto h-16 w-16" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="mb-2 font-heading text-xl text-primary">{t('noInvestments')}</h3>
              <p className="mb-6 text-muted-foreground">{t('noInvestmentsDesc')}</p>
              <Link href="/projects" className={cn(buttonVariants({ variant: 'secondary', size: 'default' }))}>
                {t('browseProjects')}
              </Link>
            </CardContent>
          ) : (
            <div className="divide-y divide-border">
              {investments.map((investment) => (
                <div key={investment.id} className="p-6 transition-colors hover:bg-muted/20">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-main-gold px-3 py-1 text-sm font-semibold text-primary">
                          #{investment.property.investmentId}
                        </span>
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${getPropertyTypeBadgeClass(investment.property.type)}`}
                        >
                          {tProjects(getPropertyTypeLabelKey(investment.property.type))}
                        </span>
                      </div>
                      <h3 className="font-heading text-xl font-semibold text-primary">
                        {investment.property.name}
                      </h3>
                      <p className="mt-1 text-muted-foreground">
                        {investment.property.address}, {investment.property.city},{' '}
                        {investment.property.state}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span>
                          {t('units')}: {investment.property.unitCount}
                        </span>
                        <span>
                          {t('estimatedRoi')}: {investment.property.estimatedROI}%
                        </span>
                        <span>
                          {t('timeline')}: {investment.property.estimatedMonths} {t('months')}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-end lg:flex-col lg:items-end">
                      <div className="text-left sm:text-right">
                        <p className="text-sm text-muted-foreground">{t('investmentAmount')}</p>
                        <p className="text-2xl font-semibold text-main-gold">
                          ${investment.amount.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/properties/${investment.property.investmentId}`}
                          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                        >
                          {t('viewDetails')}
                        </Link>
                        <Button type="button" variant="secondary" size="sm" className="border-main-gold bg-transparent">
                          {t('downloadDocs')}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
