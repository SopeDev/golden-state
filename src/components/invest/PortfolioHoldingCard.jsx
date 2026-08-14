'use client'

import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatMoneyAmount } from '@/lib/formatMoney'
import { getPropertyTypeBadgeClass, resolvePropertyTypeLabel } from '@/lib/propertyTypeUi'
import { getActualDurationMonths, getPropertyDisplayFlags } from '@/lib/propertyStatusUi'
import { getLedgerRoiPercent } from '@/lib/portfolioGrowth'
import PropertyProgressSummary from '@/components/invest/PropertyProgressSummary'

function Stat({ label, value, valueClassName, className }) {
  return (
    <div className={cn('px-3 text-center', className)}>
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className={cn('mt-1 text-lg font-semibold tabular-nums text-primary', valueClassName)}>
        {value}
      </p>
    </div>
  )
}

function formatTimeline(property, flags, durationMonths, t) {
  if (flags.showActualDuration && durationMonths) {
    return t('timelineShort', { months: durationMonths })
  }

  const estimated = String(property?.estimatedMonths || '').trim()
  if (!estimated) return '—'
  if (/^\d+(?:\s*-\s*\d+)?$/.test(estimated)) {
    return t('timelineShort', { months: estimated.replace(/\s+/g, '') })
  }
  return estimated
}

export default function PortfolioHoldingCard({ investment }) {
  const t = useTranslations('Portfolio')
  const locale = useLocale()
  const property = investment.property
  const flags = getPropertyDisplayFlags(property)
  const durationMonths = getActualDurationMonths(property?.startDate, property?.completedAt)
  const roiPct = getLedgerRoiPercent(investment.amount, investment.totalReturns)
  const roiValue = roiPct == null ? '—' : `${roiPct.toFixed(1)}%`
  const timelineLabel = flags.showActualDuration ? t('duration') : t('timeline')

  return (
    <div className="p-6 transition-colors hover:bg-muted/20">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="min-w-0 lg:w-[min(22rem,32%)] lg:shrink-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-main-gold px-3 py-1 text-sm font-semibold text-primary">
              #{property.investmentId}
            </span>
            <span
              className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${getPropertyTypeBadgeClass(property.type)}`}
            >
              {resolvePropertyTypeLabel(property, locale)}
            </span>
          </div>
          <h3 className="font-heading text-xl font-semibold text-primary">{property.name}</h3>
          <p className="mt-1 text-muted-foreground">
            {property.address}, {property.city}, {property.state}
          </p>
          <PropertyProgressSummary property={property} className="mt-4 max-w-md" compact />
        </div>

        <div className="mx-auto grid min-w-0 flex-1 grid-cols-2 md:grid-cols-4 md:divide-x md:divide-border">
          <Stat label={t('statInvested')} value={`$${formatMoneyAmount(investment.amount)}`} />
          <Stat
            label={t('statReturned')}
            value={`$${formatMoneyAmount(investment.totalReturns || 0)}`}
            valueClassName="text-main-gold"
          />
          <Stat label={t('statRoi')} value={roiValue} />
          <Stat
            label={timelineLabel}
            value={formatTimeline(property, flags, durationMonths, t)}
          />
        </div>

        <div className="flex shrink-0 flex-col gap-2 lg:w-44">
          <Link
            href={`/properties/${property.investmentId}`}
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'justify-center')}
          >
            {t('viewDetails')}
          </Link>
          <Link
            href={`/dashboard/portfolio/${property.id}/documents`}
            className={cn(
              buttonVariants({ variant: 'secondary', size: 'sm' }),
              'justify-center border-main-gold bg-transparent'
            )}
          >
            {t('downloadDocs')}
          </Link>
        </div>
      </div>
    </div>
  )
}
