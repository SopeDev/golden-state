'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { getPropertyTypeBadgeClass, getPropertyTypeLabelKey } from '@/lib/propertyTypeUi'

export default function PropertyCard({ property }) {
  const t = useTranslations('Projects')
  const typeKey = getPropertyTypeLabelKey(property.type)

  return (
    <Card className="flex h-full flex-col overflow-hidden border-border/80 py-0 shadow-md transition-shadow hover:shadow-lg gap-0">
      {property.images && property.images.length > 0 && (
        <div className="relative h-64 overflow-hidden bg-muted">
          <Link href={`/properties/${property.investmentId}`} className="block h-full">
            <img
              src={property.images[0]}
              alt={property.name}
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </Link>
          <div className="absolute left-4 top-4">
            <span className="rounded-full bg-main-gold px-3 py-1 text-sm font-semibold text-white">
              #{property.investmentId}
            </span>
          </div>
        </div>
      )}

      <CardContent className="flex flex-1 flex-col p-6 pt-6">
        <div className="mb-4">
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getPropertyTypeBadgeClass(property.type)}`}
          >
            {t(typeKey)}
          </span>
        </div>

        <Link href={`/properties/${property.investmentId}`}>
          <h3 className="mb-2 font-heading text-3xl font-semibold text-primary transition-colors hover:text-secondary-blue">
            {property.name}
          </h3>
        </Link>
        <p className="mb-4 text-muted-foreground">
          {property.address}, {property.city}, {property.state}
        </p>

        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">{t('price')}</p>
            <p className="text-xl font-semibold text-primary">${property.price.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">{t('units')}</p>
            <p className="text-xl font-semibold text-primary">{property.unitCount}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">{t('minInvestment')}</p>
            <p className="text-xl font-semibold text-main-gold">
              ${property.minInvestment.toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">{t('estRoi')}</p>
            <p className="text-xl font-semibold text-main-gold">{property.estimatedROI}%</p>
          </div>
        </div>

        <div className="mb-6">
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
