'use client'

import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import AccreditationForm from '@/components/invest/AccreditationForm'

export default function InvestFlowClient({ property }) {
  const { data: session } = useSession()
  const t = useTranslations('Invest')

  const accredited = session?.user?.accreditedStatus

  if (accredited === 'APPROVED') {
    return (
      <div className="flex-1 bg-muted/30 px-4 py-16">
        <Card className="mx-auto max-w-lg border-border/80 shadow-md">
          <CardHeader>
            <CardTitle className="font-heading text-2xl text-primary">{t('approvedTitle')}</CardTitle>
            <CardDescription>{t('approvedBody')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href={`/properties/${property.investmentId}`}
              className={cn(buttonVariants({ variant: 'default' }), 'w-full')}
            >
              {t('backToProperty', { property: property.name })}
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (accredited === 'PENDING_REVIEW') {
    return (
      <div className="flex-1 bg-muted/30 px-4 py-16">
        <Card className="mx-auto max-w-lg border-border/80 shadow-md">
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
      </div>
    )
  }

  return (
    <div className="flex-1 bg-muted/30 px-4 py-16">
      <div className="mx-auto max-w-2xl">
        <AccreditationForm
          propertyId={property.id}
          subtitle={t('verifySubtitle', { property: property.name })}
        />
      </div>
    </div>
  )
}
