'use client'

import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatMoneyAmount } from '@/lib/formatMoney'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import PropertyProgressSummary from '@/components/invest/PropertyProgressSummary'
import PropertyCardHighlights from '@/components/invest/PropertyCardHighlights'
import { getLocalizedPropertySummary } from '@/lib/propertySummary'
import { getPropertyTypeBadgeClass, resolvePropertyTypeLabel } from '@/lib/propertyTypeUi'
import {
  getActualDurationMonths,
  getPropertyDisplayFlags,
} from '@/lib/propertyStatusUi'

function StatCell({ label, value, valueClassName }) {
  return (
    <div className="text-center">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={cn('text-xl font-semibold text-primary', valueClassName)}>{value}</p>
    </div>
  )
}

export default function PropertyCard({ property }) {
  const t = useTranslations('Projects')
  const locale = useLocale()
  const typeLabel = resolvePropertyTypeLabel(property, locale)
  const flags = getPropertyDisplayFlags(property)

  const actualMonths = getActualDurationMonths(property?.startDate, property?.completedAt)
  const estimatedMonths = property?.estimatedMonths
    ? String(property.estimatedMonths).trim()
    : ''
  const realizedRoi = Number(property?.actualRoi)
  const hasRealizedRoi = Number.isFinite(realizedRoi)

  const leftStat = flags.showInvestmentGoal
    ? {
        label: t('price'),
        value: `$${formatMoneyAmount(property.price)}`,
        valueClassName: 'text-primary',
      }
    : flags.showActualDuration && actualMonths
      ? {
          label: t('duration'),
          value: t('durationValue', { months: actualMonths }),
          valueClassName: 'text-primary',
        }
      : flags.showTimelineStat && estimatedMonths
        ? {
            label: t('timeline'),
            value: t('estimatedDurationValue', { months: estimatedMonths }),
            valueClassName: 'text-primary',
          }
        : null

  const rightStat = flags.showActualRoi && hasRealizedRoi
    ? {
        label: t('actualRoi'),
        value: `${realizedRoi}%`,
        valueClassName: 'text-main-gold',
      }
    : flags.showEstimatedRoi
      ? {
          label: t('estRoi'),
          value: `${property.estimatedROI}%`,
          valueClassName: 'text-main-gold',
        }
      : null

  const showStats = Boolean(leftStat || rightStat)
  const twoCols = Boolean(leftStat && rightStat)
  const summaryText = getLocalizedPropertySummary(property, locale)

  return (
    <Card className="flex h-full flex-col overflow-hidden border-border/80 py-0 shadow-md transition-shadow hover:shadow-lg gap-0">
      <div className="relative h-64 overflow-hidden bg-muted">
        {property.images && property.images.length > 0 ? (
          <Link href={`/properties/${property.investmentId}`} className="block h-full">
            <img
              src={property.images[0]}
              alt={property.name}
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </Link>
        ) : null}
        <div className="absolute left-4 top-4">
          <span className="rounded-full bg-main-gold px-3 py-1 text-sm font-semibold text-white">
            #{property.investmentId}
          </span>
        </div>
        <div className="absolute right-4 top-4">
          <span
            className={cn(
              'inline-block rounded-full px-3 py-1 text-xs font-semibold',
              getPropertyTypeBadgeClass(property.type)
            )}
          >
            {typeLabel}
          </span>
        </div>
      </div>

      <CardContent className="flex flex-1 flex-col p-6 pt-6">
        <Link href={`/properties/${property.investmentId}`}>
          <h3 className="mb-2 font-heading text-3xl font-semibold text-primary transition-colors hover:text-secondary-blue">
            {property.name}
          </h3>
        </Link>
        <p className="mb-4 text-muted-foreground">
          {property.address}, {property.city}, {property.state}
        </p>

        <PropertyProgressSummary property={property} className="mb-6" compact />

        {showStats ? (
          <div className={cn('mb-6 grid gap-4', twoCols ? 'grid-cols-2' : 'grid-cols-1')}>
            {leftStat ? (
              <StatCell
                label={leftStat.label}
                value={leftStat.value}
                valueClassName={leftStat.valueClassName}
              />
            ) : null}
            {rightStat ? (
              <StatCell
                label={rightStat.label}
                value={rightStat.value}
                valueClassName={rightStat.valueClassName}
              />
            ) : null}
          </div>
        ) : null}

        <PropertyCardHighlights property={property} locale={locale} className="mb-6" />

        {summaryText ? (
          <div className="mt-auto">
            <p className="mb-2 text-sm text-muted-foreground">{t('summary')}</p>
            <p className="line-clamp-3 whitespace-pre-line text-sm text-foreground">{summaryText}</p>
          </div>
        ) : null}
      </CardContent>

      <CardFooter className="bg-muted/20 px-6 pb-6 pt-4">
        <Link
          href={`/properties/${property.investmentId}`}
          className={cn(buttonVariants({ variant: 'gold', size: 'cta' }), 'w-full')}
        >
          {t('viewDetails')}
        </Link>
      </CardFooter>
    </Card>
  )
}
