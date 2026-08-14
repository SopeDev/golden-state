'use client'

import { useLocale, useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { formatUsd } from '@/lib/formatMoney'
import {
  formatPropertyDate,
  getPropertyDisplayFlags,
  getPropertyStatusBadgeClass,
  getPropertyStatusLabelKey,
} from '@/lib/propertyStatusUi'

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

function TimelineMeta({
  flags,
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

  const showStart = showDates && flags.showStartDate && startLabel
  const showTarget = showDates && flags.showTargetCompletion && targetLabel
  const showCompleted = showDates && flags.showCompletedDate && completedLabel
  const hasConcreteDates = Boolean(showStart || showTarget || showCompleted)
  const showEstimated =
    showDuration &&
    flags.showEstimatedDuration &&
    durationValue &&
    !hasConcreteDates

  if (!showStart && !showTarget && !showCompleted && !showEstimated) return null

  return (
    <dl className={cn('space-y-0.5 text-xs text-muted-foreground', className)}>
      {showEstimated ? (
        <div>
          <dt className="inline">{t('estimatedDuration')}: </dt>
          <dd className="inline text-foreground/80">{durationValue}</dd>
        </div>
      ) : null}
      {showStart ? (
        <div>
          <dt className="inline">{t('startDate')}: </dt>
          <dd className="inline text-foreground/80">{startLabel}</dd>
        </div>
      ) : null}
      {showTarget ? (
        <div>
          <dt className="inline">{t('targetCompletion')}: </dt>
          <dd className="inline text-foreground/80">{targetLabel}</dd>
        </div>
      ) : null}
      {showCompleted ? (
        <div>
          <dt className="inline">{t('completedAt')}: </dt>
          <dd className="inline text-foreground/80">{completedLabel}</dd>
        </div>
      ) : null}
    </dl>
  )
}

/**
 * @param {'tile' | 'inline'} [variant='inline']
 */
export default function PropertyProgressSummary({
  property,
  className,
  showDates = true,
  showDuration = true,
  compact = false,
  variant = 'inline',
}) {
  const t = useTranslations('Projects')
  const locale = useLocale()
  const flags = getPropertyDisplayFlags(property)

  const constructionPercent = Number.isFinite(property?.progressPercent)
    ? property.progressPercent
    : flags.isCompleted
      ? 100
      : 0

  const fundedAmount = Number(property?.fundedAmount) || 0
  const goal = Number(property?.investmentGoal ?? property?.price) || 0
  const fundingPercent = Number.isFinite(property?.fundingPercent)
    ? property.fundingPercent
    : flags.fundingStatus === 'FUNDED'
      ? 100
      : 0

  const fundingLabel = t(`status.${getPropertyStatusLabelKey(flags.fundingStatus)}`)
  const executionLabel = flags.hasExecution
    ? t(`status.${getPropertyStatusLabelKey(flags.executionStatus)}`)
    : null
  const startLabel = formatPropertyDate(property?.startDate, locale)
  const targetLabel = formatPropertyDate(property?.targetCompletionDate, locale)
  const completedLabel = formatPropertyDate(property?.completedAt, locale)
  const estimatedMonths = property?.estimatedMonths
    ? String(property.estimatedMonths).trim()
    : ''

  const showConstructionBar = flags.showConstructionProgress || flags.isCompleted
  const showFundingBar = flags.showFundingProgress && !showConstructionBar

  const fundingCaption =
    showFundingBar && goal > 0
      ? t('fundingRaisedOfGoal', {
          raised: formatUsd(fundedAmount),
          goal: formatUsd(goal),
        })
      : null

  const timeline = (
    <TimelineMeta
      flags={flags}
      startLabel={startLabel}
      targetLabel={targetLabel}
      completedLabel={completedLabel}
      estimatedMonths={estimatedMonths}
      showDates={showDates}
      showDuration={showDuration}
      t={t}
    />
  )

  const badges = (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <StatusBadge status={flags.fundingStatus} label={fundingLabel} />
      {executionLabel ? (
        <StatusBadge status={flags.executionStatus} label={executionLabel} />
      ) : null}
    </div>
  )

  if (variant === 'tile') {
    return (
      <div className={cn('rounded-lg bg-muted/50 p-4 text-center', className)}>
        <p className="text-sm text-muted-foreground">{t('statusLabel')}</p>
        <div className="mt-2">{badges}</div>

        {showFundingBar ? (
          <div className="mx-auto mt-3 max-w-[12rem] space-y-2">
            <p className="text-lg font-semibold tabular-nums text-main-gold">
              {t('fundingPercent', { percent: fundingPercent })}
            </p>
            <ThinProgressBar percent={fundingPercent} />
            {fundingCaption ? (
              <p className="text-xs text-muted-foreground">{fundingCaption}</p>
            ) : null}
          </div>
        ) : null}

        {showConstructionBar ? (
          <div className="mx-auto mt-3 max-w-[12rem] space-y-2">
            <p className="text-sm text-muted-foreground">{t('progress')}</p>
            <p className="text-lg font-semibold tabular-nums text-main-gold">
              {t('progressPercent', { percent: constructionPercent })}
            </p>
            <ThinProgressBar percent={constructionPercent} />
          </div>
        ) : null}

        <div className="mt-3">{timeline}</div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={flags.fundingStatus} label={fundingLabel} />
        {executionLabel ? (
          <StatusBadge status={flags.executionStatus} label={executionLabel} />
        ) : null}
        {showConstructionBar ? (
          <span className="text-xs tabular-nums text-muted-foreground">
            {t('progressPercent', { percent: constructionPercent })}
          </span>
        ) : showFundingBar ? (
          <span className="text-xs tabular-nums text-muted-foreground">
            {t('fundingPercent', { percent: fundingPercent })}
          </span>
        ) : null}
      </div>

      {showFundingBar ? <ThinProgressBar percent={fundingPercent} /> : null}
      {showConstructionBar ? <ThinProgressBar percent={constructionPercent} /> : null}

      {fundingCaption && !compact ? (
        <p className="text-xs text-muted-foreground">{fundingCaption}</p>
      ) : null}

      {timeline}
    </div>
  )
}
