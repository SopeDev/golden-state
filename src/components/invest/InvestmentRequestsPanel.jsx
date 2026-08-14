'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { ClipboardList } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { canInvestorCancelMeetingRequest } from '@/lib/investmentIntents'
import { useMessaging } from '@/hooks/useMessaging'
import InvestmentRequestRow from '@/components/invest/InvestmentRequestRow'

export default function InvestmentRequestsPanel({ intents = [], loading, failed, onRefresh }) {
  const t = useTranslations('MyAccount')
  const { confirm } = useMessaging()
  const [cancellingId, setCancellingId] = useState(null)
  const [error, setError] = useState('')

  const cancelMeetingRequest = async (row) => {
    const propertyId = row.propertyId || row.property?.id
    if (!propertyId || !canInvestorCancelMeetingRequest(row.status)) return

    const confirmed = await confirm({
      title: t('cancelMeetingRequestTitle'),
      message: t('cancelMeetingRequestConfirm', {
        property: row.property?.name || t('investmentRequestsUnknownProperty'),
      }),
      confirmLabel: t('cancelMeetingRequestCta'),
      cancelLabel: t('cancelMeetingRequestKeep'),
      variant: 'destructive',
    })
    if (!confirmed) return

    setCancellingId(row.id)
    setError('')
    try {
      const res = await fetch('/api/investor/investment-intents', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId, action: 'cancel' }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || t('cancelMeetingRequestFailed'))
      await onRefresh?.()
    } catch (err) {
      setError(err.message || t('cancelMeetingRequestFailed'))
    } finally {
      setCancellingId(null)
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">{t('loading')}</p>
  }

  if (failed) {
    return <p className="text-sm text-destructive">{t('investmentRequestsLoadError')}</p>
  }

  if (intents.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border/80 px-6 py-10 text-center">
        <ClipboardList className="mx-auto size-10 text-muted-foreground/50" aria-hidden />
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          {t('investmentRequestsEmpty')}
        </p>
        <Link
          href="/projects"
          className={cn(buttonVariants({ variant: 'outline', size: 'default' }), 'mt-4 inline-flex')}
        >
          {t('browseProjectsCta')}
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <ul className="divide-y divide-border/70 rounded-lg border border-border/70 bg-background">
        {intents.map((row) => (
          <InvestmentRequestRow
            key={row.id}
            row={row}
            cancelling={cancellingId === row.id}
            onCancel={cancelMeetingRequest}
          />
        ))}
      </ul>
    </div>
  )
}
