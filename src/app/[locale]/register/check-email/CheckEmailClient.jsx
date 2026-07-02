'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function CheckEmailClient({ email }) {
  const t = useTranslations('Register')
  const locale = useLocale()
  const [sent, setSent] = useState(false)
  const [devVerificationLink, setDevVerificationLink] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleResend = async (e) => {
    e.preventDefault()
    const targetEmail = email.trim().toLowerCase()
    if (!targetEmail) return

    setSubmitting(true)
    setDevVerificationLink('')
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, locale }),
      })
      const data = await res.json().catch(() => ({}))
      setSent(true)
      if (data.devVerificationLink) {
        setDevVerificationLink(data.devVerificationLink)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex-1 bg-muted/30 px-4 py-16">
      <Card className="mx-auto max-w-md border-border/80 shadow-md">
        <CardHeader>
          <CardTitle className="font-heading text-2xl text-primary">{t('checkEmailTitle')}</CardTitle>
          <CardDescription className="space-y-3">
            <p>
              {t.rich('checkEmailBodySignedIn1', {
                email,
                bold: (chunks) => (
                  <strong className="font-semibold text-foreground">{chunks}</strong>
                ),
              })}
            </p>
            <p>{t('checkEmailBodySignedIn2')}</p>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleResend} className="space-y-3">
            <Button
              type="submit"
              variant="outline"
              className="w-full"
              disabled={submitting}
            >
              {t('checkEmailResend')}
            </Button>

            {sent ? (
              <p className="text-sm text-muted-foreground">
                {t('checkEmailResent', { email })}
              </p>
            ) : null}

            {devVerificationLink ? (
              <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
                <p className="font-medium text-foreground">{t('checkEmailDevLinkTitle')}</p>
                <p className="mt-1 text-muted-foreground">{t('checkEmailDevLinkDesc')}</p>
                <a
                  href={devVerificationLink}
                  className="mt-2 block break-all text-main-gold hover:underline"
                >
                  {t('checkEmailDevLinkCta')}
                </a>
              </div>
            ) : null}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
