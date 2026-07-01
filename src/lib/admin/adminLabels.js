/** Resolve admin account/accredited status label via next-intl `t` from `Admin` namespace. */
export function adminAccountStatusLabel(t, status) {
  if (!status) return '—'
  return t(`accountStatus.${status}`)
}

export function adminAccreditedStatusLabel(t, status) {
  if (!status) return '—'
  return t(`accreditedStatus.${status}`)
}

export function adminUserTypeLabel(t, type) {
  if (!type) return '—'
  return t(`userType.${type}`)
}
