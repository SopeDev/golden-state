'use client'

import { useEffect } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { getPropertyTypeBadgeClass, resolvePropertyTypeLabel } from '@/lib/propertyTypeUi'
import {
  getActualDurationMonths,
  getPropertyDisplayFlags,
} from '@/lib/propertyStatusUi'
import { getOrderedPropertyEntries } from '@/lib/propertyDetailEntries'
import { getLocalizedPropertySummary } from '@/lib/propertySummary'
import { formatMoneyAmount } from '@/lib/formatMoney'
import InvestNowButton from '@/components/invest/InvestNowButton'
import PropertyProgressSummary from '@/components/invest/PropertyProgressSummary'
import ViewProgressDocumentsButton from '@/components/invest/ViewProgressDocumentsButton'
import PropertyImageGallery from '@/components/invest/PropertyImageGallery'
import { toGaPropertyItem, trackGaEvent } from '@/lib/analytics'

export default function PropertyDetailsClient({ property, canViewProgressDocuments = false }) {
  const t = useTranslations('PropertyDetails')
  const tProjects = useTranslations('Projects')
  const locale = useLocale()
  const flags = getPropertyDisplayFlags(property)
  const actualMonths = getActualDurationMonths(property?.startDate, property?.completedAt)
  const estimatedMonths = property?.estimatedMonths
    ? String(property.estimatedMonths).trim()
    : ''
  const formatFactLabel = (rawKey) => {
    return String(rawKey)
      .replace(/([A-Z])/g, ' $1')
      .replace(/[_-]+/g, ' ')
      .trim()
      .split(/\s+/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
  }

  const getLocalizedEntry = (rawKey, rawValue, preferredLocale) => {
    // Backward compatibility for legacy shape: { key: "value" }
    if (rawValue == null || typeof rawValue !== 'object' || Array.isArray(rawValue)) {
      return {
        label: formatFactLabel(rawKey),
        value: rawValue == null ? '' : String(rawValue),
      }
    }

    const localized = rawValue[preferredLocale] || rawValue.en || rawValue.es || {}
    return {
      label: localized.label || formatFactLabel(rawKey),
      value: localized.value == null ? '' : String(localized.value),
    }
  }

  const getLocalizedSummary = (summary, preferredLocale) => {
    if (!summary) return ''
    if (typeof summary === 'string') return summary.trim()
    if (typeof summary !== 'object' || Array.isArray(summary)) return ''
    const text =
      summary[preferredLocale] || summary.en || summary.es || ''
    return String(text).trim()
  }

  const getMeaningfulEntries = (bag, preferredLocale) => {
    return getOrderedPropertyEntries(bag).filter(([key, value]) => {
      const localized = getLocalizedEntry(key, value, preferredLocale)
      return Boolean(String(localized.label || '').trim() && String(localized.value || '').trim())
    })
  }

  const propertyFactsEntries = getMeaningfulEntries(property?.propertyFacts, locale)
  const investmentDetailsEntries = getMeaningfulEntries(property?.investmentDetails, locale)
  const propertyFactsIntro = getLocalizedSummary(property?.propertyFactsSummary, locale)
  const investmentDetailsIntro = getLocalizedSummary(
    property?.investmentDetailsSummary,
    locale
  )
  const executiveSummary = getLocalizedPropertySummary(property, locale)
  const showPropertyFacts = Boolean(propertyFactsIntro || propertyFactsEntries.length > 0)
  const showInvestmentDetails = Boolean(
    investmentDetailsIntro || investmentDetailsEntries.length > 0
  )

  useEffect(() => {
    if (!property) return
    trackGaEvent('view_item', {
      locale,
      items: [toGaPropertyItem(property)],
    })
  }, [locale, property])

  if (!property) {
    return (
      <div className="flex items-center justify-center bg-background px-4 py-24">
        <Card className="max-w-md border-border/80 text-center shadow-md">
          <CardHeader>
            <CardTitle className="font-heading text-2xl text-primary">{t('propertyNotFound')}</CardTitle>
            <CardDescription>{t('propertyNotFoundDesc')}</CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Link href="/projects" className={cn(buttonVariants({ variant: 'secondary', size: 'default' }))}>
              {t('backToProjects')}
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-background">
      <header className="bg-primary py-12 text-primary-foreground md:py-16">
        <div className="container mx-auto px-4">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Link
              href="/projects"
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'sm' }),
                'text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground'
              )}
            >
              {t('backToProjects')}
            </Link>
            <span className="rounded-full bg-main-gold px-3 py-1 text-sm font-semibold text-primary">
              #{property.investmentId}
            </span>
          </div>
          <h1 className="font-heading text-4xl font-semibold md:text-5xl">{property.name}</h1>
          <p className="mt-3 text-lg text-primary-foreground/85 md:text-xl">
            {property.address}, {property.city}, {property.state}
          </p>
          <span
            className={`mt-4 inline-block rounded-full px-4 py-2 text-sm font-semibold ${getPropertyTypeBadgeClass(property.type)}`}
          >
            {resolvePropertyTypeLabel(property, locale)}
          </span>
        </div>
      </header>

      <div className="container mx-auto px-4 py-10 md:py-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-12">
          <div className="lg:col-span-2 space-y-8">
            {property.images && property.images.length > 0 ? (
              <PropertyImageGallery images={property.images} propertyName={property.name} />
            ) : null}

            {executiveSummary ? (
              <Card className="border-border/80 shadow-sm">
                <CardHeader>
                  <CardTitle className="font-heading text-2xl text-primary">{t('executiveSummary')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line leading-relaxed text-foreground/85">
                    {executiveSummary}
                  </p>
                </CardContent>
              </Card>
            ) : null}

            {showPropertyFacts ? (
              <Card className="border-border/80 shadow-sm">
                <CardHeader>
                  <CardTitle className="font-heading text-2xl text-primary">{t('propertyFacts')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {propertyFactsIntro ? (
                    <p className="whitespace-pre-line leading-relaxed text-foreground/85">
                      {propertyFactsIntro}
                    </p>
                  ) : null}
                  {propertyFactsEntries.length > 0 ? (
                    <div className="grid grid-cols-1 gap-x-12 md:grid-cols-2">
                      {propertyFactsEntries.map(([key, value]) => {
                        const localized = getLocalizedEntry(key, value, locale)
                        return (
                          <div
                            key={key}
                            className="flex items-center justify-between gap-4 border-b border-border/60 py-3 last:border-b-0"
                          >
                            <span className="font-medium capitalize text-primary">
                              {localized.label}
                            </span>
                            <span className="text-right text-muted-foreground">{localized.value}</span>
                          </div>
                        )
                      })}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ) : null}

            {showInvestmentDetails ? (
              <Card className="border-border/80 shadow-sm">
                <CardHeader>
                  <CardTitle className="font-heading text-2xl text-primary">{t('investmentBreakdown')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {investmentDetailsIntro ? (
                    <p className="whitespace-pre-line leading-relaxed text-foreground/85">
                      {investmentDetailsIntro}
                    </p>
                  ) : null}
                  {investmentDetailsEntries.length > 0 ? (
                    <div className="grid grid-cols-1 gap-x-12 md:grid-cols-2">
                      {investmentDetailsEntries.map(([key, value]) => {
                        const localized = getLocalizedEntry(key, value, locale)
                        return (
                          <div
                            key={key}
                            className="flex items-center justify-between gap-4 border-b border-border/60 py-3 last:border-b-0"
                          >
                            <span className="font-medium capitalize text-primary">
                              {localized.label}
                            </span>
                            <span className="text-right font-semibold text-main-gold">
                              {localized.value}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ) : null}
          </div>

          <aside className="lg:col-span-1">
            <Card className="sticky top-24 border-border/80 shadow-md">
              <CardHeader>
                <CardTitle className="font-heading text-xl text-primary">{t('investmentDetails')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <PropertyProgressSummary property={property} variant="tile" />
                {flags.showInvestmentGoal ? (
                  <div className="rounded-lg bg-muted/50 p-4 text-center">
                    <p className="text-sm text-muted-foreground">{t('totalPrice')}</p>
                    <p className="text-2xl font-semibold text-primary">
                      ${formatMoneyAmount(property.price)}
                    </p>
                  </div>
                ) : null}
                {flags.showTimelineStat && estimatedMonths ? (
                  <div className="rounded-lg bg-muted/50 p-4 text-center">
                    <p className="text-sm text-muted-foreground">{t('timeline')}</p>
                    <p className="text-2xl font-semibold text-primary">
                      {tProjects('estimatedDurationValue', { months: estimatedMonths })}
                    </p>
                  </div>
                ) : null}
                {flags.showActualDuration && actualMonths ? (
                  <div className="rounded-lg bg-muted/50 p-4 text-center">
                    <p className="text-sm text-muted-foreground">{t('duration')}</p>
                    <p className="text-2xl font-semibold text-primary">
                      {tProjects('durationValue', { months: actualMonths })}
                    </p>
                  </div>
                ) : null}
                {flags.showEstimatedRoi ? (
                  <div className="rounded-lg bg-muted/50 p-4 text-center">
                    <p className="text-sm text-muted-foreground">{t('estimatedRoi')}</p>
                    <p className="text-2xl font-semibold text-main-gold">
                      {property.estimatedROI}%
                    </p>
                    <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
                      {t('roiDisclaimer')}
                    </p>
                  </div>
                ) : null}
                {flags.showActualRoi && Number.isFinite(Number(property?.actualRoi)) ? (
                  <div className="rounded-lg bg-muted/50 p-4 text-center">
                    <p className="text-sm text-muted-foreground">{t('actualRoi')}</p>
                    <p className="text-2xl font-semibold text-main-gold">
                      {Number(property.actualRoi)}%
                    </p>
                  </div>
                ) : null}
              </CardContent>
              <CardFooter className="flex flex-col gap-3 border-t border-border bg-muted/30">
                <InvestNowButton
                  propertyId={property.investmentId}
                  propertyStatus={property.status}
                  executionStatus={property.executionStatus}
                />
                <ViewProgressDocumentsButton
                  propertyId={property.id}
                  investmentId={property.investmentId}
                  propertyStatus={property.status}
                  canView={canViewProgressDocuments}
                />
                <Button type="button" variant="outline" size="lg" className="w-full">
                  {t('scheduleCall')}
                </Button>
              </CardFooter>
              <CardContent className="border-t border-border py-6">
                <h3 className="font-heading text-base font-semibold text-primary">{t('needHelp')}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{t('needHelpDesc')}</p>
                <Button type="button" variant="default" size="lg" className="mt-4 w-full">
                  {t('contactTeam')}
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  )
}
