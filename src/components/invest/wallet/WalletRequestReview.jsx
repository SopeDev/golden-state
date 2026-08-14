'use client'

import { useTranslations } from 'next-intl'
import { formatUsd } from '@/lib/formatMoney'

export default function WalletRequestReview({ form, isReinvest }) {
  const t = useTranslations('ActivityPage')
  const remaining = Math.max(0, form.availableCap - form.parsedAmount)

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border/80 bg-muted/20 p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t('requestAmount')}
        </p>
        <p className="mt-1 font-heading text-4xl font-semibold text-primary">
          {formatUsd(form.parsedAmount)}
        </p>

        {isReinvest ? (
          <div className="mt-5 border-t border-border/70 pt-4">
            <p className="text-xs text-muted-foreground">{t('destinationProperty')}</p>
            <p className="mt-1 font-medium text-primary">
              #{form.selectedTarget?.investmentId} · {form.selectedTarget?.name}
            </p>
          </div>
        ) : null}

        <div className="mt-4 flex justify-between border-t border-border/70 pt-4 text-sm">
          <span className="text-muted-foreground">{t('balanceAfterRequest')}</span>
          <span className="font-semibold text-primary">{formatUsd(remaining)}</span>
        </div>
      </div>

      <p className="rounded-lg bg-amber-500/10 px-4 py-3 text-sm text-amber-950">
        {isReinvest ? t('reinvestReviewNotice') : t('cashOutReviewNotice')}
      </p>
    </div>
  )
}
