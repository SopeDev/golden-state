'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import RequiredLabel from '@/components/ui/RequiredLabel'

export default function CheckEmailPage() {
  const t = useTranslations('Register')
  const locale = useLocale()
  const { data: session, status } = useSession()
  const sessionEmail = session?.user?.email || ''
  const isSignedIn = status === 'authenticated' && Boolean(sessionEmail)

  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (sessionEmail) {
      setEmail(sessionEmail)
    }
  }, [sessionEmail])

  const handleResend = async (e) => {
    e.preventDefault()
    const targetEmail = (isSignedIn ? sessionEmail : email).trim().toLowerCase()
    if (!targetEmail) return

    setSubmitting(true)
    try {
      await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, locale }),
      })
      setSent(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex-1 bg-muted/30 px-4 py-16">
      <Card className="mx-auto max-w-md border-border/80 shadow-md">
        <CardHeader>
          <CardTitle className="font-heading text-2xl text-primary">{t('checkEmailTitle')}</CardTitle>
          {isSignedIn ? (
            <CardDescription className="space-y-3">
              <p>
                {t.rich('checkEmailBodySignedIn1', {
                  email: sessionEmail,
                  bold: (chunks) => (
                    <strong className="font-semibold text-foreground">{chunks}</strong>
                  ),
                })}
              </p>
              <p>{t('checkEmailBodySignedIn2')}</p>
            </CardDescription>
          ) : (
            <CardDescription>{t('checkEmailBodyGuest')}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleResend} className="space-y-3">
            {!isSignedIn ? (
              <div className="space-y-2">
                <RequiredLabel htmlFor="resend-email">{t('email')}</RequiredLabel>
                <Input
                  id="resend-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            ) : null}

            <Button
              type="submit"
              variant="outline"
              className="w-full"
              disabled={submitting || status === 'loading'}
            >
              {t('checkEmailResend')}
            </Button>

            {sent ? (
              <p className="text-sm text-muted-foreground">
                {t('checkEmailResent', {
                  email: isSignedIn ? sessionEmail : email.trim(),
                })}
              </p>
            ) : null}
          </form>

          {!isSignedIn && status !== 'loading' ? (
            <p className="text-sm text-muted-foreground">
              {t('signInHint')}{' '}
              <Link href="/login" className="font-medium text-primary hover:underline">
                {t('signInLink')}
              </Link>
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
