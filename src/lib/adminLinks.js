/** Admin deep-link helpers for property / investor editor pages. */

export function adminPropertyPath(propertyId) {
  if (!propertyId) return '/admin/properties'
  return `/admin/properties?id=${encodeURIComponent(propertyId)}`
}

export function adminUserPath(userId) {
  if (userId == null || userId === '') return '/admin/users'
  return `/admin/users?id=${encodeURIComponent(String(userId))}`
}

export function adminIntentPath(intentId) {
  if (!intentId) return '/admin/investments'
  return `/admin/investments?id=${encodeURIComponent(String(intentId))}`
}

export function adminDepositPath(depositId) {
  if (!depositId) return '/admin/deposits'
  return `/admin/deposits?id=${encodeURIComponent(String(depositId))}`
}

export function adminCashOutPath(cashOutId) {
  if (!cashOutId) return '/admin/cash-outs'
  return `/admin/cash-outs?id=${encodeURIComponent(String(cashOutId))}`
}

export function adminReinvestPath(reinvestId) {
  if (!reinvestId) return '/admin/reinvests'
  return `/admin/reinvests?id=${encodeURIComponent(String(reinvestId))}`
}

export function formatAdminPropertyLabel(property) {
  if (!property) return '—'
  const id = property.investmentId
  const name = property.name || ''
  if (id != null && name) return `#${id} · ${name}`
  if (id != null) return `#${id}`
  return name || '—'
}
