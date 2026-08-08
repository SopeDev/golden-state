/**
 * Capital raise helpers: funded amount = sum of ACTIVE FundingContribution.amount;
 * goal = Property.price.
 */

export const RAISE_STATUSES = ['FUNDING', 'FUNDED']
export const EXECUTION_STATUSES = ['PLANNING', 'IN_PROGRESS', 'COMPLETED']

export function isRaisePhaseStatus(status) {
  return RAISE_STATUSES.includes(status)
}

export function isExecutionStatus(status) {
  return EXECUTION_STATUSES.includes(status)
}

/** New investments only while the raise is open (not fully funded / execution). */
export function isPropertyOpenForInvestment(status) {
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

export function withFundingFields(property, fundedAmount) {
  if (!property) return property
  const amount = Number(fundedAmount) || 0
  const goal = Number(property.price) || 0
  const remaining = getRemainingCapacity(goal, amount)
  const statedMin = PLATFORM_MIN_INVESTMENT
  const effectiveMin = getEffectiveMinInvestment({
    goal,
    fundedAmount: amount,
  })
  return {
    ...property,
    fundedAmount: amount,
    fundingPercent: getFundingPercent(amount, goal),
    investmentGoal: goal,
    remainingCapacity: remaining,
    statedMinInvestment: statedMin,
    effectiveMinInvestment: effectiveMin,
  }
}

export async function getPropertyFundedAmount(prisma, propertyId) {
  const agg = await prisma.fundingContribution.aggregate({
    where: { propertyId, status: 'ACTIVE' },
    _sum: { amount: true },
  })
  return Number(agg._sum.amount || 0)
}

/** Attach fundedAmount + fundingPercent to a list of properties (one groupBy). */
export async function attachFundingToProperties(prisma, properties) {
  if (!properties?.length) return properties || []
  const ids = properties.map((p) => p.id)
  const grouped = await prisma.fundingContribution.groupBy({
    by: ['propertyId'],
    where: { propertyId: { in: ids }, status: 'ACTIVE' },
    _sum: { amount: true },
  })
  const byId = Object.fromEntries(
    grouped.map((row) => [row.propertyId, Number(row._sum.amount || 0)])
  )
  return properties.map((p) => withFundingFields(p, byId[p.id] || 0))
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
      data: { status: 'FUNDED', progressPercent: 0 },
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
 * Block entering Planning / In progress / Completed unless fully funded
 * when coming from Funding/Funded or creating as an execution status.
 */
export async function assertCanEnterExecutionStatus(
  prisma,
  { propertyId, nextStatus, goalPrice, previousStatus = null }
) {
  if (!isExecutionStatus(nextStatus)) return
  if (previousStatus && isExecutionStatus(previousStatus)) return

  const funded = propertyId ? await getPropertyFundedAmount(prisma, propertyId) : 0
  const goal = Number(goalPrice) || 0
  if (goal <= 0 || funded < goal - 1e-6) {
    const err = new Error(
      'Property must be fully funded before Planning, In progress, or Completed'
    )
    err.code = 'NOT_FULLY_FUNDED'
    throw err
  }
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
