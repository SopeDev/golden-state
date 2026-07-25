/**
 * Capital raise helpers: funded amount = sum of Investment.amount; goal = Property.price.
 */

export const RAISE_STATUSES = ['FUNDING', 'FUNDED']
export const EXECUTION_STATUSES = ['PLANNING', 'IN_PROGRESS', 'COMPLETED']

export function isRaisePhaseStatus(status) {
  return RAISE_STATUSES.includes(status)
}

export function isExecutionStatus(status) {
  return EXECUTION_STATUSES.includes(status)
}

export function getFundedAmountFromInvestments(investments) {
  if (!Array.isArray(investments)) return 0
  return investments.reduce((sum, row) => sum + Number(row?.amount || 0), 0)
}

export function getFundingPercent(fundedAmount, goal) {
  const g = Number(goal) || 0
  if (g <= 0) return 0
  return Math.min(100, Math.round((Number(fundedAmount) / g) * 100))
}

export function withFundingFields(property, fundedAmount) {
  if (!property) return property
  const amount = Number(fundedAmount) || 0
  const goal = Number(property.price) || 0
  return {
    ...property,
    fundedAmount: amount,
    fundingPercent: getFundingPercent(amount, goal),
    investmentGoal: goal,
  }
}

export async function getPropertyFundedAmount(prisma, propertyId) {
  const agg = await prisma.investment.aggregate({
    where: { propertyId },
    _sum: { amount: true },
  })
  return Number(agg._sum.amount || 0)
}

/** Attach fundedAmount + fundingPercent to a list of properties (one groupBy). */
export async function attachFundingToProperties(prisma, properties) {
  if (!properties?.length) return properties || []
  const ids = properties.map((p) => p.id)
  const grouped = await prisma.investment.groupBy({
    by: ['propertyId'],
    where: { propertyId: { in: ids } },
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
    const err = new Error('Investment would exceed the funding goal')
    err.code = 'OVERFUND'
    throw err
  }
}

/**
 * Ensure amount fits under the property raise target.
 * Pass excludeInvestmentId when updating an existing row.
 */
export async function assertInvestmentFitsGoal(
  prisma,
  { propertyId, amount, excludeInvestmentId = null }
) {
  const property = await prisma.property.findUnique({ where: { id: propertyId } })
  if (!property) {
    const err = new Error('Property not found')
    err.code = 'NOT_FOUND'
    throw err
  }

  let current = await getPropertyFundedAmount(prisma, propertyId)
  if (excludeInvestmentId) {
    const existing = await prisma.investment.findUnique({
      where: { id: excludeInvestmentId },
    })
    if (existing && existing.propertyId === propertyId) {
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
  // Already in execution — allow updates / moves among Planning / In progress / Completed
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
