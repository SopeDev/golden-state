'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import RequiredLabel from '@/components/ui/RequiredLabel'

export default function ResetPasswordClient() {
  const t = useTranslations('Account')
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    const formData = new FormData(e.currentTarget)
    const password = formData.get('password')
    const confirm = formData.get('confirmPassword')
    if (password !== confirm) {
      setError('mismatch')
      setSubmitting(false)
      return
    }
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    })
    setSubmitting(false)
    if (!res.ok) {
      setError('failed')
      return
    }
    router.push('/login')
  }

  return (
    <div className="flex-1 bg-muted/30 px-4 py-16">
      <Card className="mx-auto max-w-md border-border/80 shadow-md">
        <CardHeader>
          <CardTitle className="font-heading text-2xl text-primary">{t('resetTitle')}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <RequiredLabel htmlFor="new-password">New password</RequiredLabel>
              <Input id="new-password" name="password" type="password" minLength={8} required />
            </div>
            <div className="space-y-2">
              <RequiredLabel htmlFor="confirm-password">Confirm password</RequiredLabel>
              <Input id="confirm-password" name="confirmPassword" type="password" minLength={8} required />
            </div>
            {error === 'mismatch' ? (
              <p className="text-sm text-destructive">{t('resetErrorMismatch')}</p>
            ) : null}
            {error === 'failed' ? (
              <p className="text-sm text-destructive">{t('resetErrorFailed')}</p>
            ) : null}
          </CardContent>
          <CardFooter className="border-t border-border bg-muted/30">
            <Button type="submit" className="w-full" disabled={submitting || !token}>
              {t('resetSubmit')}
            </Button>
          </CardFooter>
        </form>
        <CardFooter>
          <Link href="/forgot-password" className="text-sm text-muted-foreground hover:underline">
            Request new link
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
