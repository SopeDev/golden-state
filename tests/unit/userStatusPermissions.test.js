import { describe, expect, it } from 'vitest'
import {
  resolveInvestNextStep,
  resolvePortfolioAccessRedirect,
  resolvePostLoginPath,
} from '@/lib/auth/userStatus'
import {
  normalizeOperatorPermissions,
  OPERATOR_PERMISSIONS as P,
} from '@/lib/operatorPermissions'

const investor = (overrides = {}) => ({
  type: 'INVESTOR',
  provider: 'credentials',
  emailVerified: true,
  profileComplete: true,
  accountStatus: 'ACTIVE',
  accreditedStatus: 'APPROVED',
  ...overrides,
})

describe('investor route decisions', () => {
  it.each([
    ['anonymous', null, '/login'],
    ['rejected account', investor({ accountStatus: 'REJECTED' }), '/account/rejected'],
    [
      'unverified email',
      investor({
        accountStatus: 'PENDING_EMAIL',
        accreditedStatus: 'NOT_STARTED',
        emailVerified: false,
      }),
      '/register/check-email',
    ],
    [
      'incomplete profile',
      investor({
        accountStatus: 'PENDING_EMAIL',
        accreditedStatus: 'NOT_STARTED',
        profileComplete: false,
      }),
      '/account/complete-profile',
    ],
    ['pending approval', investor({ accountStatus: 'PENDING_ADMIN' }), '/account/pending'],
    [
      'active non-accredited investor',
      investor({ accreditedStatus: 'NOT_STARTED' }),
      '/dashboard/account/accreditation',
    ],
    ['active accredited investor', investor(), null],
  ])('routes %s away from the portfolio as expected', (_name, user, expected) => {
    expect(resolvePortfolioAccessRedirect(user)).toBe(expected)
  })

  it('sends admins/operators to admin and investors through onboarding', () => {
    expect(resolvePostLoginPath({ type: 'ADMIN' })).toBe('/admin')
    expect(
      resolvePostLoginPath({
        type: 'OPERATOR',
        operatorPermissions: [P.VIEW_DASHBOARD],
      })
    ).toBe('/admin')
    expect(resolvePostLoginPath({ type: 'OPERATOR' })).toBe('/admin/properties')
    expect(resolvePostLoginPath(investor({ accountStatus: 'PENDING_ADMIN' }))).toBe(
      '/account/pending'
    )
    expect(resolvePostLoginPath(investor())).toBe('/dashboard')
  })

  it('selects the correct next investment action for eligibility and property state', () => {
    expect(resolveInvestNextStep(null, { investmentId: 42 })).toEqual({
      href: '/login?callbackUrl=%2Fproperties%2F42%2Finvest',
      ctaKey: 'loginOrRegister',
    })
    expect(resolveInvestNextStep(investor({ accreditedStatus: 'REJECTED' }), { investmentId: 42 }))
      .toMatchObject({ href: '/dashboard/account/accreditation', ctaKey: 'resubmitAccreditation' })
    expect(resolveInvestNextStep(investor(), { investmentId: 42 })).toEqual({
      href: '/properties/42/invest',
      ctaKey: 'investNow',
    })
    expect(resolveInvestNextStep(investor(), { investmentId: 42, propertyOpen: false })).toEqual({
      href: '/projects',
      ctaKey: 'browseProjects',
    })
  })
})

describe('operator permission normalization', () => {
  it('deduplicates permissions, rejects unknown values, and drops orphaned dependencies', () => {
    expect(
      normalizeOperatorPermissions([
        P.VIEW_PROPERTIES,
        P.VIEW_PROPERTIES,
        'NOT_A_PERMISSION',
        P.NOTIFY_PROPERTY_INVESTORS,
      ])
    ).toEqual([P.VIEW_PROPERTIES])
  })

  it('retains dependent permissions when all requirements are enabled', () => {
    expect(
      normalizeOperatorPermissions([
        P.VIEW_PROPERTIES,
        P.MANAGE_PROPERTY_DOCUMENTS,
        P.NOTIFY_PROPERTY_INVESTORS,
      ])
    ).toEqual([
      P.VIEW_PROPERTIES,
      P.MANAGE_PROPERTY_DOCUMENTS,
      P.NOTIFY_PROPERTY_INVESTORS,
    ])
  })
})
