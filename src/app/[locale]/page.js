import { useTranslations } from 'next-intl'
import Button from '../components/Button'
import Link from 'next/link'

export default function Home() {
  const t = useTranslations('Home')

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-main-blue to-secondary-blue text-white">
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 font-senlot">
              {t('heroTitle')}
            </h1>
            <p className="text-xl lg:text-2xl mb-8 text-gray-200 max-w-3xl mx-auto">
              {t('heroSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button href="/projects" variant="action">
                {t('exploreProjects')}
              </Button>
              <Button href="/register" variant="outlinegoldfull">
                {t('getStarted')}
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl lg:text-5xl font-bold text-main-blue mb-6 font-senlot">
                  {t('aboutTitle')}
                </h2>
                <p className="text-lg text-gray-700 mb-6">
                  {t('aboutDescription')}
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-main-gold rounded-full mt-1 flex-shrink-0"></div>
                    <p className="text-gray-700">{t('aboutPoint1')}</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-main-gold rounded-full mt-1 flex-shrink-0"></div>
                    <p className="text-gray-700">{t('aboutPoint2')}</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-main-gold rounded-full mt-1 flex-shrink-0"></div>
                    <p className="text-gray-700">{t('aboutPoint3')}</p>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="bg-main-gold h-80 rounded-lg shadow-2xl transform rotate-3"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-main-blue to-secondary-blue rounded-lg shadow-2xl transform -rotate-3"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-6xl font-bold mb-2">15+</div>
                    <div className="text-xl">{t('yearsExperience')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-off-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-main-blue mb-6 font-senlot">
              {t('servicesTitle')}
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              {t('servicesSubtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-main-gold rounded-lg mb-6 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-main-blue mb-4">{t('service1Title')}</h3>
              <p className="text-gray-700">{t('service1Description')}</p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-main-gold rounded-lg mb-6 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-main-blue mb-4">{t('service2Title')}</h3>
              <p className="text-gray-700">{t('service2Description')}</p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-main-gold rounded-lg mb-6 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-main-blue mb-4">{t('service3Title')}</h3>
              <p className="text-gray-700">{t('service3Description')}</p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-main-gold rounded-lg mb-6 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-main-blue mb-4">{t('service4Title')}</h3>
              <p className="text-gray-700">{t('service4Description')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-main-blue text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl lg:text-5xl font-bold mb-2">$50M+</div>
              <div className="text-lg text-gray-300">{t('totalInvestments')}</div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold mb-2">200+</div>
              <div className="text-lg text-gray-300">{t('propertiesSold')}</div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold mb-2">15%</div>
              <div className="text-lg text-gray-300">{t('averageRoi')}</div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold mb-2">500+</div>
              <div className="text-lg text-gray-300">{t('happyInvestors')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-main-gold to-secondary-gold">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 font-senlot">
            {t('ctaTitle')}
          </h2>
          <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
            {t('ctaDescription')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button href="/projects" variant="outlinebluefull">
              {t('browseProjects')}
            </Button>
            <Button href="/register" variant="outlinebluefull">
              {t('startInvesting')}
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
