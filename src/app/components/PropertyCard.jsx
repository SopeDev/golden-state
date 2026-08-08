'use client'

import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatMoneyAmount } from '@/lib/formatMoney'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import PropertyProgressSummary from '@/components/invest/PropertyProgressSummary'
import { getPropertyTypeBadgeClass, resolvePropertyTypeLabel } from '@/lib/propertyTypeUi'

export default function PropertyCard({ property }) {
  const t = useTranslations('Projects')
  const locale = useLocale()
  const typeLabel = resolvePropertyTypeLabel(property, locale)

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

        <PropertyProgressSummary property={property} className="mb-6" showDates={false} compact />

        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">{t('price')}</p>
            <p className="text-xl font-semibold text-primary">${formatMoneyAmount(property.price)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">{t('units')}</p>
            <p className="text-xl font-semibold text-primary">{property.unitCount}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">{t('estRoi')}</p>
            <p className="text-xl font-semibold text-main-gold">{property.estimatedROI}%</p>
            <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{t('roiDisclaimer')}</p>
          </div>
        </div>

        <div className="mb-6 text-center">
          <p className="mb-1 text-sm text-muted-foreground">{t('timeline')}</p>
          <p className="text-lg font-medium text-primary">
            {property.estimatedMonths} {t('months')}
          </p>
        </div>

        {property.summary && (
          <div className="mt-auto">
            <p className="mb-2 text-sm text-muted-foreground">{t('summary')}</p>
            <p className="line-clamp-3 text-sm text-foreground">{property.summary}</p>
          </div>
        )}
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
