'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useLocale, useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/navigation'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { resolveInvestorOnboardingPath } from '@/lib/auth/userStatus'
import { cn } from '@/lib/utils'

const needsEmailVerification = (user) =>
  user?.type !== 'ADMIN' && user?.provider === 'credentials' && !user?.emailVerified

export default function VerifyFailedClient() {
  const t = useTranslations('Register')
  const locale = useLocale()
  const router = useRouter()
  const { data: session, status } = useSession()
  const sessionEmail = session?.user?.email || ''
  const isSignedIn = status === 'authenticated' && Boolean(sessionEmail)
  const pendingVerification = isSignedIn && needsEmailVerification(session.user)

  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleResend = async (e) => {
    e.preventDefault()
    if (!sessionEmail) return

    setSubmitting(true)
    try {
      await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: sessionEmail.trim().toLowerCase(), locale }),
      })
      setSent(true)
    } finally {
      setSubmitting(false)
    }
  }

  const handleContinue = () => {
    const path = resolveInvestorOnboardingPath(session?.user) || '/dashboard'
    router.push(path)
    router.refresh()
  }

  const loginHref = '/login?callbackUrl=/register/check-email'

  return (
    <div className="flex-1 bg-muted/30 px-4 py-16">
      <Card className="mx-auto max-w-md border-border/80 shadow-md">
        <CardHeader>
          <CardTitle className="font-heading text-2xl text-primary">{t('verifyFailedTitle')}</CardTitle>
          <CardDescription>
            {pendingVerification
              ? t('verifyFailedBodySignedIn')
              : isSignedIn
                ? t('verifyFailedAlreadyVerified')
                : t('verifyFailedBodyGuest')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {status === 'loading' ? (
            <Button type="button" variant="outline" className="w-full" disabled>
              {t('verifiedLoading')}
            </Button>
          ) : pendingVerification ? (
            <form onSubmit={handleResend} className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {t.rich('verifyFailedResendHint', {
                  email: sessionEmail,
                  bold: (chunks) => (
                    <strong className="font-semibold text-foreground">{chunks}</strong>
                  ),
                })}
              </p>
              <Button type="submit" variant="default" className="w-full" disabled={submitting}>
                {t('checkEmailResend')}
              </Button>
              {sent ? (
                <p className="text-sm text-muted-foreground">
                  {t('checkEmailResent', { email: sessionEmail })}
                </p>
              ) : null}
            </form>
          ) : isSignedIn ? (
            <Button type="button" variant="default" className="w-full" onClick={handleContinue}>
              {t('verifyFailedContinue')}
            </Button>
          ) : (
            <>
              <Link
                href={loginHref}
                className={cn(buttonVariants({ variant: 'default' }), 'w-full')}
              >
                {t('verifyFailedLoginCta')}
              </Link>
              <p className="text-center text-sm text-muted-foreground">
                {t('signInHint')}{' '}
                <Link href="/register" className="font-medium text-primary hover:underline">
                  {t('submit')}
                </Link>
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
