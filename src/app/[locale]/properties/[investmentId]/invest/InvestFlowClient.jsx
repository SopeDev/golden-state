'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import AccreditationForm from '@/components/invest/AccreditationForm'
import AccreditedInvestPanel from '@/components/invest/AccreditedInvestPanel'
import InvestPropertyAside from '@/components/invest/InvestPropertyAside'

export default function InvestFlowClient({ property }) {
  const { data: session } = useSession()
  const t = useTranslations('Invest')
  const [hasActiveRequest, setHasActiveRequest] = useState(false)

  const accredited = session?.user?.accreditedStatus

  let panel = null

  if (accredited === 'APPROVED') {
    panel = (
      <AccreditedInvestPanel
        property={property}
        onActiveRequestChange={setHasActiveRequest}
      />
    )
  } else if (accredited === 'PENDING_REVIEW') {
    panel = (
      <Card className="border-border/80 shadow-md">
        <CardHeader>
          <CardTitle className="font-heading text-2xl text-primary">{t('pendingTitle')}</CardTitle>
          <CardDescription>{t('pendingBody')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/dashboard/account"
            className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
          >
            {t('viewAccount')}
          </Link>
        </CardContent>
      </Card>
    )
  } else {
    panel = (
      <AccreditationForm
        propertyId={property.id}
        subtitle={t('verifySubtitle', { property: property.name })}
      />
    )
  }

  return (
    <div className="flex-1 bg-muted/30 px-4 py-10 md:px-6 md:py-14">
      <div className="mx-auto max-w-6xl">
        {hasActiveRequest ? (
          <Link
            href="/dashboard/activity"
            className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
          >
            {t('backToInvestments')}
          </Link>
        ) : null}

        <div
          className={cn(
            'grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-10 lg:items-start',
            hasActiveRequest && 'mt-6'
          )}
        >
          <InvestPropertyAside property={property} />
          <div className="min-w-0">{panel}</div>
        </div>
      </div>
    </div>
  )
}
