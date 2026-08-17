'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatMoneyAmount } from '@/lib/formatMoney'
import AdminFormattedNumberInput from '@/components/admin/AdminFormattedNumberInput'

export default function DepositConfirmForm({ propertyId, minAmount, onSubmitted }) {
  const t = useTranslations('Invest')
  const [amount, setAmount] = useState('')
  const [reference, setReference] = useState('')
  const [depositedAt, setDepositedAt] = useState('')
  const [receipt, setReceipt] = useState(null)
  const [acknowledged, setAcknowledged] = useState(false)
  const [status, setStatus] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    if (!receipt) {
      setStatus(t('receiptRequired'))
      return
    }
    if (!acknowledged) {
      setStatus(t('depositAckRequired'))
      return
    }
    const parsedAmount = Number(amount)
    if (minAmount && parsedAmount < Number(minAmount)) {
      setStatus(t('intendedAmountMinError', { amount: formatMoneyAmount(minAmount) }))
      return
    }
    setIsLoading(true)
    setStatus('')
    try {
      const formData = new FormData()
      formData.append('propertyId', propertyId)
      formData.append('amount', String(amount))
      if (reference) formData.append('reference', reference)
      if (depositedAt) formData.append('depositedAt', depositedAt)
      formData.append('receipt', receipt)

      const res = await fetch('/api/investor/deposit-requests', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t('depositSubmitFailed'))
      setStatus(t('depositSubmitted'))
      onSubmitted?.(data)
    } catch (error) {
      setStatus(error.message || t('depositSubmitFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="deposit-amount">{t('depositAmount')}</Label>
          <AdminFormattedNumberInput
            id="deposit-amount"
            name="amount"
            required
            min={minAmount}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          {minAmount ? (
            <p className="text-xs text-muted-foreground">
              {t('depositMinHint', { amount: formatMoneyAmount(minAmount) })}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="deposit-date">{t('depositDate')}</Label>
          <Input
            id="deposit-date"
            type="date"
            value={depositedAt}
            onChange={(e) => setDepositedAt(e.target.value)}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="deposit-ref">{t('wireReference')}</Label>
          <Input
            id="deposit-ref"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder={t('wireReferencePlaceholder')}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="deposit-receipt">{t('receiptLabel')}</Label>
          <Input
            id="deposit-receipt"
            type="file"
            accept=".pdf,image/jpeg,image/png,image/webp"
            required
            onChange={(e) => setReceipt(e.target.files?.[0] || null)}
          />
          <p className="text-xs text-muted-foreground">{t('receiptHint')}</p>
        </div>
      </div>
      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border/80 bg-muted/30 px-3 py-2.5 text-sm">
        <input
          type="checkbox"
          required
          checked={acknowledged}
          onChange={(e) => setAcknowledged(e.target.checked)}
          className="mt-0.5"
        />
        <span className="leading-relaxed text-muted-foreground">{t('depositAck')}</span>
      </label>
      {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? t('submittingDeposit') : t('submitDeposit')}
      </Button>
    </form>
  )
}
