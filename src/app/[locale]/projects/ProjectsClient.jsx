'use client'

import PropertyCard from '../../components/PropertyCard'
import { useTranslations } from 'next-intl'

export default function ProjectsClient({ properties }) {
  const t = useTranslations('Projects')

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-main-blue mb-4">{t('title')}</h1>
          <p className="text-lg text-main-text max-w-2xl">
            {t('subtitle')}
          </p>
        </div>

        {properties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-main-text text-lg">{t('noProjects')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 