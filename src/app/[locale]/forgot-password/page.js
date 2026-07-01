'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import RequiredLabel from '@/components/ui/RequiredLabel'

export default function ForgotPasswordPage() {
  const t = useTranslations('Account')
  const locale = useLocale()
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    const formData = new FormData(e.currentTarget)
    await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: formData.get('email'), locale }),
    })
    setSubmitting(false)
    setSent(true)
  }

  return (
    <div className="flex-1 bg-muted/30 px-4 py-16">
      <Card className="mx-auto max-w-md border-border/80 shadow-md">
        <CardHeader>
          <CardTitle className="font-heading text-2xl text-primary">{t('forgotTitle')}</CardTitle>
          <CardDescription>{t('forgotSubtitle')}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {sent ? (
              <p className="text-sm text-muted-foreground">{t('forgotSent')}</p>
            ) : (
              <div className="space-y-2">
                <RequiredLabel htmlFor="forgot-email">Email</RequiredLabel>
                <Input id="forgot-email" name="email" type="email" required />
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-3 border-t border-border bg-muted/30">
            {!sent ? (
              <Button type="submit" className="w-full" disabled={submitting}>
                {t('forgotSubmit')}
              </Button>
            ) : null}
            <Link href="/login" className="text-sm text-primary hover:underline">
              Sign in
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
