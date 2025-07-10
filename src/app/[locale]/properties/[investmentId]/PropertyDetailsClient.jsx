'use client'

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import Button from '../../../components/Button';

export default function PropertyDetailsClient({ property }) {
  const t = useTranslations('PropertyDetails');

  if (!property) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-main-blue mb-4">{t('propertyNotFound')}</h1>
          <p className="text-main-text mb-6">{t('propertyNotFoundDesc')}</p>
          <Link href="/projects">
            <Button variant="secondary" className="font-semibold py-3 px-6 rounded-lg">
              {t('backToProjects')}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-main-blue text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center mb-4">
            <Link href="/projects">
              <Button variant="ghost" className="text-secondary-text hover:text-white transition-colors mr-4">
                {t('backToProjects')}
              </Button>
            </Link>
            <span className="bg-main-gold text-main-blue px-3 py-1 rounded-full text-sm font-semibold">
              #{property.investmentId}
            </span>
          </div>
          <h1 className="text-5xl font-bold mb-4">{property.name}</h1>
          <p className="text-xl text-secondary-text mb-4">
            {property.address}, {property.city}, {property.state}
          </p>
          <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
            property.type === 'BUILD_TO_SELL' 
              ? 'bg-secondary-blue text-white' 
              : 'bg-secondary-gold text-main-blue'
          }`}>
            {property.type === 'BUILD_TO_SELL' ? t('buildToSell') : t('buildToRent')}
          </span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Property Images */}
            {property.images && property.images.length > 0 && (
              <div className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {property.images.map((image, index) => (
                    <div key={index} className="h-64 bg-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={image}
                        alt={`${property.name} - Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            {property.summary && (
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-main-blue mb-4">{t('executiveSummary')}</h2>
                <div className="bg-white rounded-lg p-6 border border-off-white">
                  <p className="text-main-text leading-relaxed">{property.summary}</p>
                </div>
              </div>
            )}

            {/* Property Facts */}
            {property.propertyFacts && (
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-main-blue mb-4">{t('propertyFacts')}</h2>
                <div className="bg-white rounded-lg p-6 border border-off-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(property.propertyFacts).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center py-3 border-b border-off-white last:border-b-0">
                        <span className="font-semibold text-main-blue capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="text-main-text font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Investment Details */}
            {property.investmentDetails && (
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-main-blue mb-4">{t('investmentBreakdown')}</h2>
                <div className="bg-white rounded-lg p-6 border border-off-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(property.investmentDetails).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center py-3 border-b border-off-white last:border-b-0">
                        <span className="font-semibold text-main-blue capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="text-main-gold font-bold">
                          {typeof value === 'number' ? `$${value.toLocaleString()}` : value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 border border-off-white sticky top-8">
              <h3 className="text-2xl font-bold text-main-blue mb-6">{t('investmentDetails')}</h3>
              
              {/* Key Metrics */}
              <div className="space-y-4 mb-6">
                <div className="text-center p-4 bg-off-white rounded-lg">
                  <p className="text-sm text-main-text opacity-70">{t('totalPrice')}</p>
                  <p className="text-2xl font-bold text-main-blue">
                    ${property.price.toLocaleString()}
                  </p>
                </div>
                
                <div className="text-center p-4 bg-off-white rounded-lg">
                  <p className="text-sm text-main-text opacity-70">{t('units')}</p>
                  <p className="text-2xl font-bold text-main-blue">{property.unitCount}</p>
                </div>
                
                <div className="text-center p-4 bg-off-white rounded-lg">
                  <p className="text-sm text-main-text opacity-70">{t('minimumInvestment')}</p>
                  <p className="text-2xl font-bold text-main-gold">
                    ${property.minInvestment.toLocaleString()}
                  </p>
                </div>
                
                <div className="text-center p-4 bg-off-white rounded-lg">
                  <p className="text-sm text-main-text opacity-70">{t('estimatedRoi')}</p>
                  <p className="text-2xl font-bold text-main-gold">{property.estimatedROI}%</p>
                </div>
                
                <div className="text-center p-4 bg-off-white rounded-lg">
                  <p className="text-sm text-main-text opacity-70">{t('timeline')}</p>
                  <p className="text-2xl font-bold text-main-blue">{property.estimatedMonths} months</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button variant="action">
                  {t('investNow')}
                </Button>
                <Button variant="outlinegold">
                  {t('downloadProspectus')}
                </Button>
                <Button variant="outlineblue">
                  {t('scheduleCall')}
                </Button>
              </div>

              {/* Contact Info */}
              <div className="mt-8 pt-6 border-t border-off-white">
                <h4 className="font-semibold text-main-blue mb-3">{t('needHelp')}</h4>
                <p className="text-sm text-main-text mb-3">
                  {t('needHelpDesc')}
                </p>
                <Button variant="primary" className="w-full font-semibold py-3 px-6 rounded-lg">
                  {t('contactTeam')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 