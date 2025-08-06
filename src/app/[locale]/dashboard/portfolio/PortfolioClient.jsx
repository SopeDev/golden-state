'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import Button from '../../../components/Button'

export default function PortfolioClient({ investments, user }) {
  const t = useTranslations('Portfolio')

  const totalInvested = investments.reduce((sum, investment) => sum + investment.amount, 0)
  const totalProperties = investments.length
  const averageROI = investments.length > 0 
    ? investments.reduce((sum, investment) => sum + investment.property.estimatedROI, 0) / investments.length 
    : 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-main-blue text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center mb-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-secondary-text hover:text-white transition-colors mr-4">
                {t('backToDashboard')}
              </Button>
            </Link>
          </div>
          <h1 className="text-5xl font-bold mb-4">{t('myPortfolio')}</h1>
          <p className="text-xl text-secondary-text">
            {t('portfolioSubtitle')}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-20 py-12">
        {/* Portfolio Summary Cards */}
        {investments.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-lg p-6 border border-off-white shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-main-text opacity-70">{t('totalProperties')}</p>
                    <p className="text-3xl font-bold text-main-blue">{totalProperties}</p>
                </div>
                <div className="text-main-gold">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                    </svg>
                </div>
                </div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-off-white shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-main-text opacity-70">{t('totalInvested')}</p>
                    <p className="text-3xl font-bold text-main-blue">
                    ${totalInvested.toLocaleString()}
                    </p>
                </div>
                <div className="text-main-gold">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                    </svg>
                </div>
                </div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-off-white shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-main-text opacity-70">{t('averageRoi')}</p>
                    <p className="text-3xl font-bold text-main-gold">{averageROI.toFixed(1)}%</p>
                </div>
                <div className="text-main-gold">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L12 10.586 17.586 5H12z" clipRule="evenodd"/>
                    </svg>
                </div>
                </div>
            </div>
            </div>
        )}

        {/* Investments List */}
        <div className="bg-white rounded-lg border border-off-white overflow-hidden shadow-md hover:shadow-lg transition-shadow">
          <div className="px-6 py-4 border-b border-off-white">
            <h2 className="text-2xl font-bold text-main-blue">{t('myInvestments')}</h2>
          </div>

          {investments.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-main-text opacity-50 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-main-blue mb-2">{t('noInvestments')}</h3>
              <p className="text-main-text mb-6">{t('noInvestmentsDesc')}</p>
              <Link href="/projects">
                <Button variant="secondary">
                  {t('browseProjects')}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-off-white">
              {investments.map((investment) => (
                <div key={investment.id} className="p-6 hover:bg-off-white transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4 lg:mb-0">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <span className="bg-main-gold text-main-blue px-3 py-1 rounded-full text-sm font-semibold mr-3">
                              #{investment.property.investmentId}
                            </span>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                              investment.property.type === 'BUILD_TO_SELL' 
                                ? 'bg-secondary-blue text-white' 
                                : 'bg-secondary-gold text-main-blue'
                            }`}>
                              {investment.property.type === 'BUILD_TO_SELL' ? t('buildToSell') : t('buildToRent')}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-main-blue mb-1">
                            {investment.property.name}
                          </h3>
                          <p className="text-main-text mb-2">
                            {investment.property.address}, {investment.property.city}, {investment.property.state}
                          </p>
                          <div className="flex flex-wrap gap-4 text-sm text-main-text">
                            <span>{t('units')}: {investment.property.unitCount}</span>
                            <span>{t('estimatedRoi')}: {investment.property.estimatedROI}%</span>
                            <span>{t('timeline')}: {investment.property.estimatedMonths} {t('months')}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-3 lg:ml-6">
                      <div className="text-right">
                        <p className="text-sm text-main-text opacity-70">{t('investmentAmount')}</p>
                        <p className="text-2xl font-bold text-main-gold">
                          ${investment.amount.toLocaleString()}
                        </p>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Link href={`/properties/${investment.property.investmentId}`}>
                          <Button variant="outlineblue" className="text-sm">
                            {t('viewDetails')}
                          </Button>
                        </Link>
                        <Button variant="outlinegold" className="text-sm">
                          {t('downloadDocs')}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 