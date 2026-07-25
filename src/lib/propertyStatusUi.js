export const PROPERTY_STATUS_VALUES = [
  'FUNDING',
  'FUNDED',
  'PLANNING',
  'IN_PROGRESS',
  'COMPLETED',
]

const STATUS_BADGE_CLASS = {
  FUNDING: 'border border-main-gold/50 bg-main-gold/10 text-main-gold',
  FUNDED: 'bg-blue-600/15 text-blue-800 dark:text-blue-300',
  PLANNING: 'border border-border bg-transparent text-muted-foreground',
  IN_PROGRESS: 'bg-amber-500/15 text-amber-900 dark:text-amber-100',
  COMPLETED: 'bg-green-600/15 text-green-800 dark:text-green-400',
}

const STATUS_LABEL_KEY = {
  FUNDING: 'funding',
  FUNDED: 'funded',
  PLANNING: 'planning',
  IN_PROGRESS: 'inProgress',
  COMPLETED: 'completed',
}

export function isPropertyStatus(value) {
  return PROPERTY_STATUS_VALUES.includes(value)
}

export function getPropertyStatusBadgeClass(status) {
  return STATUS_BADGE_CLASS[status] || STATUS_BADGE_CLASS.FUNDING
}

/** Translation key under Projects.status.* or Admin.filter.* */
export function getPropertyStatusLabelKey(status) {
  return STATUS_LABEL_KEY[status] || 'funding'
}

export function clampProgressPercent(value) {
  const parsed = Number.parseInt(value, 10)
  if (Number.isNaN(parsed)) return 0
  return Math.min(100, Math.max(0, parsed))
}

/** HTML date input value (YYYY-MM-DD) from Date or ISO string. */
export function toDateInputValue(value) {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

export function parseOptionalDateInput(value) {
  if (value == null) return null
  const trimmed = String(value).trim()
  if (!trimmed) return null
  const date = new Date(trimmed)
  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid date')
  }
  return date
}

export function formatPropertyDate(value, locale = 'en') {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat(locale === 'es' ? 'es-MX' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

/**
 * Normalize progress fields from an admin API body.
 * Raise-phase statuses force construction progress to 0.
 * Auto-fills completedAt when status becomes COMPLETED and no date was provided.
 */
export function resolvePropertyProgressFields(body, existing = null) {
  const status = isPropertyStatus(body.status)
    ? body.status
    : existing?.status || 'FUNDING'

  const isRaise = status === 'FUNDING' || status === 'FUNDED'

  let progressPercent =
    body.progressPercent === undefined || body.progressPercent === null || body.progressPercent === ''
      ? existing?.progressPercent ?? (status === 'COMPLETED' ? 100 : 0)
      : clampProgressPercent(body.progressPercent)

  if (isRaise) {
    progressPercent = 0
  }

  const startDate =
    body.startDate === undefined
      ? existing?.startDate ?? null
      : parseOptionalDateInput(body.startDate)

  const targetCompletionDate =
    body.targetCompletionDate === undefined
      ? existing?.targetCompletionDate ?? null
      : parseOptionalDateInput(body.targetCompletionDate)

  let completedAt =
    body.completedAt === undefined
      ? existing?.completedAt ?? null
      : parseOptionalDateInput(body.completedAt)

  if (status === 'COMPLETED') {
    if (!completedAt) completedAt = existing?.completedAt || new Date()
  }

  return {
    status,
    progressPercent: status === 'COMPLETED' ? Math.max(progressPercent, 100) : progressPercent,
    startDate,
    targetCompletionDate,
    completedAt,
  }
}
