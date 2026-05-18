/** @type {Record<string, string>} */
const LABEL_KEY = {
  BUILD_TO_SELL: 'buildToSell',
  BUILD_TO_RENT: 'buildToRent',
  FLIPHOUSE: 'fliphouse',
  MEX_TO_US: 'mexToUs',
  US_TO_MEX: 'usToMex',
}

/** Tailwind classes for type chips (same family as previous blue/gold split). */
const BADGE_CLASS = {
  BUILD_TO_SELL: 'bg-secondary-blue text-white',
  BUILD_TO_RENT: 'bg-secondary-gold text-primary',
  FLIPHOUSE: 'bg-emerald-700 text-white',
  MEX_TO_US: 'bg-violet-700 text-white',
  US_TO_MEX: 'bg-amber-700 text-white',
}

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

export function getPropertyTypeBadgeClass(type) {
  return BADGE_CLASS[type] || 'bg-muted text-foreground'
}
