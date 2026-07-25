'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import ProfileQuestionnaireFields from '@/components/auth/ProfileQuestionnaireFields'
import { formToProfilePayload } from '@/lib/auth/formPayload'

export default function CompleteProfileClient({ defaultLocation }) {
  const t = useTranslations('Account')
  const tRegister = useTranslations('Register')
  const locale = useLocale()
  const router = useRouter()
  const { update } = useSession()
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setErrors({})
    const payload = formToProfilePayload(e.currentTarget)
    payload.locale = locale

    const res = await fetch('/api/auth/complete-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json().catch(() => ({}))
    setSubmitting(false)

    if (!res.ok) {
      if (data.errors) setErrors(data.errors)
      return
    }

    await update()

    router.push('/account/pending')
  }

  return (
    <div className="flex-1 bg-muted/30 px-4 py-16">
      <Card className="mx-auto max-w-2xl border-border/80 shadow-md">
        <CardHeader>
          <CardTitle className="font-heading text-2xl text-primary">{t('completeProfileTitle')}</CardTitle>
          <CardDescription>{t('completeProfileSubtitle')}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <ProfileQuestionnaireFields errors={errors} defaultLocation={defaultLocation} />
            <p className="text-xs text-muted-foreground">{tRegister('requiredFieldsNote')}</p>
          </CardContent>
          <CardFooter className="border-t border-border bg-muted/30">
            <Button type="submit" className="w-full" disabled={submitting}>
              {t('completeProfileSubmit')}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
