import {
  adminCashOutPath,
  adminDepositPath,
  adminIntentPath,
  adminReinvestPath,
  adminUserPath,
} from '@/lib/adminLinks'

export function getAppBaseUrl() {
  return process.env.NEXTAUTH_URL || process.env.APP_URL || 'http://localhost:3000'
}

export function absAppUrl(locale, path) {
  const base = getAppBaseUrl().replace(/\/$/, '')
  const loc = locale === 'es' ? 'es' : 'en'
  const clean = path.startsWith('/') ? path : `/${path}`
  return `${base}/${loc}${clean}`
}

export function investorAppLinks(locale) {
  return {
    dashboard: absAppUrl(locale, '/dashboard'),
    activity: absAppUrl(locale, '/dashboard/activity'),
    activityWallet: absAppUrl(locale, '/dashboard/activity?tab=wallet'),
    activityRequests: absAppUrl(locale, '/dashboard/activity?tab=requests'),
    portfolio: absAppUrl(locale, '/dashboard/portfolio'),
    updates: absAppUrl(locale, '/dashboard/updates'),
    propertyDocuments: (propertyId) =>
      propertyId
        ? absAppUrl(locale, `/dashboard/portfolio/${propertyId}/documents`)
        : absAppUrl(locale, '/dashboard/portfolio'),
    accreditation: absAppUrl(locale, '/dashboard/account/accreditation'),
    accountRejected: absAppUrl(locale, '/account/rejected'),
    accountPending: absAppUrl(locale, '/account/pending'),
    contact: absAppUrl(locale, '/contact'),
    invest: (investmentId) =>
      investmentId
        ? absAppUrl(locale, `/properties/${investmentId}/invest`)
        : absAppUrl(locale, '/dashboard/activity?tab=requests'),
  }
}

export function adminAppLinks(locale, { userId, intentId, depositId, cashOutId, reinvestId } = {}) {
  return {
    user: absAppUrl(locale, adminUserPath(userId)),
    users: absAppUrl(locale, '/admin/users'),
    intent: absAppUrl(locale, adminIntentPath(intentId)),
    deposit: absAppUrl(locale, adminDepositPath(depositId)),
    cashOut: absAppUrl(locale, adminCashOutPath(cashOutId)),
    reinvest: absAppUrl(locale, adminReinvestPath(reinvestId)),
  }
}

export const investorEmailSelect = {
  id: true,
  email: true,
  profile: true,
}
