'use client'

import { useMemo, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  buildCumulativeGrowthSeries,
  filterLedgerEvents,
  sliceCumulativeSeries,
} from '@/lib/portfolioGrowth'
import PortfolioGrowthChart from '@/components/invest/PortfolioGrowthChart'

const ALL_PROPERTIES = 'all'
const RANGE_OPTIONS = [
  { id: 'all', months: null },
  { id: '6', months: 6 },
  { id: '12', months: 12 },
  { id: '24', months: 24 },
]

export default function PortfolioGrowthSection({ investments = [], growthEvents }) {
  const t = useTranslations('Portfolio')
  const locale = useLocale()
  const [propertyId, setPropertyId] = useState(ALL_PROPERTIES)
  const [rangeId, setRangeId] = useState('all')

  const propertyOptions = useMemo(
    () =>
      investments
        .map((row) => {
          const id = row.propertyId || row.property?.id
          if (!id) return null
          const investmentId = row.property?.investmentId
          const name = row.property?.name || id
          return {
            id,
            label: investmentId != null ? `#${investmentId} ${name}` : name,
          }
        })
        .filter(Boolean),
    [investments]
  )

  const series = useMemo(() => {
    const filtered = filterLedgerEvents(growthEvents, propertyId)
    const full = buildCumulativeGrowthSeries(filtered)
    const selectedRange = RANGE_OPTIONS.find((option) => option.id === rangeId)
    return sliceCumulativeSeries(full, selectedRange?.months)
  }, [growthEvents, propertyId, rangeId])

  const hasEvents =
    (growthEvents?.contributions?.length || 0) > 0 ||
    (growthEvents?.distributions?.length || 0) > 0

  if (!hasEvents) return null

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="border-b border-border">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="min-w-0 font-heading text-2xl text-primary">{t('growthTitle')}</CardTitle>
          <div className="flex shrink-0 flex-wrap items-end gap-4 lg:justify-end">
            <div className="flex min-w-0 flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                {t('chartPropertyLabel')}
              </span>
              <Select value={propertyId} onValueChange={setPropertyId}>
                <SelectTrigger aria-label={t('chartPropertyLabel')} className="h-9 w-64 max-w-full">
                  <span className="truncate">
                    {propertyId === ALL_PROPERTIES
                      ? t('chartAllProperties')
                      : propertyOptions.find((option) => option.id === propertyId)?.label ||
                        t('chartAllProperties')}
                  </span>
                </SelectTrigger>
                <SelectContent align="start" className="min-w-[16rem]">
                  <SelectItem value={ALL_PROPERTIES}>{t('chartAllProperties')}</SelectItem>
                  {propertyOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex min-w-0 flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                {t('chartRangeLabel')}
              </span>
              <div className="flex flex-wrap gap-2">
                {RANGE_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setRangeId(option.id)}
                    className={cn(
                      buttonVariants({
                        variant: rangeId === option.id ? 'default' : 'outline',
                        size: 'sm',
                      })
                    )}
                  >
                    {t(`range${option.id === 'all' ? 'All' : `${option.id}m`}`)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {series.length > 0 ? (
          <PortfolioGrowthChart
            data={series}
            locale={locale}
            investedLabel={t('investedCapital')}
            returnedLabel={t('creditedReturns')}
          />
        ) : (
          <p className="py-10 text-center text-sm text-muted-foreground">{t('chartNoData')}</p>
        )}
      </CardContent>
    </Card>
  )
}
