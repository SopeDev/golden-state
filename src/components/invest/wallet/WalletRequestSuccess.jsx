'use client'

import { useTranslations } from 'next-intl'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { formatUsd } from '@/lib/formatMoney'

export default function WalletRequestSuccess({ submitted, onDone }) {
  const t = useTranslations('ActivityPage')
  const isReinvest = submitted?.mode === 'reinvest'

  return (
    <div className="py-4 text-center">
      <CheckCircle2 className="mx-auto size-14 text-emerald-600" />
      <DialogTitle className="mt-5 text-2xl">{t('requestReceived')}</DialogTitle>
      <DialogDescription className="mx-auto mt-2 max-w-md">
        {isReinvest ? t('reinvestSuccessDesc') : t('cashOutSuccessDesc')}
      </DialogDescription>

      <div className="mx-auto mt-6 max-w-sm rounded-xl border border-border/80 bg-muted/20 p-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          {t('requestAmount')}
        </p>
        <p className="mt-1 font-heading text-3xl font-semibold text-primary">
          {formatUsd(submitted?.amount)}
        </p>
        {submitted?.property ? <p className="mt-2 text-sm">{submitted.property.name}</p> : null}
      </div>

      <Button type="button" className="mt-6" onClick={onDone}>
        {t('viewActivity')}
      </Button>
    </div>
  )
}
