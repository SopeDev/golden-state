/**
 * Capital raise helpers: funded amount = sum of ACTIVE FundingContribution.amount;
 * goal = Property.price.
 * Investor ROI (actualRoi) = ledger profit ROI from ACTIVE investor capital vs ACTIVE returns.
 */

import { getLedgerRoiPercent } from '@/lib/portfolioGrowth'

export const RAISE_STATUSES = ['FUNDING', 'FUNDED']
export const EXECUTION_STATUSES = ['PLANNING', 'IN_PROGRESS', 'COMPLETED']

export function isRaisePhaseStatus(status) {
  return RAISE_STATUSES.includes(status)
}

export function isExecutionStatus(status) {
  return EXECUTION_STATUSES.includes(status)
}

/** New investments only while the capital raise is open. Execution status is independent. */
export function isPropertyOpenForInvestment(statusOrProperty) {
  const status =
    typeof statusOrProperty === 'string' ? statusOrProperty : statusOrProperty?.status
  return status === 'FUNDING'
}

export function getFundedAmountFromContributions(contributions) {
  if (!Array.isArray(contributions)) return 0
  return contributions.reduce((sum, row) => {
    if (row?.status && row.status !== 'ACTIVE') return sum
    return sum + Number(row?.amount || 0)
  }, 0)
}

/** @deprecated Use getFundedAmountFromContributions */
export function getFundedAmountFromInvestments(investments) {
  return getFundedAmountFromContributions(investments)
}

export function getFundingPercent(fundedAmount, goal) {
  const g = Number(goal) || 0
  if (g <= 0) return 0
  return Math.min(100, Math.round((Number(fundedAmount) / g) * 100))
}

/** Dollars still available under the raise goal. */
export function getRemainingCapacity(goal, fundedAmount) {
  return Math.max(0, Number(goal || 0) - Number(fundedAmount || 0))
}

/** Platform-wide minimum ticket for every property. */
export const PLATFORM_MIN_INVESTMENT = 5000

/**
 * Stated ticket minimum — always the platform floor (not per-property).
 * First argument is ignored (legacy property.minInvestment call sites).
 */
export function getStatedMinInvestment(_ignoredMinInvestment, platformFloor = PLATFORM_MIN_INVESTMENT) {
  return Number(platformFloor) || PLATFORM_MIN_INVESTMENT
}

/**
 * Effective minimum = min(platform min, remaining capacity).
 * When less than a full ticket remains, the last investor may take the stub.
 */
export function getEffectiveMinInvestment({
  goal,
  fundedAmount,
  platformFloor = PLATFORM_MIN_INVESTMENT,
  minInvestment: _minInvestment,
} = {}) {
  const stated = Number(platformFloor) || PLATFORM_MIN_INVESTMENT
  const remaining = getRemainingCapacity(goal, fundedAmount)
  if (remaining <= 0) return stated
  return Math.min(stated, remaining)
}

export function roundLedgerRoiPercent(value) {
  if (value == null || !Number.isFinite(Number(value))) return null
  return Math.round(Number(value) * 10) / 10
}

/** Profit ROI from investor capital + credited returns (same formula as portfolio holdings). */
export function computePropertyActualRoi(investorCapital, totalReturns) {
  return roundLedgerRoiPercent(getLedgerRoiPercent(investorCapital, totalReturns))
}

export function withFundingFields(property, fundedAmount, extras = {}) {
  if (!property) return property
  const amount = Number(fundedAmount) || 0
  const goal = Number(property.price) || 0
  const remaining = getRemainingCapacity(goal, amount)
  const statedMin = PLATFORM_MIN_INVESTMENT
  const effectiveMin = getEffectiveMinInvestment({
    goal,
    fundedAmount: amount,
  })
  const next = {
    ...property,
    fundedAmount: amount,
    fundingPercent: getFundingPercent(amount, goal),
    investmentGoal: goal,
    remainingCapacity: remaining,
    statedMinInvestment: statedMin,
    effectiveMinInvestment: effectiveMin,
  }

  if (Object.prototype.hasOwnProperty.call(extras, 'actualRoi')) {
    next.actualRoi = extras.actualRoi
  }
  if (Object.prototype.hasOwnProperty.call(extras, 'investorCapital')) {
    next.investorCapital = extras.investorCapital
  }
  if (Object.prototype.hasOwnProperty.call(extras, 'totalReturns')) {
    next.totalReturns = extras.totalReturns
  }

  return next
}

export async function getPropertyFundedAmount(prisma, propertyId) {
  const agg = await prisma.fundingContribution.aggregate({
    where: { propertyId, status: 'ACTIVE' },
    _sum: { amount: true },
  })
  return Number(agg._sum.amount || 0)
}

export async function getPropertyInvestorCapital(prisma, propertyId) {
  const agg = await prisma.fundingContribution.aggregate({
    where: { propertyId, status: 'ACTIVE', source: 'INVESTOR' },
    _sum: { amount: true },
  })
  return Number(agg._sum.amount || 0)
}

export async function getPropertyReturnedAmount(prisma, propertyId) {
  const agg = await prisma.returnDistribution.aggregate({
    where: { propertyId, status: 'ACTIVE' },
    _sum: { amount: true },
  })
  return Number(agg._sum.amount || 0)
}

