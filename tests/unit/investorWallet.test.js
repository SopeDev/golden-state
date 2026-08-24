import { describe, expect, it } from 'vitest'
import { canVoidDistribution, computeWalletBalance } from '@/lib/investorWallet'

describe('investor wallet calculations', () => {
  it.each([
    {
      name: 'empty wallet',
      input: {},
      expected: { lifetimeCredited: 0, reserved: 0, paid: 0, available: 0 },
    },
    {
      name: 'cash-out and reinvestment reservations',
      input: { credited: 1000, pendingCashOut: 150, pendingReinvest: 250 },
      expected: { lifetimeCredited: 1000, reserved: 400, paid: 0, available: 600 },
    },
    {
      name: 'confirmed requests remain consumed',
      input: { credited: 1000, paidCashOut: 200, paidReinvest: 300 },
      expected: { lifetimeCredited: 1000, reserved: 0, paid: 500, available: 500 },
    },
    {
      name: 'mixed decimal activity',
      input: {
        credited: 1000.75,
        pendingCashOut: 100.25,
        pendingReinvest: 50.5,
        paidCashOut: 200,
        paidReinvest: 150,
      },
      expected: { lifetimeCredited: 1000.75, reserved: 150.75, paid: 350, available: 500 },
    },
    {
      name: 'available balance never becomes negative',
      input: { credited: 100, pendingCashOut: 250 },
      expected: { lifetimeCredited: 100, reserved: 250, paid: 0, available: 0 },
    },
  ])('$name', ({ input, expected }) => {
    expect(computeWalletBalance(input)).toMatchObject(expected)
  })

  it('allows voiding only when the distribution is still available', () => {
    expect(canVoidDistribution(250, 250)).toBe(true)
    expect(canVoidDistribution(250, 250.0000001)).toBe(true)
    expect(canVoidDistribution(249.99, 250)).toBe(false)
  })
})
