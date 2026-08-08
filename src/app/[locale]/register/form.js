'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/navigation'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import RequiredLabel from '@/components/ui/RequiredLabel'
import GoogleIcon from '@/components/GoogleIcon/GoogleIcon'

export default function Form() {
  const t = useTranslations('Register')
  const locale = useLocale()
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setFormError('')
    setErrors({})

    const formData = new FormData(e.currentTarget)
    const email = String(formData.get('email') || '').trim()
    const password = String(formData.get('password') || '')
    const confirmPassword = String(formData.get('confirmPassword') || '')
    const acceptLegal = formData.get('acceptLegal') === 'on'

    if (!acceptLegal) {
      setErrors({ acceptLegal: 'required' })
      setFormError(t('errorLegalRequired'))
      setSubmitting(false)
      return
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, confirmPassword, acceptLegal, locale }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        if (data.errors) {
          const nextErrors = { ...data.errors }
          if (nextErrors.email === 'email_taken') delete nextErrors.email
          setErrors(nextErrors)
        }
        const messageKey =
          data.message === 'Email already registered'
            ? 'errorEmailTaken'
            : data.message === 'Email delivery failed'
              ? 'errorEmailDelivery'
              : 'errorGeneric'
        setFormError(t(messageKey))
        return
      }

      const signInResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (signInResult?.error) {
        setFormError(t('errorGeneric'))
        return
      }

      router.push('/register/check-email')
      router.refresh()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex-1 bg-muted/30 px-4 py-16">
      <Card className="mx-auto w-full max-w-md border-border/80 shadow-md">
        <CardHeader>
          <CardTitle className="font-heading text-2xl text-primary">{t('title')}</CardTitle>
          <CardDescription>{t('subtitle')}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {formError ? (
              <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {formError}
              </p>
            ) : null}
            <div className="space-y-2">
              <RequiredLabel htmlFor="register-email">{t('email')}</RequiredLabel>
              <Input
                id="register-email"
                name="email"
                type="email"
                autoComplete="email"
                required
              />
              {errors.email ? (
                <p className="text-xs text-destructive">
                  {errors.email === 'email_taken' ? t('errorEmailTaken') : t('errorInvalidEmail')}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <RequiredLabel htmlFor="register-password">{t('password')}</RequiredLabel>
              <Input
                id="register-password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
              />
              {errors.password ? (
                <p className="text-xs text-destructive">{t('errorPasswordShort')}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <RequiredLabel htmlFor="register-confirm">{t('confirmPassword')}</RequiredLabel>
              <Input
                id="register-confirm"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
              />
              {errors.confirmPassword ? (
                <p className="text-xs text-destructive">{t('errorPasswordMismatch')}</p>
              ) : null}
            </div>
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border/80 bg-background px-3 py-2.5 text-sm">
              <input
                type="checkbox"
                name="acceptLegal"
                required
                className="mt-0.5"
              />
              <span className="leading-relaxed text-muted-foreground">
                {t.rich('legalAcknowledgment', {
                  terms: (chunks) => (
                    <Link href="/terms" className="font-medium text-primary underline-offset-2 hover:underline">
                      {chunks}
                    </Link>
                  ),
                  privacy: (chunks) => (
                    <Link href="/privacy" className="font-medium text-primary underline-offset-2 hover:underline">
                      {chunks}
                    </Link>
                  ),
                })}
              </span>
            </label>
            {errors.acceptLegal ? (
              <p className="text-xs text-destructive">{t('errorLegalRequired')}</p>
            ) : null}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? t('submitting') : t('submit')}
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 border-t border-border bg-muted/30">
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2"
              onClick={() => signIn('google', { callbackUrl: '/account/complete-profile' })}
            >
              <GoogleIcon className="size-5 shrink-0" />
              {t('googleSignUp')}
            </Button>
            <p className="text-center text-xs leading-relaxed text-muted-foreground">
              {t('googleLegalNote')}
            </p>
            <p className="text-center text-sm text-muted-foreground">
              {t('signInHint')}{' '}
              <Link
                href="/login"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                {t('signInLink')}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
