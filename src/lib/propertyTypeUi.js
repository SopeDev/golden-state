import { getPropertyTypeLabel } from '@/lib/propertyTypes'

/** Outlined / neutral — type is a label, not a primary signal (status owns color). */
const TYPE_BADGE_CLASS = 'border border-border bg-white text-foreground'

/**
 * @deprecated Prefer getPropertyTypeLabel(propertyType, locale) from propertyTypes.js
 * Kept for older call sites that only have a code string.
 */
const LABEL_KEY = {
  BUILD_TO_SELL: 'buildToSell',
  BUILD_TO_RENT: 'buildToRent',
  FLIPHOUSE: 'fliphouse',
  MEX_TO_US: 'mexToUs',
  US_TO_MEX: 'usToMex',
}

/** @deprecated Prefer DB labels via getPropertyTypeLabel */
export const PROPERTY_TYPE_ADMIN_LABEL = {
  BUILD_TO_SELL: 'Build to Sell',
  BUILD_TO_RENT: 'Build to Rent',
  FLIPHOUSE: 'Fliphouses',
  MEX_TO_US: 'MEX to US',
  US_TO_MEX: 'US to MEX',
}

/**
 * Resolve display label for a property or type object/code.
 * Prefer property.propertyType when present.
 */
export function resolvePropertyTypeLabel(propertyOrType, locale = 'en') {
  if (!propertyOrType) return '—'
  if (propertyOrType.propertyType) {
    return getPropertyTypeLabel(propertyOrType.propertyType, locale)
  }
  if (typeof propertyOrType === 'object' && propertyOrType.labelEn) {
    return getPropertyTypeLabel(propertyOrType, locale)
  }
  const code =
    typeof propertyOrType === 'string' ? propertyOrType : propertyOrType.type || propertyOrType.code
  return PROPERTY_TYPE_ADMIN_LABEL[code] || code || '—'
}

/** @deprecated Use resolvePropertyTypeLabel — returns i18n key under Projects.* for seeded types */
export function getPropertyTypeLabelKey(type) {
  const code = typeof type === 'string' ? type : type?.code || type?.type
  return LABEL_KEY[code] || 'buildToRent'
}

export function getPropertyTypeBadgeClass(_type) {
  return TYPE_BADGE_CLASS
}
