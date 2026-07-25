'use client'

import { useLocale, useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import {
  formatPropertyDate,
  getPropertyStatusBadgeClass,
  getPropertyStatusLabelKey,
} from '@/lib/propertyStatusUi'
import { isRaisePhaseStatus } from '@/lib/propertyFunding'

function ThinProgressBar({ percent, className }) {
  const clamped = Math.min(100, Math.max(0, percent))
  return (
    <div
      className={cn('h-1 w-full overflow-hidden rounded-full bg-border', className)}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-main-gold transition-[width]"
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}

function StatusBadge({ status, label }) {
  return (
    <span
      className={cn(
        'inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide',
        getPropertyStatusBadgeClass(status)
      )}
    >
      {label}
    </span>
  )
}

function MetaLines({
  startLabel,
  targetLabel,
  completedLabel,
  estimatedMonths,
  showDates,
  showDuration,
  t,
  className,
}) {
  const durationValue = estimatedMonths
    ? t('estimatedDurationValue', { months: estimatedMonths })
    : null

  const hasTargetOrCompleted = Boolean(
    (showDates && targetLabel && !completedLabel) || (showDates && completedLabel)
  )
  const hasDates = showDates && (startLabel || targetLabel || completedLabel)
  const hasDuration = showDuration && durationValue && !hasTargetOrCompleted

  if (!hasDates && !hasDuration) return null

  return (
    <dl className={cn('space-y-0.5 text-xs text-muted-foreground', className)}>
      {hasDuration ? (
        <div>
          <dt className="inline">{t('estimatedDuration')}: </dt>
          <dd className="inline text-foreground/80">{durationValue}</dd>
        </div>
      ) : null}
      {showDates && startLabel ? (
        <div>
          <dt className="inline">{t('startDate')}: </dt>
          <dd className="inline text-foreground/80">{startLabel}</dd>
        </div>
      ) : null}
      {showDates && targetLabel && !completedLabel ? (
        <div>
          <dt className="inline">{t('targetCompletion')}: </dt>
          <dd className="inline text-foreground/80">{targetLabel}</dd>
        </div>
      ) : null}
      {showDates && completedLabel ? (
        <div>
          <dt className="inline">{t('completedAt')}: </dt>
          <dd className="inline text-foreground/80">{completedLabel}</dd>
        </div>
      ) : null}
    </dl>
  )
}

function formatMoney(amount, locale) {
  return new Intl.NumberFormat(locale === 'es' ? 'es-MX' : 'en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0)
}

/**
 * @param {'tile' | 'inline'} [variant='inline']
 */
export default function PropertyProgressSummary({
  property,
  className,
  showDates = true,
  showDuration = false,
  compact = false,
  variant = 'inline',
}) {
  const t = useTranslations('Projects')
  const locale = useLocale()
  const status = property?.status || 'FUNDING'
  const isRaise = isRaisePhaseStatus(status)
  const isCompleted = status === 'COMPLETED'
  const isFunded = status === 'FUNDED'

  const constructionPercent = Number.isFinite(property?.progressPercent)
    ? property.progressPercent
    : isCompleted
      ? 100
      : 0

  const fundedAmount = Number(property?.fundedAmount) || 0
  const goal = Number(property?.investmentGoal ?? property?.price) || 0
  const fundingPercent = Number.isFinite(property?.fundingPercent)
    ? property.fundingPercent
    : isFunded
      ? 100
      : 0

  const statusLabel = t(`status.${getPropertyStatusLabelKey(status)}`)
  const startLabel = formatPropertyDate(property?.startDate, locale)
  const targetLabel = formatPropertyDate(property?.targetCompletionDate, locale)
  const completedLabel = formatPropertyDate(property?.completedAt, locale)
  const estimatedMonths = property?.estimatedMonths
    ? String(property.estimatedMonths).trim()
    : ''

  const meterPercent = isRaise ? fundingPercent : constructionPercent
  const showMeter = isRaise || !isCompleted
  const fundingCaption =
    goal > 0
      ? t('fundingRaisedOfGoal', {
          raised: formatMoney(fundedAmount, locale),
          goal: formatMoney(goal, locale),
        })
      : null

  if (variant === 'tile') {
    return (
      <div className={cn('rounded-lg bg-muted/50 p-4 text-center', className)}>
        <p className="text-sm text-muted-foreground">{t('statusLabel')}</p>
        <p className="mt-1 font-heading text-2xl font-semibold text-primary">{statusLabel}</p>

        {showMeter ? (
          <div className="mx-auto mt-3 max-w-[12rem] space-y-2">
            <p className="text-lg font-semibold tabular-nums text-main-gold">
              {isRaise ? t('fundingPercent', { percent: meterPercent }) : `${meterPercent}%`}
            </p>
            <ThinProgressBar percent={meterPercent} />
            {isRaise && fundingCaption ? (
              <p className="text-xs text-muted-foreground">{fundingCaption}</p>
            ) : null}
          </div>
        ) : null}

        {!isRaise ? (
          <MetaLines
            startLabel={startLabel}
            targetLabel={targetLabel}
            completedLabel={completedLabel}
            estimatedMonths={estimatedMonths}
            showDates={showDates}
            showDuration={showDuration}
            t={t}
            className="mt-3"
          />
        ) : null}
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={status} label={statusLabel} />
        {showMeter ? (
          <span className="text-xs tabular-nums text-muted-foreground">
            {isRaise ? t('fundingPercent', { percent: meterPercent }) : `${meterPercent}%`}
          </span>
        ) : null}
      </div>

      {showMeter ? <ThinProgressBar percent={meterPercent} /> : null}

      {isRaise && fundingCaption && !compact ? (
        <p className="text-xs text-muted-foreground">{fundingCaption}</p>
      ) : null}

      {!isRaise ? (
        <MetaLines
          startLabel={startLabel}
          targetLabel={targetLabel}
          completedLabel={completedLabel}
          estimatedMonths={estimatedMonths}
          showDates={showDates}
          showDuration={showDuration}
          t={t}
        />
      ) : null}
    </div>
  )
}
