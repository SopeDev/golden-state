export const OPERATOR_PERMISSIONS = {
  VIEW_DASHBOARD: 'VIEW_DASHBOARD',
  VIEW_PROPERTIES: 'VIEW_PROPERTIES',
  EDIT_PROPERTIES: 'EDIT_PROPERTIES',
  CREATE_PROPERTIES: 'CREATE_PROPERTIES',
  ARCHIVE_PROPERTIES: 'ARCHIVE_PROPERTIES',
  MANAGE_PROPERTY_DOCUMENTS: 'MANAGE_PROPERTY_DOCUMENTS',
  NOTIFY_PROPERTY_INVESTORS: 'NOTIFY_PROPERTY_INVESTORS',
  MANAGE_PROPERTY_TYPES: 'MANAGE_PROPERTY_TYPES',
  VIEW_INVESTORS: 'VIEW_INVESTORS',
  EDIT_INVESTORS: 'EDIT_INVESTORS',
  REVIEW_INVESTOR_ACCOUNTS: 'REVIEW_INVESTOR_ACCOUNTS',
  REVIEW_ACCREDITATION: 'REVIEW_ACCREDITATION',
  MANAGE_INVESTMENT_REQUESTS: 'MANAGE_INVESTMENT_REQUESTS',
  VIEW_FINANCIAL_ACTIVITY: 'VIEW_FINANCIAL_ACTIVITY',
  REVIEW_DEPOSITS: 'REVIEW_DEPOSITS',
  MANAGE_CONTRIBUTIONS: 'MANAGE_CONTRIBUTIONS',
  VIEW_RETURN_ACTIVITY: 'VIEW_RETURN_ACTIVITY',
  MANAGE_RETURN_DISTRIBUTIONS: 'MANAGE_RETURN_DISTRIBUTIONS',
  REVIEW_CASH_OUTS: 'REVIEW_CASH_OUTS',
  REVIEW_REINVESTMENTS: 'REVIEW_REINVESTMENTS',
  EDIT_WEBSITE_CONTENT: 'EDIT_WEBSITE_CONTENT',
}

export const DEFAULT_OPERATOR_PERMISSIONS = [
  OPERATOR_PERMISSIONS.VIEW_DASHBOARD,
  OPERATOR_PERMISSIONS.VIEW_PROPERTIES,
  OPERATOR_PERMISSIONS.EDIT_PROPERTIES,
  OPERATOR_PERMISSIONS.MANAGE_PROPERTY_DOCUMENTS,
  OPERATOR_PERMISSIONS.VIEW_INVESTORS,
  OPERATOR_PERMISSIONS.REVIEW_INVESTOR_ACCOUNTS,
  OPERATOR_PERMISSIONS.REVIEW_ACCREDITATION,
  OPERATOR_PERMISSIONS.MANAGE_INVESTMENT_REQUESTS,
  OPERATOR_PERMISSIONS.VIEW_FINANCIAL_ACTIVITY,
  OPERATOR_PERMISSIONS.VIEW_RETURN_ACTIVITY,
]

/** Permissions that must be enabled before a dependent permission can be granted. */
export const OPERATOR_PERMISSION_REQUIREMENTS = {
  [OPERATOR_PERMISSIONS.EDIT_PROPERTIES]: [OPERATOR_PERMISSIONS.VIEW_PROPERTIES],
  [OPERATOR_PERMISSIONS.CREATE_PROPERTIES]: [OPERATOR_PERMISSIONS.VIEW_PROPERTIES],
  [OPERATOR_PERMISSIONS.ARCHIVE_PROPERTIES]: [OPERATOR_PERMISSIONS.VIEW_PROPERTIES],
  [OPERATOR_PERMISSIONS.MANAGE_PROPERTY_DOCUMENTS]: [OPERATOR_PERMISSIONS.VIEW_PROPERTIES],
  [OPERATOR_PERMISSIONS.NOTIFY_PROPERTY_INVESTORS]: [
    OPERATOR_PERMISSIONS.VIEW_PROPERTIES,
    OPERATOR_PERMISSIONS.MANAGE_PROPERTY_DOCUMENTS,
  ],
  [OPERATOR_PERMISSIONS.MANAGE_PROPERTY_TYPES]: [OPERATOR_PERMISSIONS.VIEW_PROPERTIES],
  [OPERATOR_PERMISSIONS.EDIT_INVESTORS]: [OPERATOR_PERMISSIONS.VIEW_INVESTORS],
  [OPERATOR_PERMISSIONS.REVIEW_INVESTOR_ACCOUNTS]: [OPERATOR_PERMISSIONS.VIEW_INVESTORS],
  [OPERATOR_PERMISSIONS.REVIEW_ACCREDITATION]: [OPERATOR_PERMISSIONS.VIEW_INVESTORS],
  [OPERATOR_PERMISSIONS.MANAGE_INVESTMENT_REQUESTS]: [
    OPERATOR_PERMISSIONS.VIEW_FINANCIAL_ACTIVITY,
  ],
  [OPERATOR_PERMISSIONS.REVIEW_DEPOSITS]: [OPERATOR_PERMISSIONS.VIEW_FINANCIAL_ACTIVITY],
  [OPERATOR_PERMISSIONS.MANAGE_CONTRIBUTIONS]: [OPERATOR_PERMISSIONS.VIEW_FINANCIAL_ACTIVITY],
  [OPERATOR_PERMISSIONS.MANAGE_RETURN_DISTRIBUTIONS]: [
    OPERATOR_PERMISSIONS.VIEW_RETURN_ACTIVITY,
  ],
  [OPERATOR_PERMISSIONS.REVIEW_CASH_OUTS]: [OPERATOR_PERMISSIONS.VIEW_RETURN_ACTIVITY],
  [OPERATOR_PERMISSIONS.REVIEW_REINVESTMENTS]: [OPERATOR_PERMISSIONS.VIEW_RETURN_ACTIVITY],
}

