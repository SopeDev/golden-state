/**
 * URL slugs under /projects/[slug] and legacy redirect targets.
 */

export const PROJECT_FILTER_SLUGS = [
  'build-to-sell',
  'build-to-rent',
  'fliphouses',
  'mex-to-us',
  'us-to-mex',
]

export const COMPLETED_PROJECTS_SLUG = 'completed'

/** Active (non-completed) listings shown on /projects and type filters */
export const ACTIVE_PROPERTY_STATUSES = ['PLANNING', 'IN_PROGRESS']

/** @type {Record<string, import('@prisma/client').PropertyType>} */
export const slugToPropertyType = {
  'build-to-sell': 'BUILD_TO_SELL',
  'build-to-rent': 'BUILD_TO_RENT',
  fliphouses: 'FLIPHOUSE',
  'mex-to-us': 'MEX_TO_US',
  'us-to-mex': 'US_TO_MEX',
}

/** @type {Record<import('@prisma/client').PropertyType, string>} */
export const propertyTypeToSlug = {
  BUILD_TO_SELL: 'build-to-sell',
  BUILD_TO_RENT: 'build-to-rent',
  FLIPHOUSE: 'fliphouses',
  MEX_TO_US: 'mex-to-us',
  US_TO_MEX: 'us-to-mex',
}

/**
 * i18n key under Projects.headers.* (camelCase segment, no "headers." prefix)
 */
export const slugToHeaderKey = {
  'build-to-sell': 'buildToSell',
  'build-to-rent': 'buildToRent',
  fliphouses: 'fliphouse',
  'mex-to-us': 'mexToUs',
  'us-to-mex': 'usToMex',
  completed: 'completed',
}

export function isValidProjectFilterSlug(slug) {
  return PROJECT_FILTER_SLUGS.includes(slug) || slug === COMPLETED_PROJECTS_SLUG
}

export function isCompletedProjectsSlug(slug) {
  return slug === COMPLETED_PROJECTS_SLUG
}
