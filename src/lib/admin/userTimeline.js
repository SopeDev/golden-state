/**
 * Admin-facing investor onboarding phase.
 * DB may keep accountStatus=PENDING_EMAIL after email verify until profile is done;
 * this helper exposes the real step for badges, filters, and review UI.
 */

export function isUserEmailVerified(user) {
  if (!user) return false
  if (user.emailVerifiedAt) return true
  if (user.emailVerified) return true
  if (user.provider === 'google') return true
  return false
}

export function isUserProfileComplete(user) {
  if (user?.profileComplete) return true
  const profile = user?.profile
  return Boolean(profile && typeof profile === 'object' && profile.completedAt)
}

/** @returns {'PENDING_EMAIL'|'PENDING_PROFILE'|'PENDING_ADMIN'|'ACTIVE'|'REJECTED'|null} */
export function getInvestorAdminPhase(user) {
  if (!user || user.type === 'ADMIN') return null
  if (user.accountStatus === 'REJECTED') return 'REJECTED'
  if (user.accountStatus === 'ACTIVE') return 'ACTIVE'
  if (user.accountStatus === 'PENDING_ADMIN') return 'PENDING_ADMIN'

  if (!isUserEmailVerified(user)) return 'PENDING_EMAIL'
  if (!isUserProfileComplete(user)) return 'PENDING_PROFILE'
  return 'PENDING_ADMIN'
}

export function getInvestorAdminPhaseBadgeClass(phase) {
  switch (phase) {
    case 'PENDING_ADMIN':
      return 'bg-amber-400/30 text-amber-950 dark:bg-amber-500/25 dark:text-amber-100'
    case 'PENDING_EMAIL':
      return 'bg-blue-600/15 text-blue-800 dark:text-blue-300'
    case 'PENDING_PROFILE':
      return 'bg-violet-600/15 text-violet-900 dark:bg-violet-500/25 dark:text-violet-100'
    case 'ACTIVE':
      return 'bg-green-600/15 text-green-800 dark:text-green-400'
    case 'REJECTED':
      return 'bg-destructive/15 text-destructive'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

export function getInvestorAdminPhaseTone(phase) {
  switch (phase) {
    case 'ACTIVE':
      return 'ok'
    case 'REJECTED':
      return 'bad'
    case 'PENDING_ADMIN':
      return 'warn'
    case 'PENDING_PROFILE':
      return 'info'
    case 'PENDING_EMAIL':
      return 'info'
    default:
      return 'neutral'
  }
}

/**
 * Chronological activity events derived from user timestamps.
 * @returns {{ id: string, key: string, at: string|Date }[]}
 */
export function buildUserActivityEvents(user) {
  if (!user) return []

  const events = []

  if (user.createdAt) {
    events.push({ id: 'registered', key: 'registered', at: user.createdAt })
  }

  if (user.emailVerifiedAt) {
    events.push({ id: 'emailVerified', key: 'emailVerified', at: user.emailVerifiedAt })
  } else if (user.provider === 'google' && user.createdAt) {
    events.push({
      id: 'emailVerified',
      key: 'emailVerifiedGoogle',
      at: user.createdAt,
    })
  }

  const profileCompletedAt =
    user.profile && typeof user.profile === 'object' ? user.profile.completedAt : null
  if (profileCompletedAt) {
    events.push({
      id: 'profileCompleted',
      key: 'profileCompleted',
      at: profileCompletedAt,
    })
  }

  if (user.adminApprovedAt) {
    events.push({
      id: 'accountApproved',
      key: 'accountApproved',
      at: user.adminApprovedAt,
    })
  }

  if (user.accreditedSubmittedAt) {
    events.push({
      id: 'accreditationSubmitted',
      key: 'accreditationSubmitted',
      at: user.accreditedSubmittedAt,
    })
  }

  if (user.accreditedReviewedAt) {
    events.push({
      id: 'accreditationReviewed',
      key: 'accreditationReviewed',
      at: user.accreditedReviewedAt,
    })
  }

  return events.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())
}
