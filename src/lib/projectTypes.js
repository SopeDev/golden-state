/**
 * Project listing helpers. Property type catalog lives in `propertyTypes.js`.
 */

export {
  COMPLETED_PROJECTS_SLUG,
  ACTIVE_PROPERTY_STATUSES,
  isCompletedProjectsSlug,
  notDeletedProperty,
  propertyTypeInclude,
  getPropertyTypeBySlug,
  listActivePropertyTypes,
  toClientProperty,
  toClientProperties,
  toClientPropertyType,
} from '@/lib/propertyTypes'

/** @deprecated Prefer listActivePropertyTypes() — kept for static redirects only */
export const PROJECT_FILTER_SLUGS = [
  'build-to-sell',
  'build-to-rent',
  'fliphouses',
  'mex-to-us',
  'us-to-mex',
]

/** @deprecated Prefer DB property types */
export const slugToPropertyType = {
  'build-to-sell': 'BUILD_TO_SELL',
  'build-to-rent': 'BUILD_TO_RENT',
  fliphouses: 'FLIPHOUSE',
  'mex-to-us': 'MEX_TO_US',
  'us-to-mex': 'US_TO_MEX',
}

/** @deprecated Prefer DB property types */
export const propertyTypeToSlug = {
  BUILD_TO_SELL: 'build-to-sell',
  BUILD_TO_RENT: 'build-to-rent',
  FLIPHOUSE: 'fliphouses',
  MEX_TO_US: 'mex-to-us',
  US_TO_MEX: 'us-to-mex',
}

/**
 * Legacy i18n header keys for seeded types. New types use DB labels/descriptions.
 */
export const slugToHeaderKey = {
  'build-to-sell': 'buildToSell',
  'build-to-rent': 'buildToRent',
  fliphouses: 'fliphouse',
  'mex-to-us': 'mexToUs',
  'us-to-mex': 'usToMex',
  completed: 'completed',
}

export function isValidProjectFilterSlug(slug, activeSlugs = PROJECT_FILTER_SLUGS) {
  return activeSlugs.includes(slug) || slug === COMPLETED_PROJECTS_SLUG
}