export const OPERATOR_PERMISSION_GROUPS = [
  { id: 'dashboard', permissions: [OPERATOR_PERMISSIONS.VIEW_DASHBOARD] },
  {
    id: 'properties',
    permissions: [
      OPERATOR_PERMISSIONS.VIEW_PROPERTIES,
      OPERATOR_PERMISSIONS.EDIT_PROPERTIES,
      OPERATOR_PERMISSIONS.CREATE_PROPERTIES,
      OPERATOR_PERMISSIONS.ARCHIVE_PROPERTIES,
      OPERATOR_PERMISSIONS.MANAGE_PROPERTY_DOCUMENTS,
      OPERATOR_PERMISSIONS.NOTIFY_PROPERTY_INVESTORS,
      OPERATOR_PERMISSIONS.MANAGE_PROPERTY_TYPES,
    ],
  },
  {
    id: 'investors',
    permissions: [
      OPERATOR_PERMISSIONS.VIEW_INVESTORS,
      OPERATOR_PERMISSIONS.EDIT_INVESTORS,
      OPERATOR_PERMISSIONS.REVIEW_INVESTOR_ACCOUNTS,
      OPERATOR_PERMISSIONS.REVIEW_ACCREDITATION,
    ],
  },
  {
    id: 'investments',
    permissions: [
      OPERATOR_PERMISSIONS.VIEW_FINANCIAL_ACTIVITY,
      OPERATOR_PERMISSIONS.MANAGE_INVESTMENT_REQUESTS,
      OPERATOR_PERMISSIONS.REVIEW_DEPOSITS,
      OPERATOR_PERMISSIONS.MANAGE_CONTRIBUTIONS,
    ],
  },
  {
    id: 'returns',
    permissions: [
      OPERATOR_PERMISSIONS.VIEW_RETURN_ACTIVITY,
      OPERATOR_PERMISSIONS.MANAGE_RETURN_DISTRIBUTIONS,
      OPERATOR_PERMISSIONS.REVIEW_CASH_OUTS,
      OPERATOR_PERMISSIONS.REVIEW_REINVESTMENTS,
    ],
  },
  { id: 'content', permissions: [OPERATOR_PERMISSIONS.EDIT_WEBSITE_CONTENT] },
]

const VALID_PERMISSIONS = new Set(Object.values(OPERATOR_PERMISSIONS))

export function normalizeOperatorPermissions(value) {
  const permissions = Array.isArray(value) ? value.filter((item) => VALID_PERMISSIONS.has(item)) : []
  let normalized = [...new Set(permissions)]
  let changed = true

  // Drop orphaned children. Repeat so transitive dependencies cascade, e.g.
  // View properties -> Manage documents -> Notify investors.
  while (changed) {
    changed = false
    const enabled = new Set(normalized)
    const next = normalized.filter((permission) => {
      const requirements = OPERATOR_PERMISSION_REQUIREMENTS[permission] || []
      return requirements.every((required) => enabled.has(required))
    })
    if (next.length !== normalized.length) changed = true
    normalized = next
  }

  return normalized
}

export function arePermissionRequirementsMet(permission, enabledPermissions) {
  const enabled = new Set(enabledPermissions || [])
  return (OPERATOR_PERMISSION_REQUIREMENTS[permission] || []).every((required) =>
    enabled.has(required)
  )
}

