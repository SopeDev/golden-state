'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import DocumentUploadFieldGrid from '@/components/invest/DocumentUploadField'
import { parseResubmitKinds, resubmitKindsToFieldNames } from '@/lib/investorDocumentResubmit'

export default function AccreditationForm({ propertyId, subtitle, resubmitFieldNames: resubmitFieldNamesProp }) {
  const t = useTranslations('Invest')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [resubmitFieldNames, setResubmitFieldNames] = useState(resubmitFieldNamesProp || [])

  useEffect(() => {
    if (resubmitFieldNamesProp) {
      setResubmitFieldNames(resubmitFieldNamesProp)
      return
    }

    const loadResubmitFields = async () => {
      const res = await fetch('/api/investor/account')
      if (!res.ok) return
      const data = await res.json()
      setResubmitFieldNames(resubmitKindsToFieldNames(parseResubmitKinds(data.accreditationResubmitKinds)))
    }

    loadResubmitFields()
  }, [resubmitFieldNamesProp])

  const isPartialResubmit = resubmitFieldNames.length > 0

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    const formData = new FormData(e.currentTarget)
    if (propertyId) {
      formData.set('propertyId', propertyId)
    }
    formData.set('selfCertify', formData.get('selfCertify') ? 'true' : 'false')

    const res = await fetch('/api/investor/accreditation', {
      method: 'POST',
      body: formData,
    })
    setSubmitting(false)
    if (!res.ok) {
      setError('failed')
      return
    }
    window.location.reload()
  }

  return (
    <Card className="overflow-hidden border-border/80 shadow-md">
      <CardHeader className="border-b border-border/60 bg-muted/20 pb-6">
        <CardTitle className="font-heading text-2xl text-primary md:text-3xl">
          {isPartialResubmit ? t('resubmitTitle') : t('verifyTitle')}
        </CardTitle>
        {subtitle ? <CardDescription className="mt-2 text-base">{subtitle}</CardDescription> : null}
        {isPartialResubmit ? (
          <CardDescription className="mt-2 text-base">{t('resubmitDesc')}</CardDescription>
        ) : null}
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-8 px-4 pt-8 sm:px-6">
          <div className="space-y-4">
            <div>
              <h2 className="font-heading text-lg font-semibold text-primary">
                {isPartialResubmit ? t('resubmitDocumentsTitle') : t('documentsTitle')}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {isPartialResubmit ? t('resubmitDocumentsDesc') : t('documentsDesc')}
              </p>
            </div>
            <DocumentUploadFieldGrid
              t={t}
              fieldNames={isPartialResubmit ? resubmitFieldNames : undefined}
              requiredFieldNames={isPartialResubmit ? resubmitFieldNames : undefined}
            />
            <p className="text-xs text-muted-foreground">{t('fileTypesHint')}</p>
          </div>

          <label
            className={cn(
              'flex cursor-pointer items-start gap-4 rounded-xl border border-main-gold/25',
              'bg-main-gold/[0.06] p-4 transition-colors hover:bg-main-gold/[0.09] sm:p-5'
            )}
          >
            <input
              type="checkbox"
              name="selfCertify"
              required
              className="mt-1 h-4 w-4 shrink-0 rounded border-input accent-[var(--main-gold)]"
            />
            <span className="flex gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-main-gold" aria-hidden="true" />
              <span className="space-y-1.5 text-sm leading-relaxed text-foreground">
                <span className="block">
                  {t('selfCertify')}
                  <span className="text-destructive" aria-hidden="true">
                    {' '}
                    *
                  </span>
                </span>
                <span className="block text-xs text-muted-foreground">{t('selfCertifyNote')}</span>
              </span>
            </span>
          </label>

          {error ? (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {t('uploadFailed')}
            </p>
          ) : null}

          <div className="flex justify-center">
            <Button type="submit" variant="gold" size="cta" disabled={submitting}>
              {submitting
                ? t('submitting')
                : isPartialResubmit
                  ? t('resubmitVerification')
                  : t('submitVerification')}
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  )
}
