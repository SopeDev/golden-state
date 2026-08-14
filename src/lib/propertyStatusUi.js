export const FUNDING_STATUS_VALUES = ['FUNDING', 'FUNDED']

export const EXECUTION_STATUS_VALUES = ['NONE', 'PLANNING', 'IN_PROGRESS', 'COMPLETED']

/** Legacy combined values still stored on Property.status until rows are migrated. */
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
  NONE: 'border border-border bg-transparent text-muted-foreground',
  PLANNING: 'border border-border bg-transparent text-muted-foreground',
  IN_PROGRESS: 'bg-amber-500/15 text-amber-900 dark:text-amber-100',
  COMPLETED: 'bg-green-600/15 text-green-800 dark:text-green-400',
}

const STATUS_LABEL_KEY = {
  FUNDING: 'funding',
  FUNDED: 'funded',
  NONE: 'none',
  PLANNING: 'planning',
  IN_PROGRESS: 'inProgress',
  COMPLETED: 'completed',
}

export function isFundingStatus(value) {
  return FUNDING_STATUS_VALUES.includes(value)
}

export function isExecutionStatusValue(value) {
  return EXECUTION_STATUS_VALUES.includes(value)
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

/**
 * Split capital raise (FUNDING/FUNDED) from construction (NONE/PLANNING/IN_PROGRESS/COMPLETED).
 * Legacy rows that still store PLANNING/IN_PROGRESS/COMPLETED on `status` are normalized.
 */
export function normalizePropertyLifecycle(property = {}) {
  const rawStatus = property?.status
  const rawExecution = property?.executionStatus
  const legacyExecution =
    rawStatus === 'PLANNING' || rawStatus === 'IN_PROGRESS' || rawStatus === 'COMPLETED'

  let fundingStatus = isFundingStatus(rawStatus) ? rawStatus : 'FUNDING'
  let executionStatus = isExecutionStatusValue(rawExecution) ? rawExecution : 'NONE'

  if (legacyExecution) {
    fundingStatus = 'FUNDED'
    if (executionStatus === 'NONE') executionStatus = rawStatus
  }

  return { fundingStatus, executionStatus }
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
  if (value == null || value === false) return null
  const trimmed = String(value).trim()
  if (!trimmed) return null

  const lower = trimmed.toLowerCase()
  if (
    lower === 'null' ||
    lower === 'undefined' ||
    lower === 'invalid date' ||
    /^m{1,2}\/d{1,2}\/y{2,4}$/i.test(trimmed) ||
    /^y{2,4}-m{1,2}-d{1,2}$/i.test(trimmed)
  ) {
    return null
  }

  const date = new Date(trimmed)
  if (Number.isNaN(date.getTime())) return null
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

/** Whole months between start and completion (minimum 1 when dates are valid). */
export function getActualDurationMonths(startDate, completedAt) {
  if (!startDate || !completedAt) return null
  const start = startDate instanceof Date ? startDate : new Date(startDate)
  const end = completedAt instanceof Date ? completedAt : new Date(completedAt)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    return null
  }
  let months =
    (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
  if (end.getDate() < start.getDate()) months -= 1
  return Math.max(1, months)
}

function toLifecycleInput(propertyOrStatus) {
  if (typeof propertyOrStatus === 'string' || !propertyOrStatus) {
    return { status: propertyOrStatus || 'FUNDING' }
  }
  return propertyOrStatus
}

/**
 * What public/investor surfaces should emphasize.
 * Capital raise and construction can both be active at once.
 */
export function getPropertyDisplayFlags(propertyOrStatus) {
  const { fundingStatus, executionStatus } = normalizePropertyLifecycle(
    toLifecycleInput(propertyOrStatus)
  )
  const isFunding = fundingStatus === 'FUNDING'
  const isFunded = fundingStatus === 'FUNDED'
  const isCompleted = executionStatus === 'COMPLETED'
  const isPlanning = executionStatus === 'PLANNING'
  const isInProgress = executionStatus === 'IN_PROGRESS'
  const hasExecution = executionStatus !== 'NONE'
  const isExecution = isPlanning || isInProgress

  return {
    status: fundingStatus,
    fundingStatus,
    executionStatus,
    isRaise: isFunding || isFunded,
    isFunding,
    isFunded,
    isCompleted,
    isPlanning,
    isInProgress,
    isExecution,
    hasExecution,
    showFundingProgress: isFunding || isFunded,
    showConstructionProgress: isExecution,
    showInvestmentGoal: isFunding || (isFunded && !hasExecution),
    showEstimatedRoi: !isCompleted,
    showTimelineStat: isExecution || isPlanning,
    showActualRoi: isCompleted,
    showActualDuration: isCompleted,
    showEstimatedDuration: !hasExecution || isPlanning,
    showStartDate: hasExecution,
    showTargetCompletion: isExecution || isPlanning,
    showCompletedDate: isCompleted,
  }
}

/**
 * Normalize progress fields from an admin API body.
 * Capital status (FUNDING/FUNDED) is independent of execution status + %.
 * Start, target, and completed dates are all optional — blank stays null.
 */
export function resolvePropertyProgressFields(body, existing = null) {
  const existingLifecycle = normalizePropertyLifecycle(existing || {})

  let status = isFundingStatus(body.status)
    ? body.status
    : existingLifecycle.fundingStatus || 'FUNDING'

  let executionStatus = isExecutionStatusValue(body.executionStatus)
    ? body.executionStatus
    : existingLifecycle.executionStatus || 'NONE'

  // Legacy combined payload: status was PLANNING / IN_PROGRESS / COMPLETED.
  if (
    (body.status === 'PLANNING' || body.status === 'IN_PROGRESS' || body.status === 'COMPLETED') &&
    (body.executionStatus === undefined || body.executionStatus === 'NONE')
  ) {
    executionStatus = body.status
    status = 'FUNDED'
  }

  let progressPercent =
    body.progressPercent === undefined || body.progressPercent === null || body.progressPercent === ''
      ? existing?.progressPercent ?? (executionStatus === 'COMPLETED' ? 100 : 0)
      : clampProgressPercent(body.progressPercent)

  if (executionStatus === 'NONE') {
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

  const completedAt =
    body.completedAt === undefined
      ? existing?.completedAt ?? null
      : parseOptionalDateInput(body.completedAt)

  return {
    status,
    executionStatus,
    progressPercent:
      executionStatus === 'COMPLETED' ? Math.max(progressPercent, 100) : progressPercent,
    startDate,
    targetCompletionDate,
    completedAt,
  }
}
