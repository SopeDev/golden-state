import { PROPERTY_TYPE_ADMIN_LABEL } from '@/lib/propertyTypeUi'

/** Property types investors can select at registration (matches Prisma PropertyType). */
export const QUESTIONNAIRE_PROPERTY_TYPES = [
  'BUILD_TO_SELL',
  'BUILD_TO_RENT',
  'FLIPHOUSE',
  'MEX_TO_US',
  'US_TO_MEX',
]

export const INVESTMENT_RANGE_OPTIONS = [
  'under_50k',
  '50k_100k',
  '100k_250k',
  '250k_500k',
  '500k_plus',
]

export const INVESTMENT_RANGE_LABELS = {
  under_50k: 'Under $50,000',
  '50k_100k': '$50,000 – $100,000',
  '100k_250k': '$100,000 – $250,000',
  '250k_500k': '$250,000 – $500,000',
  '500k_plus': '$500,000+',
}

export const EXPERIENCE_OPTIONS = ['none', 'some', 'experienced', 'professional']

const VALID_PROPERTY_TYPES = new Set(QUESTIONNAIRE_PROPERTY_TYPES)

export function parseProjectTypes(raw) {
  const list = Array.isArray(raw) ? raw : typeof raw === 'string' && raw ? [raw] : []
  return [...new Set(list.filter((value) => VALID_PROPERTY_TYPES.has(value)))]
}

export function formatProjectTypesForDisplay(types) {
  const parsed = parseProjectTypes(types)
  if (parsed.length === 0) return null
  return parsed.map((type) => PROPERTY_TYPE_ADMIN_LABEL[type] || type).join(', ')
}
