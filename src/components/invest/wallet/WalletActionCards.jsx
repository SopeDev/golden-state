'use client'

import { useTranslations } from 'next-intl'
import { ArrowRight, Banknote, Repeat2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatUsd } from '@/lib/formatMoney'
import { PLATFORM_MIN_INVESTMENT } from '@/lib/propertyFunding'

function ActionCard({ icon: Icon, title, description, meta, disabled, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'group/action flex h-full flex-col rounded-xl border p-5 text-left transition-colors',
        disabled
          ? 'cursor-not-allowed border-border/70 bg-muted/30'
          : 'cursor-pointer border-border/80 bg-background hover:border-main-gold/60 hover:bg-main-gold/5 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none'
      )}
    >
      <span
        className={cn(
          'flex size-10 items-center justify-center rounded-full',
          disabled ? 'bg-muted text-muted-foreground' : 'bg-main-gold/15 text-main-gold'
        )}
      >
        <Icon className="size-5" aria-hidden />
      </span>

      <span className="mt-3 flex items-center gap-1.5 font-heading text-base font-semibold text-primary">
        {title}
        {disabled ? null : (
          <ArrowRight
            className="size-4 text-main-gold transition-transform group-hover/action:translate-x-0.5"
            aria-hidden
          />
        )}
      </span>

      <span className="mt-1 text-sm text-muted-foreground">{description}</span>
      <span className="mt-3 text-xs font-medium text-foreground">{meta}</span>
    </button>
  )
}

export default function WalletActionCards({ form }) {
  const t = useTranslations('ActivityPage')
  const noFunds = form.availableCap <= 0
  const eligibleTargets = form.reinvestTargets.filter((property) => {
    const minTicket = Number(property.effectiveMinInvestment) || 0
    const remaining = Number(property.remainingCapacity) || 0
    return form.availableCap + 1e-6 >= minTicket && remaining + 1e-6 >= minTicket
  })
  const targetCount = eligibleTargets.length
  const upTo = t('cardUpTo', { amount: formatUsd(form.availableCap, { fallback: '$0' }) })
  const belowMin = !noFunds && form.reinvestTargets.length > 0 && targetCount === 0

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <ActionCard
        icon={Banknote}
        title={t('requestCashOut')}
        description={t('cashOutCardDesc')}
        meta={noFunds ? t('walletEmptyHint') : upTo}
        disabled={noFunds}
        onClick={() => form.openMode('cashout')}
      />
      <ActionCard
        icon={Repeat2}
        title={t('requestReinvest')}
        description={t('reinvestCardDesc')}
        meta={
          noFunds
            ? t('walletEmptyHint')
            : targetCount === 0
              ? belowMin
                ? t('reinvestBelowMinHint', {
                    amount: formatUsd(PLATFORM_MIN_INVESTMENT, { fallback: '$0' }),
                  })
                : t('reinvestNoTargetsHint')
              : `${upTo} · ${t('reinvestOpenProperties', { count: targetCount })}`
        }
        disabled={noFunds || targetCount === 0}
        onClick={() => form.openMode('reinvest')}
      />
    </div>
  )
}
