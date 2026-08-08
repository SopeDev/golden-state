import {
  formatFormattedInteger,
  parseFormattedInteger,
} from '@/lib/admin/numberFormat'

/** Always use US grouping so amounts read as 100,000 (not 100.000). */
export const MONEY_LOCALE = 'en-US'

export { formatFormattedInteger, parseFormattedInteger }

/** Format a whole-dollar amount with commas. Empty/invalid → fallback. */
export function formatMoneyAmount(amount, { fallback = '—' } = {}) {
  if (amount === '' || amount === null || amount === undefined) return fallback
  const num = typeof amount === 'number' ? amount : Number(amount)
  if (!Number.isFinite(num)) return fallback
  return num.toLocaleString(MONEY_LOCALE)
}

/** Format as USD currency with commas and no cents by default. */
export function formatUsd(amount, { fallback = '—', fractionDigits = 0 } = {}) {
  if (amount === '' || amount === null || amount === undefined) return fallback
  const num = typeof amount === 'number' ? amount : Number(amount)
  if (!Number.isFinite(num)) return fallback
  return new Intl.NumberFormat(MONEY_LOCALE, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(num)
}
