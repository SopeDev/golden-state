'use client'

import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import AccreditationForm from '@/components/invest/AccreditationForm'

const BackToAccountLink = ({ label }) => (
  <div className="mb-8">
    <Link
      href="/dashboard/account"
      className="block text-sm text-muted-foreground transition-colors hover:text-primary"
    >
      {label}
    </Link>
  </div>
)

export default function AccountAccreditationClient() {
  const { data: session } = useSession()
  const t = useTranslations('MyAccount')
  const tInvest = useTranslations('Invest')

  const accredited = session?.user?.accreditedStatus

  if (accredited === 'APPROVED') {
    return (
      <div className="flex-1 bg-muted/30">
        <div className="container mx-auto max-w-3xl px-4 py-12 md:py-16">
          <BackToAccountLink label={t('backToAccount')} />
          <Card className="border-border/80 shadow-md">
            <CardHeader>
              <CardTitle className="font-heading text-2xl text-primary">
                {tInvest('approvedTitle')}
              </CardTitle>
              <CardDescription>{tInvest('approvedBody')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href="/dashboard/account"
                className={cn(buttonVariants({ variant: 'default' }), 'w-full')}
              >
                {t('backToAccount')}
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (accredited === 'PENDING_REVIEW') {
    return (
      <div className="flex-1 bg-muted/30">
        <div className="container mx-auto max-w-3xl px-4 py-12 md:py-16">
          <BackToAccountLink label={t('backToAccount')} />
          <Card className="border-border/80 shadow-md">
            <CardHeader>
              <CardTitle className="font-heading text-2xl text-primary">
                {tInvest('pendingTitle')}
              </CardTitle>
              <CardDescription>{tInvest('pendingBody')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href="/dashboard/account"
                className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
              >
                {t('backToAccount')}
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-muted/30">
      <div className="container mx-auto max-w-3xl px-4 py-12 md:py-16">
        <BackToAccountLink label={t('backToAccount')} />
        <AccreditationForm subtitle={t('accreditationFormSubtitle')} />
      </div>
    </div>
  )
}
