'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import Button from './Button'

export default function PropertyCard({ property }) {
  const t = useTranslations('Projects')
  
  // Debug translation loading
  console.log('Translation function:', t)
  console.log('Units translation:', t('units'))

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-off-white hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      {/* Property Image */}
      {property.images && property.images.length > 0 && (
        <div className="h-64 bg-gray-200 relative overflow-hidden">
          <Link href={`/properties/${property.investmentId}`}>
            <img
              src={property.images[0]}
              alt={property.name}
              className="w-full h-full object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
            />
          </Link>
          <div className="absolute top-4 left-4">
            <span className="bg-main-gold text-white px-3 py-1 rounded-full text-sm font-semibold">
              #{property.investmentId}
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-col flex-1 justify-between h-full">
        <div className="p-6 flex-1 flex flex-col">
          {/* Property Type Badge */}
          <div className="mb-4">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
              property.type === 'BUILD_TO_SELL' 
                ? 'bg-secondary-blue text-white' 
                : 'bg-secondary-gold text-main-blue'
            }`}>
              {property.type === 'BUILD_TO_SELL' ? t('buildToSell') : t('buildToRent')}
            </span>
          </div>

          {/* Property Name and Location */}
          <Link href={`/properties/${property.investmentId}`}>
            <h3 className="text-2xl font-bold text-main-blue mb-2 hover:text-secondary-blue transition-colors cursor-pointer">
              {property.name}
            </h3>
          </Link>
          <p className="text-main-text mb-4">
            {property.address}, {property.city}, {property.state}
          </p>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center">
              <p className="text-sm text-main-text opacity-70">{t('price')}</p>
              <p className="text-xl font-bold text-main-blue">
                ${property.price.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-main-text opacity-70">{t('units') || 'Units'}</p>
              <p className="text-xl font-bold text-main-blue">{property.unitCount}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-main-text opacity-70">{t('minInvestment')}</p>
              <p className="text-xl font-bold text-main-gold">
                ${property.minInvestment.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-main-text opacity-70">{t('estRoi')}</p>
              <p className="text-xl font-bold text-main-gold">{property.estimatedROI}%</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="mb-6">
            <p className="text-sm text-main-text opacity-70 mb-1">{t('timeline')}</p>
            <p className="text-lg font-semibold text-main-blue">{property.estimatedMonths} {t('months')}</p>
          </div>

          {/* Summary */}
          {property.summary && (
            <div>
              <p className="text-sm text-main-text opacity-70 mb-2">{t('summary')}</p>
              <p className="text-main-text text-sm line-clamp-3">{property.summary}</p>
            </div>
          )}
        </div>
        <div className="px-6 pb-6">
          {/* Action Button */}
          <Button 
            href={`/properties/${property.investmentId}`}
            variant="action"
          >
            {t('viewDetails')}
          </Button>
        </div>
      </div>
    </div>
  )
} 