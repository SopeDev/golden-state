'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/navigation'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export default function VerifiedClient({ needsProfile }) {
  const t = useTranslations('Register')
  const router = useRouter()
  const { status, update } = useSession()
  const [continuing, setContinuing] = useState(false)

  const nextPath = needsProfile ? '/account/complete-profile' : '/account/pending'
  const isSignedIn = status === 'authenticated'
  const isLoading = status === 'loading' || continuing

  const handleContinue = async () => {
    setContinuing(true)
    try {
      await update()
      router.push(nextPath)
      router.refresh()
    } finally {
      setContinuing(false)
    }
  }

  return (
    <div className="flex-1 bg-muted/30 px-4 py-16">
      <Card className="mx-auto max-w-md border-border/80 shadow-md">
        <CardHeader>
          <CardTitle className="font-heading text-2xl text-primary">{t('verifiedTitle')}</CardTitle>
          <CardDescription>
            {needsProfile ? t('verifiedBodyProfile') : t('verifiedBody')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Button type="button" variant="default" className="w-full" disabled>
              {t('verifiedLoading')}
            </Button>
          ) : isSignedIn ? (
            <Button type="button" variant="default" className="w-full" onClick={handleContinue}>
              {needsProfile ? t('verifiedContinueProfile') : t('verifiedContinuePending')}
            </Button>
          ) : (
            <Link
              href={`/login?callbackUrl=${encodeURIComponent(nextPath)}`}
              className={cn(buttonVariants({ variant: 'default' }), 'w-full')}
            >
              {t('verifiedSignInToContinue')}
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