export function getPermissionDependencyDepth(permission, visited = new Set()) {
  if (visited.has(permission)) return 0
  const requirements = OPERATOR_PERMISSION_REQUIREMENTS[permission] || []
  if (requirements.length === 0) return 0
  const nextVisited = new Set(visited).add(permission)
  return 1 + Math.max(
    0,
    ...requirements.map((required) =>
      getPermissionDependencyDepth(required, nextVisited)
    )
  )
}

export function hasOperatorPermission(user, permission) {
  if (user?.type === 'ADMIN') return true
  return user?.type === 'OPERATOR' && normalizeOperatorPermissions(user.operatorPermissions).includes(permission)
}

export function isAdminActor(user) {
  return user?.type === 'ADMIN' || user?.type === 'OPERATOR'
}

/** Permission required to keep viewing an admin page after live session updates. */
export function getOperatorAdminPagePermission(pathname, { hasPropertyId = false } = {}) {
  const path = (pathname || '').replace(/^\/(?:en|es)(?=\/)/, '')

  if (path === '/admin') return OPERATOR_PERMISSIONS.VIEW_DASHBOARD
  if (path.startsWith('/admin/property-types')) return OPERATOR_PERMISSIONS.MANAGE_PROPERTY_TYPES
  if (path.startsWith('/admin/properties')) {
    return hasPropertyId ? OPERATOR_PERMISSIONS.VIEW_PROPERTIES : null
  }
  if (path.startsWith('/admin/users')) return OPERATOR_PERMISSIONS.VIEW_INVESTORS
  if (path.startsWith('/admin/investments')) {
    return OPERATOR_PERMISSIONS.MANAGE_INVESTMENT_REQUESTS
  }
  if (
    path.startsWith('/admin/deposits') ||
    path.startsWith('/admin/contributions')
  ) {
    return OPERATOR_PERMISSIONS.VIEW_FINANCIAL_ACTIVITY
  }
  if (
    path.startsWith('/admin/distributions') ||
    path.startsWith('/admin/cash-outs') ||
    path.startsWith('/admin/reinvests')
  ) {
    return OPERATOR_PERMISSIONS.VIEW_RETURN_ACTIVITY
  }
  if (path.startsWith('/admin/content')) return OPERATOR_PERMISSIONS.EDIT_WEBSITE_CONTENT
  return undefined
}

export function canAccessOperatorAdminPage(user, pathname, options) {
  if (user?.type === 'ADMIN') return true
  if (user?.type !== 'OPERATOR') return false

  const permission = getOperatorAdminPagePermission(pathname, options)
  // The properties table is intentionally available to every operator.
  if (permission === null) return true
  return Boolean(permission && hasOperatorPermission(user, permission))
}

/** First admin page the current staff account can actually enter. */
export function getAdminLandingPath(user) {
  if (user?.type === 'ADMIN') return '/admin'
  if (user?.type !== 'OPERATOR') return '/'

  if (hasOperatorPermission(user, OPERATOR_PERMISSIONS.VIEW_DASHBOARD)) return '/admin'

  const hasPropertyAccess = [
    OPERATOR_PERMISSIONS.VIEW_PROPERTIES,
    OPERATOR_PERMISSIONS.EDIT_PROPERTIES,
    OPERATOR_PERMISSIONS.CREATE_PROPERTIES,
    OPERATOR_PERMISSIONS.ARCHIVE_PROPERTIES,
    OPERATOR_PERMISSIONS.MANAGE_PROPERTY_DOCUMENTS,
    OPERATOR_PERMISSIONS.NOTIFY_PROPERTY_INVESTORS,
    OPERATOR_PERMISSIONS.MANAGE_PROPERTY_TYPES,
  ].some((permission) => hasOperatorPermission(user, permission))
  if (hasPropertyAccess) return '/admin/properties'

  if (hasOperatorPermission(user, OPERATOR_PERMISSIONS.MANAGE_INVESTMENT_REQUESTS)) {
    return '/admin/investments'
  }
  if (hasOperatorPermission(user, OPERATOR_PERMISSIONS.VIEW_FINANCIAL_ACTIVITY)) {
    return '/admin/deposits'
  }
  if (hasOperatorPermission(user, OPERATOR_PERMISSIONS.VIEW_RETURN_ACTIVITY)) {
    return '/admin/distributions'
  }
  if (hasOperatorPermission(user, OPERATOR_PERMISSIONS.VIEW_INVESTORS)) {
    return '/admin/users'
  }
  if (hasOperatorPermission(user, OPERATOR_PERMISSIONS.EDIT_WEBSITE_CONTENT)) {
    return '/admin/content'
  }
  // The property table is intentionally the minimum operator-accessible admin page.
  return '/admin/properties'
}
