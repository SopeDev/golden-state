'use client'

import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatUsd } from '@/lib/formatMoney'
import { canInvestorCancelMeetingRequest, meetingChannelLabelKey } from '@/lib/investmentIntents'

const STATUS_BADGE = {
  MEETING_REQUESTED: 'bg-amber-100 text-amber-900',
  AWAITING_WIRE: 'bg-sky-100 text-sky-900',
  COMPLETED: 'bg-emerald-100 text-emerald-900',
  CANCELLED: 'bg-muted text-muted-foreground',
  READY: 'bg-muted text-muted-foreground',
  STARTED: 'bg-muted text-muted-foreground',
  ACCREDITATION_PENDING: 'bg-muted text-muted-foreground',
}

const ctaLabelKey = (status) => {
  if (status === 'AWAITING_WIRE') return 'continueDepositCta'
  if (status === 'COMPLETED') return 'viewInvestStatusCta'
  if (status === 'MEETING_REQUESTED') return 'rescheduleRequestCta'
  return 'continueInvestCta'
}

export default function InvestmentRequestRow({ row, cancelling, onCancel }) {
  const t = useTranslations('MyAccount')
  const locale = useLocale()

  const property = row.property
  const investHref = property?.investmentId
    ? `/properties/${property.investmentId}/invest`
    : '/projects'
  const deposit = Array.isArray(row.depositRequests) ? row.depositRequests[0] : null
  const dateValue = row.meetingRequestedAt || row.updatedAt
  const dateLabel = dateValue
    ? new Date(dateValue).toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US')
    : '—'
  const channelKey = row.channel ? meetingChannelLabelKey(row.channel) : null
  const channelLabel = channelKey && t.has(channelKey) ? t(channelKey) : row.channel
  const canCancel = canInvestorCancelMeetingRequest(row.status)

  return (
    <li className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
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
          {row.intendedAmount != null ? ` · ${formatUsd(row.intendedAmount)}` : null}
          {channelLabel ? ` · ${channelLabel}` : null}
          {` · ${dateLabel}`}
        </p>
        {row.status === 'MEETING_REQUESTED' ? (
          <p className="text-xs text-muted-foreground">{t('investmentRequestsMeetingHint')}</p>
        ) : null}
        {row.status === 'AWAITING_WIRE' && !deposit ? (
          <p className="text-xs text-muted-foreground">{t('investmentRequestsDepositHint')}</p>
        ) : null}
        {deposit?.status === 'PENDING' ? (
          <p className="text-xs text-muted-foreground">{t('investmentRequestsDepositPending')}</p>
        ) : null}
        {deposit?.status === 'CONFIRMED' || row.status === 'COMPLETED' ? (
          <p className="text-xs text-muted-foreground">{t('investmentRequestsCompletedHint')}</p>
        ) : null}
      </div>

      <div className="flex shrink-0 flex-wrap gap-2">
        {canCancel ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={cancelling}
            onClick={() => onCancel(row)}
          >
            {cancelling ? t('cancelMeetingRequestWorking') : t('cancelMeetingRequestCta')}
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
            {t(ctaLabelKey(row.status))}
          </Link>
        ) : null}
      </div>
    </li>
  )
}
