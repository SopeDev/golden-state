'use client'

import { useCallback, useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { formatUsd } from '@/lib/formatMoney'
import { canInvestorCancelMeetingRequest, meetingChannelLabelKey } from '@/lib/investmentIntents'
import { useMessaging } from '@/hooks/useMessaging'

const STATUS_BADGE = {
  MEETING_REQUESTED: 'bg-amber-100 text-amber-900',
  AWAITING_WIRE: 'bg-sky-100 text-sky-900',
  COMPLETED: 'bg-emerald-100 text-emerald-900',
  CANCELLED: 'bg-muted text-muted-foreground',
  READY: 'bg-muted text-muted-foreground',
  STARTED: 'bg-muted text-muted-foreground',
  ACCREDITATION_PENDING: 'bg-muted text-muted-foreground',
}

const ACTIVE_STATUSES = new Set(['MEETING_REQUESTED', 'AWAITING_WIRE', 'COMPLETED', 'CANCELLED'])

export default function InvestmentRequestsPanel({ className }) {
  const t = useTranslations('MyAccount')
  const locale = useLocale()
  const { confirm } = useMessaging()
  const [intents, setIntents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancellingId, setCancellingId] = useState(null)

  const refresh = useCallback(async () => {
    setError('')
    try {
      const res = await fetch('/api/investor/investment-intents', { credentials: 'include' })
      if (!res.ok) throw new Error('failed')
      const data = await res.json()
      const list = Array.isArray(data) ? data : []
      setIntents(list.filter((row) => ACTIVE_STATUSES.has(row.status)))
    } catch {
      setError(t('investmentRequestsLoadError'))
      setIntents([])
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    refresh().catch(() => {})
  }, [refresh])

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
      await refresh()
    } catch (err) {
      setError(err.message || t('cancelMeetingRequestFailed'))
    } finally {
      setCancellingId(null)
    }
  }

  return (
    <Card className={cn('border-border/80 shadow-sm', className)}>
      <CardHeader>
        <CardTitle className="font-heading text-xl text-primary">
          {t('investmentRequestsTitle')}
        </CardTitle>
        <CardDescription>{t('investmentRequestsDesc')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">{t('loading')}</p>
        ) : null}

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        {!loading && !error && intents.length === 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{t('investmentRequestsEmpty')}</p>
            <Link
              href="/projects"
              className={cn(buttonVariants({ variant: 'outline', size: 'default' }), 'inline-flex')}
            >
              {t('browseProjectsCta')}
            </Link>
          </div>
        ) : null}

        {!loading && intents.length > 0 ? (
          <ul className="divide-y divide-border/70 rounded-lg border border-border/70 bg-background">
            {intents.map((row) => {
              const property = row.property
              const investHref = property?.investmentId
                ? `/properties/${property.investmentId}/invest`
                : '/projects'
              const deposit = Array.isArray(row.depositRequests) ? row.depositRequests[0] : null
              const dateValue = row.meetingRequestedAt || row.updatedAt
              const dateLabel = dateValue
                ? new Date(dateValue).toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US')
                : '—'
              const canCancel = canInvestorCancelMeetingRequest(row.status)

              return (
                <li
                  key={row.id}
                  className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-foreground">
                        {property?.name || t('investmentRequestsUnknownProperty')}
                      </p>
                      <span
                        className={cn(
                          'rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                          STATUS_BADGE[row.status] || STATUS_BADGE.READY
                        )}
                      >
                        {t(`intentStatus.${row.status}`)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {property?.investmentId ? `#${property.investmentId}` : null}
                      {row.intendedAmount != null
                        ? ` · ${formatUsd(row.intendedAmount)}`
                        : null}
                      {row.channel
                        ? ` · ${
                            (() => {
                              const key = meetingChannelLabelKey(row.channel)
                              return key && t.has(key) ? t(key) : row.channel
                            })()
                          }`
                        : null}
                      {` · ${dateLabel}`}
                    </p>
                    {row.status === 'MEETING_REQUESTED' ? (
                      <p className="text-xs text-muted-foreground">
                        {t('investmentRequestsMeetingHint')}
                      </p>
                    ) : null}
                    {row.status === 'AWAITING_WIRE' && !deposit ? (
                      <p className="text-xs text-muted-foreground">
                        {t('investmentRequestsDepositHint')}
                      </p>
                    ) : null}
                    {deposit?.status === 'PENDING' ? (
                      <p className="text-xs text-muted-foreground">
                        {t('investmentRequestsDepositPending')}
                      </p>
                    ) : null}
                    {deposit?.status === 'CONFIRMED' || row.status === 'COMPLETED' ? (
                      <p className="text-xs text-muted-foreground">
                        {t('investmentRequestsCompletedHint')}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    {canCancel ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={cancellingId === row.id}
                        onClick={() => cancelMeetingRequest(row)}
                      >
                        {cancellingId === row.id
                          ? t('cancelMeetingRequestWorking')
                          : t('cancelMeetingRequestCta')}
                      </Button>
                    ) : null}
                    {row.status !== 'CANCELLED' ? (
                      <Link
                        href={investHref}
                        className={cn(
                          buttonVariants({
                            variant: row.status === 'AWAITING_WIRE' ? 'default' : 'outline',
                            size: 'sm',
                          })
                        )}
                      >
                        {row.status === 'AWAITING_WIRE'
                          ? t('continueDepositCta')
                          : row.status === 'COMPLETED'
                            ? t('viewInvestStatusCta')
                            : row.status === 'MEETING_REQUESTED'
                              ? t('rescheduleRequestCta')
                              : t('continueInvestCta')}
                      </Link>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  )
}
