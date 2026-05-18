'use client'

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
import { getPropertyTypeBadgeClass, getPropertyTypeLabelKey } from '@/lib/propertyTypeUi'

export default function PropertyDetailsClient({ property }) {
  const t = useTranslations('PropertyDetails')
  const locale = useLocale()
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

  if (!property) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
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
    <div className="min-h-screen bg-background">
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
            {t(getPropertyTypeLabelKey(property.type))}
          </span>
        </div>
      </header>

      <div className="container mx-auto px-4 py-10 md:py-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-12">
          <div className="lg:col-span-2 space-y-8">
            {property.images && property.images.length > 0 && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {property.images.map((image, index) => (
                  <div
                    key={index}
                    className="h-64 overflow-hidden rounded-xl border border-border/80 bg-muted"
                  >
                    <img
                      src={image}
                      alt={`${property.name} - ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {property.summary && (
              <Card className="border-border/80 shadow-sm">
                <CardHeader>
                  <CardTitle className="font-heading text-2xl text-primary">{t('executiveSummary')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="leading-relaxed text-muted-foreground">{property.summary}</p>
                </CardContent>
              </Card>
            )}

            {property.propertyFacts && (
              <Card className="border-border/80 shadow-sm">
                <CardHeader>
                  <CardTitle className="font-heading text-2xl text-primary">{t('propertyFacts')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-x-12 md:grid-cols-2">
                    {Object.entries(property.propertyFacts).map(([key, value]) => {
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
                </CardContent>
              </Card>
            )}

            {property.investmentDetails && (
              <Card className="border-border/80 shadow-sm">
                <CardHeader>
                  <CardTitle className="font-heading text-2xl text-primary">{t('investmentBreakdown')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-x-12 md:grid-cols-2">
                    {Object.entries(property.investmentDetails).map(([key, value]) => {
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
                </CardContent>
              </Card>
            )}
          </div>

          <aside className="lg:col-span-1">
            <Card className="sticky top-24 border-border/80 shadow-md">
              <CardHeader>
                <CardTitle className="font-heading text-xl text-primary">{t('investmentDetails')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-lg bg-muted/50 p-4 text-center">
                  <p className="text-sm text-muted-foreground">{t('totalPrice')}</p>
                  <p className="text-2xl font-semibold text-primary">${property.price.toLocaleString()}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4 text-center">
                  <p className="text-sm text-muted-foreground">{t('units')}</p>
                  <p className="text-2xl font-semibold text-primary">{property.unitCount}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4 text-center">
                  <p className="text-sm text-muted-foreground">{t('minimumInvestment')}</p>
                  <p className="text-2xl font-semibold text-main-gold">
                    ${property.minInvestment.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4 text-center">
                  <p className="text-sm text-muted-foreground">{t('estimatedRoi')}</p>
                  <p className="text-2xl font-semibold text-main-gold">{property.estimatedROI}%</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4 text-center">
                  <p className="text-sm text-muted-foreground">{t('timeline')}</p>
                  <p className="text-2xl font-semibold text-primary">
                    {property.estimatedMonths} {t('months')}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3 border-t border-border bg-muted/30">
                <Button type="button" variant="gold" size="cta" className="w-full">
                  {t('investNow')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full border-main-gold text-main-gold hover:border-main-gold hover:bg-main-gold/10 hover:text-main-gold"
                >
                  {t('downloadProspectus')}
                </Button>
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
