/** Admin deep-link helpers for property / investor editor pages. */

export function adminPropertyPath(propertyId) {
  if (!propertyId) return '/admin/properties'
  return `/admin/properties?id=${encodeURIComponent(propertyId)}`
}

export function adminUserPath(userId) {
  if (userId == null || userId === '') return '/admin/users'
  return `/admin/users?id=${encodeURIComponent(String(userId))}`
}

export function formatAdminPropertyLabel(property) {
  if (!property) return '—'
  const id = property.investmentId
  const name = property.name || ''
  if (id != null && name) return `#${id} · ${name}`
  if (id != null) return `#${id}`
  return name || '—'
}
