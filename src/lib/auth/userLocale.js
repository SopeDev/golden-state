/** Prefer locale saved on investor profile; default English. */
export function resolveUserLocale(user) {
  const profile = user?.profile
  if (profile && typeof profile === 'object' && profile.locale === 'es') {
    return 'es'
  }
  return 'en'
}
