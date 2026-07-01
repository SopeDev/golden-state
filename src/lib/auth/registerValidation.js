import { parseProjectTypes } from '@/lib/auth/investorProfileOptions'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateAccountRegistration(body) {
  const errors = {}

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body.password === 'string' ? body.password : ''
  const confirmPassword =
    typeof body.confirmPassword === 'string' ? body.confirmPassword : ''

  if (!email || !EMAIL_RE.test(email)) {
    errors.email = 'invalid_email'
  }

  if (!password || password.length < 8) {
    errors.password = 'password_too_short'
  }

  if (password !== confirmPassword) {
    errors.confirmPassword = 'password_mismatch'
  }

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    data: { email, password },
  }
}

/** @deprecated Use validateAccountRegistration or validateProfileCompletion */
export function validateRegistration(body) {
  const account = validateAccountRegistration(body)
  if (!account.ok) return account

  const profileResult = validateProfileCompletion(body)
  if (!profileResult.ok) {
    return { ok: false, errors: profileResult.errors, data: null }
  }

  return {
    ok: true,
    errors: {},
    data: { ...account.data, profile: profileResult.profile },
  }
}

export function buildProfile(body) {
  const str = (key) => (typeof body[key] === 'string' ? body[key].trim() : '')

  return {
    fullName: str('fullName'),
    phone: str('phone'),
    investmentGoals: str('investmentGoals'),
    experience: str('experience'),
    investmentRange: str('investmentRange'),
    projectTypes: parseProjectTypes(body.projectTypes),
    referralSource: str('referralSource'),
    background: str('background'),
    locale: body.locale === 'es' ? 'es' : 'en',
    completedAt: new Date().toISOString(),
  }
}

export function validateProfileCompletion(body) {
  const errors = {}
  const profile = buildProfile(body)
  if (!profile.fullName) errors.fullName = 'required'
  if (!profile.investmentGoals) errors.investmentGoals = 'required'
  if (!profile.experience) errors.experience = 'required'
  if (!profile.investmentRange) errors.investmentRange = 'required'
  if (profile.projectTypes.length === 0) errors.projectTypes = 'required'

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    profile,
  }
}
