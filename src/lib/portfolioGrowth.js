/**
 * Portfolio growth series from ledger events.
 * Invested = ACTIVE investor contributions. Returned = ACTIVE distributions.
 * Does not invent NAV / mark-to-market.
 */

/** Profit ROI: (credited returns − invested) ÷ invested × 100. */
export function getLedgerRoiPercent(invested, returned) {
  const capital = Number(invested) || 0
  if (capital <= 0) return null
  const credited = Number(returned) || 0
  return ((credited - capital) / capital) * 100
}

/** Cash ROI is only meaningful after at least one credited return. */
export function isLedgerRoiReady(returned) {
  return Number(returned) > 0
}

export function toMonthKey(value) {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString().slice(0, 7)
}

export function shiftMonthKey(monthKey, delta = 1) {
  const [yearStr, monthStr] = String(monthKey || '').split('-')
  let year = Number(yearStr)
  let month = Number(monthStr) + Number(delta)
  if (!Number.isFinite(year) || !Number.isFinite(month)) return null

  while (month < 1) {
    month += 12
    year -= 1
  }
  while (month > 12) {
    month -= 12
    year += 1
  }

  return `${year}-${String(month).padStart(2, '0')}`
}

export function listMonthKeysInclusive(startKey, endKey) {
  if (!startKey || !endKey || startKey > endKey) return []

  const keys = []
  let cursor = startKey
  while (cursor && cursor <= endKey) {
    keys.push(cursor)
    cursor = shiftMonthKey(cursor, 1)
    if (keys.length > 600) break
  }
  return keys
}

export function formatMonthLabel(monthKey, locale = 'en') {
  const [year, month] = String(monthKey || '').split('-').map(Number)
  if (!year || !month) return monthKey || ''
  const date = new Date(Date.UTC(year, month - 1, 1))
  return new Intl.DateTimeFormat(locale === 'es' ? 'es-MX' : 'en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

function roundMoney(value) {
  return Math.round((Number(value) || 0) * 100) / 100
}

function addMonthDelta(deltas, at, invested, returned) {
  const key = toMonthKey(at)
  if (!key) return
  const current = deltas.get(key) || { invested: 0, returned: 0 }
  current.invested += invested
  current.returned += returned
  deltas.set(key, current)
}

export function filterLedgerEvents(
  { contributions = [], distributions = [] } = {},
  propertyId
) {
  if (!propertyId || propertyId === 'all') {
    return { contributions, distributions }
  }

  return {
    contributions: contributions.filter((row) => row?.propertyId === propertyId),
    distributions: distributions.filter((row) => row?.propertyId === propertyId),
  }
}

/**
 * Keep cumulative totals, but only show the last N calendar months through today.
 * Includes a one-month baseline so the line does not appear from nowhere.
 */
export function sliceCumulativeSeries(series, monthCount, now = new Date()) {
  if (!Array.isArray(series) || !series.length) return []
  const count = Number(monthCount)
  if (!Number.isFinite(count) || count <= 0) return series

  const endKey = toMonthKey(now)
  if (!endKey) return series

  const windowStart = shiftMonthKey(endKey, -(count - 1))
  const baselineKey = shiftMonthKey(windowStart, -1) || windowStart
  let sliced = series.filter((row) => row.month >= baselineKey && row.month <= endKey)

  if (!sliced.length) {
    const last = series[series.length - 1]
    return listMonthKeysInclusive(baselineKey, endKey).map((month) => ({
      month,
      invested: last.invested,
      returned: last.returned,
    }))
  }

  const last = sliced[sliced.length - 1]
  if (last.month < endKey) {
    const extra = listMonthKeysInclusive(shiftMonthKey(last.month, 1), endKey)
    sliced = [
      ...sliced,
      ...extra.map((month) => ({
        month,
        invested: last.invested,
        returned: last.returned,
      })),
    ]
  }

  return sliced
}

/**
 * Cumulative monthly series: { month: 'YYYY-MM', invested, returned }.
 * Prepends a zero baseline month and extends through the current month.
 */
export function buildCumulativeGrowthSeries({
  contributions = [],
  distributions = [],
  now = new Date(),
} = {}) {
  const deltas = new Map()

  for (const row of contributions) {
    const amount = Number(row?.amount)
    if (!Number.isFinite(amount) || amount <= 0) continue
    addMonthDelta(deltas, row.createdAt || row.at, amount, 0)
  }

  for (const row of distributions) {
    if (row?.status && row.status !== 'ACTIVE') continue
    const amount = Number(row?.amount)
    if (!Number.isFinite(amount) || amount <= 0) continue
    addMonthDelta(deltas, row.distributedAt || row.createdAt || row.at, 0, amount)
  }

  if (!deltas.size) return []

  const monthKeys = [...deltas.keys()].sort()
  const startKey = shiftMonthKey(monthKeys[0], -1)
  const lastEventKey = monthKeys[monthKeys.length - 1]
  const currentKey = toMonthKey(now)
  const endKey = [lastEventKey, currentKey].filter(Boolean).sort().at(-1)
  const range = listMonthKeysInclusive(startKey || monthKeys[0], endKey)

  let invested = 0
  let returned = 0
  return range.map((month) => {
    const delta = deltas.get(month)
    if (delta) {
      invested += delta.invested
      returned += delta.returned
    }
    return {
      month,
      invested: roundMoney(invested),
      returned: roundMoney(returned),
    }
  })
}
