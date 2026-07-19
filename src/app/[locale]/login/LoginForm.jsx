'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/navigation'
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

import { resolveInvestorOnboardingPath } from '@/lib/auth/userStatus'

const resolvePostLoginPath = (user) => {
  if (!user) return '/dashboard'
  if (user.type === 'ADMIN') return '/admin/users'
  if (user.accountStatus === 'REJECTED') return '/account/rejected'
  const onboardingPath = resolveInvestorOnboardingPath(user)
  if (onboardingPath) return onboardingPath
  return '/dashboard'
}

export default function LoginForm() {
  const t = useTranslations('Login')
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || ''
  const [submitting, setSubmitting] = useState(false)
  const [errorKey, setErrorKey] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleCredentials = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorKey('')

    const formData = new FormData(e.currentTarget)
    const email = String(formData.get('email') || '').trim()
    const password = String(formData.get('password') || '')

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setSubmitting(false)

    if (result?.error) {
      const code = result.error
      if (code === 'REJECTED') setErrorKey('errorRejected')
      else setErrorKey('errorInvalid')
      return
    }

    const sessionRes = await fetch('/api/auth/session')
    const session = await sessionRes.json()
    const user = session?.user
    const destination =
      callbackUrl && user?.accountStatus === 'ACTIVE' ? callbackUrl : resolvePostLoginPath(user)
    router.push(destination)
    router.refresh()
  }

  return (
    <div className="flex-1 bg-muted/30 px-4 py-16">
      <Card className="mx-auto w-full max-w-md border-border/80 shadow-md">
        <CardHeader>
          <CardTitle className="font-heading text-2xl text-primary">{t('title')}</CardTitle>
          <CardDescription>{t('subtitle')}</CardDescription>
        </CardHeader>
        <form onSubmit={handleCredentials}>
          <CardContent className="space-y-4">
            {errorKey ? (
              <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {t(errorKey)}
              </p>
            ) : null}
            <div className="space-y-2">
              <RequiredLabel htmlFor="login-email">{t('email')}</RequiredLabel>
              <Input id="login-email" name="email" type="email" autoComplete="email" required />
            </div>
            <div className="space-y-2">
              <RequiredLabel htmlFor="login-password">{t('password')}</RequiredLabel>
              <div className="relative">
                <Input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="pr-9"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex cursor-pointer items-center px-2.5 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" aria-hidden />
                  ) : (
                    <Eye className="size-4" aria-hidden />
                  )}
                </button>
              </div>
              <Link href="/forgot-password" className="inline-block text-xs text-primary hover:underline">
                {t('forgotLink')}
              </Link>
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? t('submitting') : t('submit')}
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 border-t border-border bg-muted/30">
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2"
              disabled={submitting}
              onClick={() =>
                signIn('google', {
                  callbackUrl: callbackUrl || '/account/complete-profile',
                })
              }
            >
              <GoogleIcon className="size-5 shrink-0" />
              {t('google')}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              {t('registerHint')}{' '}
              <Link href="/register" className="font-medium text-primary underline-offset-4 hover:underline">
                {t('registerLink')}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
