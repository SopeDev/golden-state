/** Strip non-digits and parse as integer (empty → empty string). */
export function parseFormattedInteger(value) {
  const digits = String(value ?? '').replace(/\D/g, '')
  if (!digits) return ''
  return parseInt(digits, 10)
}

/** Format integer with US grouping; empty stays empty. */
export function formatFormattedInteger(value) {
  if (value === '' || value === null || value === undefined) return ''
  const num = typeof value === 'number' ? value : parseFormattedInteger(value)
  if (num === '' || Number.isNaN(num)) return ''
  return num.toLocaleString('en-US')
}

/** True when the string is digits/commas only (for optional value formatting). */
export function looksLikeIntegerString(value) {
  const trimmed = String(value ?? '').trim()
  if (!trimmed) return false
  return /^[\d,]+$/.test(trimmed)
}
