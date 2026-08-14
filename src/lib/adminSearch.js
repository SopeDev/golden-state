/** Case-insensitive substring match across admin table fields. */
export function matchesAdminQuery(query, ...values) {
  const q = String(query || '').trim().toLowerCase()
  if (!q) return true
  return values.some((value) => String(value ?? '').toLowerCase().includes(q))
}
