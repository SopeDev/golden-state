/** @type {Record<string, string>} */
const LABEL_KEY = {
  BUILD_TO_SELL: 'buildToSell',
  BUILD_TO_RENT: 'buildToRent',
  FLIPHOUSE: 'fliphouse',
  MEX_TO_US: 'mexToUs',
  US_TO_MEX: 'usToMex',
}

/** Outlined / neutral — type is a label, not a primary signal (status owns color). */
const TYPE_BADGE_CLASS =
  'border border-border bg-white text-foreground'

/** English labels for admin tables (UI is English). */
export const PROPERTY_TYPE_ADMIN_LABEL = {
  BUILD_TO_SELL: 'Build to Sell',
  BUILD_TO_RENT: 'Build to Rent',
  FLIPHOUSE: 'Fliphouses',
  MEX_TO_US: 'MEX to US',
  US_TO_MEX: 'US to MEX',
}

/**
 * @param {string} type - PropertyType enum value
 * @returns {string} — key under Projects.* (e.g. buildToSell)
 */
export function getPropertyTypeLabelKey(type) {
  return LABEL_KEY[type] || 'buildToRent'
}

export function getPropertyTypeBadgeClass(_type) {
  return TYPE_BADGE_CLASS
}
