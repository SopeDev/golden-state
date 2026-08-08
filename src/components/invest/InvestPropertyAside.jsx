'use client'

import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatMoneyAmount } from '@/lib/formatMoney'
import { getPropertyTypeBadgeClass, resolvePropertyTypeLabel } from '@/lib/propertyTypeUi'

export default function InvestPropertyAside({ property }) {
  const t = useTranslations('Invest')
  const tProjects = useTranslations('Projects')
  const locale = useLocale()
  const images = Array.isArray(property.images) ? property.images.filter(Boolean) : []
  const typeLabel = resolvePropertyTypeLabel(property, locale)
  const location = [property.city, property.state].filter(Boolean).join(', ')
  const remaining =
    property.remainingCapacity != null
      ? Number(property.remainingCapacity)
      : Math.max(0, Number(property.price || 0) - Number(property.fundedAmount || 0))

  return (
    <aside className="space-y-5">
      <div className="overflow-hidden rounded-2xl border border-border/80 bg-background shadow-sm">
        <div className="relative aspect-[4/3] bg-muted">
          {images[0] ? (
            <img
              src={images[0]}
              alt={property.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
              {t('propertyPhotoFallback')}
            </div>
          )}
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
              #{property.investmentId}
            </span>
            {typeLabel ? (
              <span
                className={cn(
                  'rounded-full px-2.5 py-1 text-xs font-semibold',
                  getPropertyTypeBadgeClass(property.type)
                )}
              >
                {typeLabel}
              </span>
            ) : null}
          </div>
        </div>

        {images.length > 1 ? (
          <div className="grid grid-cols-3 gap-1 border-t border-border/60 p-1">
            {images.slice(1, 4).map((src, index) => (
              <div key={`${src}-${index}`} className="aspect-[4/3] overflow-hidden bg-muted">
                <img src={src} alt="" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-main-gold">
          {t('propertyAsideEyebrow')}
        </p>
        <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-primary">
          {property.name}
        </h2>
        {location || property.address ? (
          <p className="mt-2 text-sm text-muted-foreground">
            {property.address ? `${property.address}, ` : ''}
            {location}
          </p>
        ) : null}
      </div>

      <dl className="grid grid-cols-2 gap-3 rounded-2xl border border-border/80 bg-background p-4 text-sm shadow-sm">
        <div>
          <dt className="text-muted-foreground">{tProjects('price')}</dt>
          <dd className="mt-1 font-semibold text-primary">
            ${formatMoneyAmount(property.price)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t('remainingLabel')}</dt>
          <dd className="mt-1 font-semibold text-primary">
            ${formatMoneyAmount(remaining)}
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-muted-foreground">{tProjects('estRoi')}</dt>
          <dd className="mt-1 font-semibold text-main-gold">
            {property.estimatedROI != null ? `${property.estimatedROI}%` : '—'}
          </dd>
        </div>
      </dl>

      <Link
        href={`/properties/${property.investmentId}`}
        className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
      >
        {t('backToProperty', { property: property.name })}
      </Link>
    </aside>
  )
}
