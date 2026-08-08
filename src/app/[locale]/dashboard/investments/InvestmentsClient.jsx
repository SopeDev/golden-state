'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import InvestmentRequestsPanel from '@/components/invest/InvestmentRequestsPanel'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function InvestmentsClient() {
  const t = useTranslations('InvestmentsPage')

  return (
    <div className="flex-1 bg-background">
      <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
        <Link
          href="/dashboard"
          className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
        >
          {t('backToDashboard')}
        </Link>

        <header className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-main-gold">
            {t('eyebrow')}
          </p>
          <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-primary md:text-4xl">
            {t('title')}
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
            {t('subtitle')}
          </p>
        </header>

        <div className="mt-10 space-y-8">
          <InvestmentRequestsPanel />

          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle className="font-heading text-xl text-primary">{t('returnsTitle')}</CardTitle>
              <CardDescription>{t('returnsDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{t('returnsComingSoon')}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
