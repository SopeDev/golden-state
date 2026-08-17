import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { formatUsd } from '@/lib/formatMoney'
import { floorDollars } from '@/lib/investorActivity'
import { PLATFORM_MIN_INVESTMENT } from '@/lib/propertyFunding'

const ENDPOINTS = {
  cashout: '/api/investor/cash-out-requests',
  reinvest: '/api/investor/reinvest-requests',
}

/**
 * Cash-out / reinvest request form state: amount capping against the wallet
 * balance and the destination property's remaining capacity.
 */
export const useWalletRequestForm = ({ wallet, onSubmitted }) => {
  const t = useTranslations('ActivityPage')
  const [mode, setMode] = useState(null)
  const [amount, setAmount] = useState('')
  const [propertyId, setPropertyId] = useState('')
  const [amountError, setAmountError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState('')

  const reinvestTargets = useMemo(() => wallet?.reinvestTargets || [], [wallet])
  const availableCap = floorDollars(wallet?.available)

  const selectedTarget = useMemo(
    () => reinvestTargets.find((property) => property.id === propertyId) || null,
    [reinvestTargets, propertyId]
  )
  const remainingCap = selectedTarget ? floorDollars(selectedTarget.remainingCapacity) : null
  const minAmount =
    mode === 'reinvest'
      ? floorDollars(selectedTarget?.effectiveMinInvestment ?? PLATFORM_MIN_INVESTMENT)
      : 0
  const maxAmount =
    mode === 'reinvest' && remainingCap != null
      ? Math.min(availableCap, remainingCap)
      : availableCap

  const parsedAmount = Number(String(amount).replace(/,/g, ''))
  const amountOverMax =
    Number.isFinite(parsedAmount) && parsedAmount > 0 && parsedAmount > maxAmount

  const showStatus = (message) => setStatus(message)

  const openMode = (nextMode) => {
    setMode(nextMode)
    setAmount('')
    setPropertyId('')
    setAmountError('')
    showStatus('')
  }

  const close = () => {
    setMode(null)
    setAmount('')
    setPropertyId('')
    setAmountError('')
    showStatus('')
  }

  const useAll = () => {
    setAmount(maxAmount > 0 ? String(maxAmount) : '')
    setAmountError('')
    showStatus('')
  }

  const handleAmountChange = (event) => {
    const next = event.target.value
    if (next === '' || next == null) {
      setAmount('')
      setAmountError('')
      showStatus('')
      return
    }
    setAmount(String(next))
    showStatus('')
    setAmountError(
      event.capped ? t('amountCapped', { amount: formatUsd(maxAmount, { fallback: '$0' }) }) : ''
    )
  }

  const selectProperty = (nextId) => {
    setPropertyId(nextId)
    showStatus('')
    const target = reinvestTargets.find((property) => property.id === nextId)
    const nextMax = target
      ? Math.min(availableCap, floorDollars(target.remainingCapacity))
      : availableCap
    const current = Number(String(amount).replace(/,/g, ''))
    if (Number.isFinite(current) && current > nextMax) {
      setAmount(nextMax > 0 ? String(nextMax) : '')
      setAmountError(t('amountCapped', { amount: formatUsd(nextMax, { fallback: '$0' }) }))
      return
    }
    setAmountError('')
  }

  const validateAmount = () => {
    if (!(parsedAmount > 0)) return false
    if (mode === 'reinvest' && parsedAmount < minAmount) {
      showStatus(
        t('amountBelowMin', { amount: formatUsd(minAmount, { fallback: '$0' }) })
      )
      return false
    }
    if (parsedAmount > availableCap) {
      showStatus(
        t('amountExceedsAvailable', { amount: formatUsd(availableCap, { fallback: '$0' }) })
      )
      return false
    }
    if (mode === 'reinvest' && remainingCap != null && parsedAmount > remainingCap) {
      showStatus(
        t('amountExceedsCapacity', { amount: formatUsd(remainingCap, { fallback: '$0' }) })
      )
      return false
    }
    return true
  }

  const mapApiError = (data) => {
    if (data?.code === 'INSUFFICIENT_FUNDS') {
      return t('amountExceedsAvailable', {
        amount: formatUsd(floorDollars(data.available ?? wallet?.available), { fallback: '$0' }),
      })
    }
    if (data?.code === 'BELOW_MIN') {
      return t('amountBelowMin', {
        amount: formatUsd(floorDollars(data.min ?? minAmount), { fallback: '$0' }),
      })
    }
    if (data?.code === 'OVERFUND') {
      return t('amountExceedsCapacity', {
        amount: formatUsd(floorDollars(data.remaining ?? remainingCap ?? 0), { fallback: '$0' }),
      })
    }
    return data?.error || t('requestError')
  }

  const submit = async () => {
    setSubmitting(true)
    showStatus('')
    if (!validateAmount()) {
      setSubmitting(false)
      return false
    }
    try {
      const res = await fetch(ENDPOINTS[mode], {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          mode === 'reinvest'
            ? { amount: parsedAmount, destinationPropertyId: propertyId }
            : { amount: parsedAmount }
        ),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(mapApiError(data))
      close()
      await onSubmitted?.()
      return true
    } catch (err) {
      showStatus(err.message || t('requestError'))
      return false
    } finally {
      setSubmitting(false)
    }
  }

  const canSubmit =
    !submitting &&
    parsedAmount > 0 &&
    !amountOverMax &&
    (minAmount <= 0 || parsedAmount + 1e-6 >= minAmount) &&
    (mode !== 'reinvest' || Boolean(propertyId))

  return {
    mode,
    openMode,
    close,
    amount,
    parsedAmount,
    propertyId,
    selectedTarget,
    amountError,
    submitting,
    status,
    maxAmount,
    minAmount,
    availableCap,
    reinvestTargets,
    canSubmit,
    handleAmountChange,
    selectProperty,
    useAll,
    submit,
  }
}