export async function getPropertyActualRoi(prisma, propertyId) {
  const [investorCapital, totalReturns] = await Promise.all([
    getPropertyInvestorCapital(prisma, propertyId),
    getPropertyReturnedAmount(prisma, propertyId),
  ])
  return {
    investorCapital,
    totalReturns,
    actualRoi: computePropertyActualRoi(investorCapital, totalReturns),
  }
}

/** Attach fundedAmount, fundingPercent, and ledger-derived actualRoi (one batch). */
export async function attachFundingToProperties(prisma, properties) {
  if (!properties?.length) return properties || []
  const ids = properties.map((p) => p.id)
  const [fundedGrouped, investorGrouped, returnGrouped] = await Promise.all([
    prisma.fundingContribution.groupBy({
      by: ['propertyId'],
      where: { propertyId: { in: ids }, status: 'ACTIVE' },
      _sum: { amount: true },
    }),
    prisma.fundingContribution.groupBy({
      by: ['propertyId'],
      where: { propertyId: { in: ids }, status: 'ACTIVE', source: 'INVESTOR' },
      _sum: { amount: true },
    }),
    prisma.returnDistribution.groupBy({
      by: ['propertyId'],
      where: { propertyId: { in: ids }, status: 'ACTIVE' },
      _sum: { amount: true },
    }),
  ])

  const fundedById = Object.fromEntries(
    fundedGrouped.map((row) => [row.propertyId, Number(row._sum.amount || 0)])
  )
  const investedById = Object.fromEntries(
    investorGrouped.map((row) => [row.propertyId, Number(row._sum.amount || 0)])
  )
  const returnedById = Object.fromEntries(
    returnGrouped.map((row) => [row.propertyId, Number(row._sum.amount || 0)])
  )

  return properties.map((p) => {
    const investorCapital = investedById[p.id] || 0
    const totalReturns = returnedById[p.id] || 0
    return withFundingFields(p, fundedById[p.id] || 0, {
      investorCapital,
      totalReturns,
      actualRoi: computePropertyActualRoi(investorCapital, totalReturns),
    })
  })
}

/** Single-property funding + ledger ROI enricher. */
export async function enrichPropertyWithFunding(prisma, property) {
  if (!property) return property
  const [enriched] = await attachFundingToProperties(prisma, [property])
  return enriched
}

export function assertNoOverfunding({ goal, currentFunded, additionalAmount }) {
  const next = Number(currentFunded) + Number(additionalAmount)
  const g = Number(goal)
  if (next > g + 1e-6) {
    const err = new Error('Contribution would exceed the funding goal')
    err.code = 'OVERFUND'
    throw err
  }
}

/**
 * Ensure amount fits under the property raise target.
 * Pass excludeContributionId when updating an existing row.
 */
export async function assertContributionFitsGoal(
  prisma,
  { propertyId, amount, excludeContributionId = null }
) {
  const property = await prisma.property.findUnique({ where: { id: propertyId } })
  if (!property) {
    const err = new Error('Property not found')
    err.code = 'NOT_FOUND'
    throw err
  }

  let current = await getPropertyFundedAmount(prisma, propertyId)
  if (excludeContributionId) {
    const existing = await prisma.fundingContribution.findUnique({
      where: { id: excludeContributionId },
    })
    if (existing && existing.propertyId === propertyId && existing.status === 'ACTIVE') {
      current -= Number(existing.amount || 0)
    }
  }

  assertNoOverfunding({
    goal: property.price,
    currentFunded: current,
    additionalAmount: amount,
  })

  return property
}

/** @deprecated Use assertContributionFitsGoal */
export async function assertInvestmentFitsGoal(prisma, args) {
  return assertContributionFitsGoal(prisma, {
    propertyId: args.propertyId,
    amount: args.amount,
    excludeContributionId: args.excludeInvestmentId || args.excludeContributionId || null,
  })
}

/**
 * Auto FUNDING ↔ FUNDED from capital only. Does not move into Planning.
 */
export async function syncPropertyFundingStatus(prisma, propertyId) {
  const property = await prisma.property.findUnique({ where: { id: propertyId } })
  if (!property) return null

  const funded = await getPropertyFundedAmount(prisma, propertyId)
  const goal = Number(property.price) || 0
  const fullyFunded = goal > 0 && funded >= goal - 1e-6

  if (property.status === 'FUNDING' && fullyFunded) {
    return prisma.property.update({
      where: { id: propertyId },
      data: { status: 'FUNDED' },
    })
  }

  if (property.status === 'FUNDED' && !fullyFunded) {
    return prisma.property.update({
      where: { id: propertyId },
      data: { status: 'FUNDING' },
    })
  }

  return property
}

/**
 * Execution (planning / in progress / completed) is independent of the raise.
 * Kept as a no-op so existing callers stay valid.
 */
export async function assertCanEnterExecutionStatus() {
  return
}

/**
 * Manual FUNDED requires capital already at goal.
 */
export async function assertCanSetFundedStatus(prisma, { propertyId, goalPrice }) {
  const funded = propertyId ? await getPropertyFundedAmount(prisma, propertyId) : 0
  const goal = Number(goalPrice) || 0
  if (goal <= 0 || funded < goal - 1e-6) {
    const err = new Error('Cannot mark Funded until raised capital meets the investment goal')
    err.code = 'NOT_FULLY_FUNDED'
    throw err
  }
}
