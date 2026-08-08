export const ACCOUNT_STATUS = {
  PENDING_EMAIL: 'PENDING_EMAIL',
  PENDING_ADMIN: 'PENDING_ADMIN',
  ACTIVE: 'ACTIVE',
  REJECTED: 'REJECTED',
}

export const ACCOUNT_STATUS_LABELS = {
  PENDING_EMAIL: 'PENDING EMAIL',
  PENDING_ADMIN: 'PENDING APPROVAL',
  ACTIVE: 'ACTIVE',
  REJECTED: 'REJECTED',
}

export const ACCREDITED_STATUS_LABELS = {
  NOT_STARTED: 'NOT STARTED',
  PENDING_REVIEW: 'PENDING REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
}

export function getAccountStatusLabel(status) {
  return ACCOUNT_STATUS_LABELS[status] || status?.replace(/_/g, ' ')?.toUpperCase() || '—'
}

export function getAccreditedStatusLabel(status) {
  return ACCREDITED_STATUS_LABELS[status] || status?.replace(/_/g, ' ')?.toUpperCase() || '—'
}

export function getAccountStatusBadgeClass(status) {
  switch (status) {
    case ACCOUNT_STATUS.PENDING_ADMIN:
      return 'bg-amber-400/30 text-amber-950 dark:bg-amber-500/25 dark:text-amber-100'
    case ACCOUNT_STATUS.PENDING_EMAIL:
      return 'bg-blue-600/15 text-blue-800 dark:text-blue-300'
    case ACCOUNT_STATUS.ACTIVE:
      return 'bg-green-600/15 text-green-800 dark:text-green-400'
    case ACCOUNT_STATUS.REJECTED:
      return 'bg-destructive/15 text-destructive'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

export const ACCREDITED_STATUS = {
  NOT_STARTED: 'NOT_STARTED',
  PENDING_REVIEW: 'PENDING_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
}

export function getAccreditedStatusBadgeClass(status) {
  switch (status) {
    case ACCREDITED_STATUS.APPROVED:
      return 'bg-green-600/15 text-green-800 dark:text-green-400'
    case ACCREDITED_STATUS.PENDING_REVIEW:
      return 'bg-amber-400/30 text-amber-950 dark:bg-amber-500/25 dark:text-amber-100'
    case ACCREDITED_STATUS.REJECTED:
      return 'bg-destructive/15 text-destructive'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

export const canAccessPortfolio = (user) =>
  user?.type === 'ADMIN' ||
  (user?.accountStatus === ACCOUNT_STATUS.ACTIVE &&
    user?.accreditedStatus === ACCREDITED_STATUS.APPROVED)

export const canAccessDashboard = (user) =>
  Boolean(user && (user.type === 'ADMIN' || user.type === 'INVESTOR'))

export const canInvest = (user) => canAccessPortfolio(user)

export const needsEmailVerification = (user) =>
  user?.type !== 'ADMIN' &&
  user?.provider === 'credentials' &&
  !user?.emailVerified

export const needsAdminApproval = (user) =>
  user?.accountStatus === ACCOUNT_STATUS.PENDING_ADMIN

export const needsProfileCompletion = (user) => {
  if (!user || user.type === 'ADMIN') return false
  const profile = user.profile
  return !profile || typeof profile !== 'object' || !profile.completedAt
}

/** Session user shape: emailVerified, profileComplete, provider, accountStatus */
export function resolveInvestorOnboardingPath(user) {
  if (!user || user.type === 'ADMIN') return null
  if (user.accountStatus === ACCOUNT_STATUS.REJECTED) return '/account/rejected'
  if (needsEmailVerification(user)) return '/register/check-email'
  if (!user.profileComplete) return '/account/complete-profile'
  if (user.accountStatus === ACCOUNT_STATUS.PENDING_ADMIN) return '/account/pending'
  if (user.accountStatus !== ACCOUNT_STATUS.ACTIVE) return '/account/pending'
  return null
}

/** Where an investor should go instead of portfolio. */
export function resolvePortfolioAccessRedirect(user) {
  if (!user) return '/login'
  if (user.type === 'ADMIN') return null
  if (user.accountStatus === ACCOUNT_STATUS.REJECTED) return '/account/rejected'
  if (canAccessPortfolio(user)) return null
  if (needsEmailVerification(user)) return '/register/check-email'
  if (!user.profileComplete) return '/account/complete-profile'
  if (user.accountStatus === ACCOUNT_STATUS.PENDING_ADMIN) return '/account/pending'
  // Account approved but not accredited — portfolio stays empty until then
  if (user.accountStatus === ACCOUNT_STATUS.ACTIVE) {
    return '/dashboard/account/accreditation'
  }
  return '/account/pending'
}

export function resolveProtectedPortfolioHref(user) {
  return resolveAccreditedAreaHref(user, '/dashboard/portfolio')
}

export function resolveProtectedInvestmentsHref(user) {
  return resolveAccreditedAreaHref(user, '/dashboard/investments')
}

function resolveAccreditedAreaHref(user, target) {
  if (!user) return '/login'
  if (user.type === 'ADMIN') return target
  const redirectPath = resolvePortfolioAccessRedirect(user)
  if (redirectPath) return redirectPath
  return target
}

/** Nav + route guards: where an investor should go instead of a protected destination. */
export function resolveProtectedInvestorHref(user, target = '/dashboard') {
  if (!user) return '/login'
  if (user.type === 'ADMIN') return target
  if (target === '/dashboard/portfolio' || target.startsWith('/dashboard/portfolio/')) {
    return resolveProtectedPortfolioHref(user)
  }
  if (target === '/dashboard/investments' || target.startsWith('/dashboard/investments/')) {
    return resolveProtectedInvestmentsHref(user)
  }
  if (target === '/dashboard' || target === '/dashboard/account' || target.startsWith('/dashboard/account')) {
    return target
  }
  const onboardingPath = resolveInvestorOnboardingPath(user)
  if (onboardingPath) return onboardingPath
  return target
}

export function resolveDashboardAccessRedirect(user) {
  return resolvePortfolioAccessRedirect(user)
}

export const isProfileComplete = (profile) =>
  profile &&
  typeof profile === 'object' &&
  profile.completedAt &&
  profile.fullName &&
  profile.investmentGoals
