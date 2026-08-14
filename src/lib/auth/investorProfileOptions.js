import { PROPERTY_TYPE_ADMIN_LABEL } from '@/lib/propertyTypeUi'

/**
 * @deprecated Property types now live in the DB (PropertyType model). Fetch active
 * types via listActivePropertyTypes() or GET /api/property-types instead. Kept as a
 * fallback for the seeded catalog only.
 */
export const QUESTIONNAIRE_PROPERTY_TYPES = [
  'BUILD_TO_SELL',
  'BUILD_TO_RENT',
  'FLIPHOUSE',
  'MEX_TO_US',
  'US_TO_MEX',
]

export const INVESTMENT_RANGE_OPTIONS = [
  '10k_25k',
  '25k_50k',
  '50k_100k',
  '100k_250k',
  '250k_500k',
  '500k_plus',
]

export const INVESTMENT_RANGE_LABELS = {
  '10k_25k': '$10,000 – $25,000',
  '25k_50k': '$25,000 – $50,000',
  '50k_100k': '$50,000 – $100,000',
  '100k_250k': '$100,000 – $250,000',
  '250k_500k': '$250,000 – $500,000',
  '500k_plus': '$500,000+',
}

export const EXPERIENCE_OPTIONS = ['none', 'some', 'experienced', 'professional']

/** Legacy seed / free-text aliases → current option ids. */
const EXPERIENCE_ALIASES = {
  intermediate: 'some',
  beginner: 'none',
  advanced: 'experienced',
}

export function normalizeExperience(raw) {
  const value = typeof raw === 'string' ? raw.trim().toLowerCase() : ''
  if (!value) return ''
  if (EXPERIENCE_OPTIONS.includes(value)) return value
  return EXPERIENCE_ALIASES[value] || ''
}

/**
 * @param raw saved experience value
 * @param tRegister next-intl translator for the Register namespace
 */
export function formatExperienceForDisplay(raw, tRegister) {
  const normalized = normalizeExperience(raw)
  if (normalized) {
    const key = `experience_${normalized}`
    if (typeof tRegister?.has === 'function' && tRegister.has(key)) return tRegister(key)
    try {
      return tRegister(key)
    } catch {
      return normalized
    }
  }
  if (raw == null || raw === '') return null
  return String(raw).replace(/_/g, ' ')
}

/** Investor location options for the profile questionnaire. */
export const LOCATION_OPTIONS = ['US', 'MX']

const VALID_LOCATIONS = new Set(LOCATION_OPTIONS)

export function parseInvestorLocation(raw) {
  const value = typeof raw === 'string' ? raw.trim().toUpperCase() : ''
  return VALID_LOCATIONS.has(value) ? value : ''
}

/** Map UI locale (same preference signal as language) → default location. */
export function defaultLocationFromLocale(locale) {
  return locale === 'es' ? 'MX' : 'US'
}

/**
 * Prefer edge geo headers (IP country on Vercel/Cloudflare), then fall back to locale.
 * Language itself uses Accept-Language via next-intl; location mirrors that preference when geo is unavailable.
 */
export function resolveDefaultInvestorLocation({ locale, countryCode } = {}) {
  const country = typeof countryCode === 'string' ? countryCode.trim().toUpperCase() : ''
  if (country === 'MX' || country === 'US') return country
  if (country === 'UM') return 'US'
  return defaultLocationFromLocale(locale)
}

/** Read country from common reverse-proxy / edge headers. */
export function getRequestCountryCode(headers) {
  if (!headers || typeof headers.get !== 'function') return ''
  return (
    headers.get('x-vercel-ip-country') ||
    headers.get('cf-ipcountry') ||
    headers.get('x-country-code') ||
    ''
  )
}

/**
 * Property type codes now come from the DB PropertyType catalog (which can grow,
 * shrink, or archive types over time). Accept any non-empty string code here rather
 * than validating against a static list — this keeps previously saved profiles valid
 * even if their type was later archived. Server-side callers that need to gate
 * against currently-active codes should cross-check against listActivePropertyTypes().
 */
export function parseProjectTypes(raw) {
  const list = Array.isArray(raw) ? raw : typeof raw === 'string' && raw ? [raw] : []
  return [
    ...new Set(list.filter((value) => typeof value === 'string' && value.trim().length > 0)),
  ]
}

/**
 * @param types raw saved project type codes
 * @param labelByCode optional code -> label map resolved from the DB PropertyType catalog
 * (including archived types, so previously saved profiles still display a real label).
 * Falls back to the legacy static label map, then the raw code.
 */
export function formatProjectTypesForDisplay(types, labelByCode = {}) {
  const parsed = parseProjectTypes(types)
  if (parsed.length === 0) return null
  return parsed
    .map((type) => labelByCode[type] || PROPERTY_TYPE_ADMIN_LABEL[type] || type)
    .join(', ')
}
