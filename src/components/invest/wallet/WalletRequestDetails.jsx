'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { formatUsd } from '@/lib/formatMoney'
import AdminFormattedNumberInput from '@/components/admin/AdminFormattedNumberInput'

const PropertyChoices = ({ form }) => {
  const t = useTranslations('ActivityPage')

  return (
    <div className="space-y-2">
      <Label>{t('destinationProperty')}</Label>
      <div className="grid gap-2 sm:grid-cols-2">
        {form.reinvestTargets.map((property) => (
          <button
            key={property.id}
            type="button"
            aria-pressed={form.propertyId === property.id}
            onClick={() => form.selectProperty(property.id)}
            className={cn(
              'rounded-xl border p-4 text-left transition-colors',
              form.propertyId === property.id
                ? 'border-main-gold bg-main-gold/10 ring-1 ring-main-gold'
                : 'border-border/80 hover:border-main-gold/60 hover:bg-muted/40'
            )}
          >
            <span className="block font-medium text-primary">
              #{property.investmentId} · {property.name}
            </span>
            <span className="mt-1 block text-xs text-muted-foreground">
              {[property.city, property.state].filter(Boolean).join(', ')}
            </span>
            <span className="mt-3 block text-xs font-medium text-foreground">
              {t('capacityAvailable', {
                amount: formatUsd(property.remainingCapacity, { fallback: '$0' }),
              })}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function WalletRequestDetails({ form, inputId, isReinvest, onSubmit }) {
  const t = useTranslations('ActivityPage')

  return (
    <form id="wallet-request-details" onSubmit={onSubmit} className="space-y-5">
      <div className="rounded-xl border border-main-gold/30 bg-main-gold/10 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t('availableBalance')}
        </p>
        <p className="mt-1 font-heading text-3xl font-semibold text-primary">
          {formatUsd(form.availableCap, { fallback: '$0' })}
        </p>
      </div>

      {isReinvest ? <PropertyChoices form={form} /> : null}

      <div className="space-y-2">
        <Label htmlFor={inputId}>{t('amount')}</Label>
        <div className="flex gap-2">
          <AdminFormattedNumberInput
            id={inputId}
            name={inputId}
            required
            max={form.maxAmount}
            value={form.amount}
            onChange={form.handleAmountChange}
            className="flex-1 text-lg"
          />
          <Button type="button" variant="outline" onClick={form.useAll}>
            {t('useAll')}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {t('maxAvailable', { amount: formatUsd(form.maxAmount, { fallback: '$0' }) })}
        </p>
        {form.amountError ? <p className="text-xs text-destructive">{form.amountError}</p> : null}
      </div>
    </form>
  )
}
