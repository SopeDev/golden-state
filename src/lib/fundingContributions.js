/**
 * FundingContribution helpers — capital raise ledger.
 * Investor portfolio holdings = ACTIVE + INVESTOR + userId set.
 */

export const CONTRIBUTION_SOURCES = ['INVESTOR', 'MANUAL']
export const CONTRIBUTION_STATUSES = ['ACTIVE', 'CANCELLED']

export const contributionInclude = {
  user: { select: { id: true, email: true, type: true } },
  property: {
    select: {
      id: true,
      name: true,
      investmentId: true,
      slug: true,
      price: true,
      status: true,
      city: true,
      state: true,
    },
  },
  createdByAdmin: { select: { id: true, email: true } },
  depositRequest: {
    select: {
      id: true,
      reference: true,
      status: true,
      depositedAt: true,
    },
  },
}

export function activeContributionWhere(extra = {}) {
  return { status: 'ACTIVE', ...extra }
}

export function investorHoldingWhere(userId, extra = {}) {
  return {
    userId,
    source: 'INVESTOR',
    status: 'ACTIVE',
    ...extra,
  }
}

/**
 * Collapse multiple contribution events into one portfolio row per property.
 */
export function aggregateHoldingsByProperty(contributions) {
  if (!Array.isArray(contributions) || !contributions.length) return []

  const byProperty = new Map()
  for (const row of contributions) {
    if (!row?.propertyId) continue
    const existing = byProperty.get(row.propertyId)
    if (!existing) {
      byProperty.set(row.propertyId, {
        id: row.id,
        propertyId: row.propertyId,
        userId: row.userId,
        amount: Number(row.amount) || 0,
        createdAt: row.createdAt,
        property: row.property,
        contributionCount: 1,
      })
      continue
    }
    existing.amount += Number(row.amount) || 0
    existing.contributionCount += 1
    if (new Date(row.createdAt) > new Date(existing.createdAt)) {
      existing.createdAt = row.createdAt
      existing.id = row.id
    }
  }

  return Array.from(byProperty.values()).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  )
}

export async function userHasActiveHolding(prisma, { userId, propertyId }) {
  if (!userId || !propertyId) return false
  const row = await prisma.fundingContribution.findFirst({
    where: investorHoldingWhere(userId, { propertyId }),
    select: { id: true },
  })
  return Boolean(row)
}
