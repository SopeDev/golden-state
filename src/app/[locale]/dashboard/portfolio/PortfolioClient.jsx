'use client'

import { useTranslations } from 'next-intl'
import { Building2, Landmark, Percent, TrendingUp } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatMoneyAmount } from '@/lib/formatMoney'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import PortfolioGrowthSection from '@/components/invest/PortfolioGrowthSection'
import PortfolioHoldingCard from '@/components/invest/PortfolioHoldingCard'
import { getLedgerRoiPercent, isLedgerRoiReady } from '@/lib/portfolioGrowth'

function SummaryTile({ label, value, hint, icon: Icon, valueClassName }) {
  return (
    <Card className="border-border/80 py-0 shadow-sm">
      <CardContent className="flex items-center justify-between px-5 py-5">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className={cn('text-3xl font-semibold text-primary', valueClassName)}>{value}</p>
          {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        {Icon ? <Icon className="h-8 w-8 shrink-0 text-main-gold" /> : null}
      </CardContent>
    </Card>
  )
}

export default function PortfolioClient({ investments = [], growthEvents }) {
  const t = useTranslations('Portfolio')

  const totalInvested = investments.reduce((sum, investment) => sum + investment.amount, 0)
  const totalReturns = investments.reduce(
    (sum, investment) => sum + (Number(investment.totalReturns) || 0),
    0
  )
  const totalProperties = investments.length
  const roiReady = isLedgerRoiReady(totalReturns)
  const roiPct = roiReady ? getLedgerRoiPercent(totalInvested, totalReturns) : null

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

      <div className="container mx-auto space-y-8 px-4 py-10 md:px-6">
        {investments.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 md:gap-6">
              <SummaryTile
                label={t('totalProperties')}
                value={totalProperties}
                icon={Building2}
              />
              <SummaryTile
                label={t('totalInvested')}
                value={`$${formatMoneyAmount(totalInvested)}`}
                icon={Landmark}
              />
              <SummaryTile
                label={t('lifetimeReturns')}
                value={`$${formatMoneyAmount(totalReturns)}`}
                icon={TrendingUp}
                valueClassName="text-main-gold"
              />
              <SummaryTile
                label={t('returnOnInvestment')}
                value={roiPct == null ? '—' : `${roiPct.toFixed(1)}%`}
                hint={roiPct == null ? t('roiPendingHint') : null}
                icon={Percent}
                valueClassName={roiPct == null ? 'text-muted-foreground' : 'text-main-gold'}
              />
            </div>

            <PortfolioGrowthSection investments={investments} growthEvents={growthEvents} />
          </>
        ) : null}

        <Card className="overflow-hidden border-border/80 shadow-sm">
          <CardHeader className="border-b border-border">
            <CardTitle className="font-heading text-2xl text-primary">{t('myInvestments')}</CardTitle>
          </CardHeader>

          {investments.length === 0 ? (
            <CardContent className="py-14 text-center">
              <div className="mb-4 text-muted-foreground opacity-50">
                <Building2 className="mx-auto h-16 w-16" />
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
                <PortfolioHoldingCard key={investment.id} investment={investment} />
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
