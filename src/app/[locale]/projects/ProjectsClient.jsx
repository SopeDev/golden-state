'use client'

import { useTranslations } from 'next-intl'
import PropertyCard from '../../components/PropertyCard'

export default function ProjectsClient({ properties, headerKey = 'all', fallbackHeader = null }) {
  const t = useTranslations('Projects')

  const title = fallbackHeader?.title || t(`headers.${headerKey}.title`)
  const subtitle = fallbackHeader?.subtitle || t(`headers.${headerKey}.subtitle`)

  return (
    <div className="flex-1 bg-background">
      <section className="border-b border-border bg-muted/20">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <h1 className="font-heading text-4xl font-semibold text-primary md:text-5xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{subtitle}</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10">
        {properties.length === 0 ? (
          <div className="rounded-xl border border-border/80 bg-card py-16 text-center text-muted-foreground">
            <p className="text-lg">{t('noProjects')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
