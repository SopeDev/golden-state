/**
 * Investor wallet helpers — returns credits minus reserved/spent cash-outs & reinvests.
 *
 * available = ACTIVE distributions - PENDING requests - CONFIRMED (paid) requests
 * reserved  = PENDING cash-outs + PENDING reinvests (under review)
 * paid      = CONFIRMED cash-outs + CONFIRMED reinvests
 */

export const RETURN_DISTRIBUTION_STATUSES = ['ACTIVE', 'VOIDED']
export const WALLET_REQUEST_STATUSES = ['PENDING', 'CONFIRMED', 'REJECTED']
export const WALLET_RESERVED_STATUSES = ['PENDING', 'CONFIRMED']
export const WALLET_PENDING_STATUS = 'PENDING'
export const WALLET_PAID_STATUS = 'CONFIRMED'

export const propertyWalletSelect = {
  id: true,
  name: true,
  investmentId: true,
  slug: true,
  city: true,
  state: true,
  status: true,
  price: true,
}

export const returnDistributionInclude = {
  user: { select: { id: true, email: true, type: true } },
  property: { select: propertyWalletSelect },
  createdByAdmin: { select: { id: true, email: true } },
}

export const cashOutRequestInclude = {
  user: { select: { id: true, email: true, type: true } },
  reviewedBy: { select: { id: true, email: true } },
}

export const reinvestRequestInclude = {
  user: { select: { id: true, email: true, type: true } },
  destinationProperty: { select: propertyWalletSelect },
  reviewedBy: { select: { id: true, email: true } },
  contribution: {
    select: {
      id: true,
      amount: true,
      status: true,
      propertyId: true,
    },
  },
}

export function sumAmounts(rows) {
  if (!Array.isArray(rows) || !rows.length) return 0
  return rows.reduce((sum, row) => sum + (Number(row?.amount) || 0), 0)
}

export function computeWalletBalance({
  credited = 0,
  pendingCashOut = 0,
  pendingReinvest = 0,
  paidCashOut = 0,
  paidReinvest = 0,
} = {}) {
  const lifetimeCredited = Math.max(0, Number(credited) || 0)
  const reservedCashOut = Math.max(0, Number(pendingCashOut) || 0)
  const reservedReinvest = Math.max(0, Number(pendingReinvest) || 0)
  const confirmedCashOut = Math.max(0, Number(paidCashOut) || 0)
  const confirmedReinvest = Math.max(0, Number(paidReinvest) || 0)
  const reserved = reservedCashOut + reservedReinvest
  const paid = confirmedCashOut + confirmedReinvest
  const available = Math.max(0, lifetimeCredited - reserved - paid)
  return {
    lifetimeCredited,
    reservedCashOut,
    reservedReinvest,
    reserved,
    paidCashOut: confirmedCashOut,
    paidReinvest: confirmedReinvest,
    paid,
    available,
  }
}

export async function getWalletBalance(prisma, userId, { tx } = {}) {
  const client = tx || prisma
  const uid = Number(userId)
  if (!Number.isFinite(uid)) {
    return computeWalletBalance()
  }

  const [creditedAgg, pendingCashOutAgg, pendingReinvestAgg, paidCashOutAgg, paidReinvestAgg] =
    await Promise.all([
      client.returnDistribution.aggregate({
        where: { userId: uid, status: 'ACTIVE' },
        _sum: { amount: true },
      }),
      client.cashOutRequest.aggregate({
        where: { userId: uid, status: WALLET_PENDING_STATUS },
        _sum: { amount: true },
      }),
      client.reinvestRequest.aggregate({
        where: { userId: uid, status: WALLET_PENDING_STATUS },
        _sum: { amount: true },
      }),
      client.cashOutRequest.aggregate({
        where: { userId: uid, status: WALLET_PAID_STATUS },
        _sum: { amount: true },
      }),
      client.reinvestRequest.aggregate({
        where: { userId: uid, status: WALLET_PAID_STATUS },
        _sum: { amount: true },
      }),
    ])

  return computeWalletBalance({
    credited: creditedAgg._sum.amount,
    pendingCashOut: pendingCashOutAgg._sum.amount,
    pendingReinvest: pendingReinvestAgg._sum.amount,
    paidCashOut: paidCashOutAgg._sum.amount,
    paidReinvest: paidReinvestAgg._sum.amount,
  })
}

/**
 * True if voiding this ACTIVE distribution would not make available negative.
 * availableAfterVoid = available - amount  (voiding removes a credit)
 * Equivalent: amount <= available
 */
export function canVoidDistribution(available, distributionAmount) {
  return Number(distributionAmount) <= Number(available) + 1e-6
}

export async function assertCanReserveWallet(prisma, { userId, amount, tx } = {}) {
  const value = Number(amount)
  if (!Number.isFinite(value) || value <= 0) {
    const err = new Error('A positive amount is required')
    err.code = 'INVALID_AMOUNT'
    throw err
  }

  const balance = await getWalletBalance(prisma, userId, { tx })
  if (value > balance.available + 1e-6) {
    const err = new Error('Amount exceeds available wallet balance')
    err.code = 'INSUFFICIENT_FUNDS'
    err.available = balance.available
    throw err
  }

  return balance
}

export async function getPerPropertyReturnTotals(prisma, userId) {
  const uid = Number(userId)
  if (!Number.isFinite(uid)) return []

  const grouped = await prisma.returnDistribution.groupBy({
    by: ['propertyId'],
    where: { userId: uid, status: 'ACTIVE' },
    _sum: { amount: true },
  })

  if (!grouped.length) return []

  const properties = await prisma.property.findMany({
    where: { id: { in: grouped.map((row) => row.propertyId) } },
    select: propertyWalletSelect,
  })
  const byId = Object.fromEntries(properties.map((p) => [p.id, p]))

  return grouped
    .map((row) => ({
      propertyId: row.propertyId,
      totalReturns: Number(row._sum.amount || 0),
      property: byId[row.propertyId] || null,
    }))
    .filter((row) => row.totalReturns > 0)
    .sort((a, b) => b.totalReturns - a.totalReturns)
}

export async function buildWalletSummary(prisma, userId, { activityLimit = 50 } = {}) {
  const uid = Number(userId)
  const balance = await getWalletBalance(prisma, uid)
  const [distributions, cashOuts, reinvests, perProperty] = await Promise.all([
    prisma.returnDistribution.findMany({
      where: { userId: uid },
      include: { property: { select: propertyWalletSelect } },
      orderBy: { distributedAt: 'desc' },
      take: 50,
    }),
    prisma.cashOutRequest.findMany({
      where: { userId: uid },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.reinvestRequest.findMany({
      where: { userId: uid },
      include: {
        destinationProperty: { select: propertyWalletSelect },
        contribution: { select: { id: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    getPerPropertyReturnTotals(prisma, uid),
  ])

  const activity = [
    ...distributions.map((row) => ({
      id: `dist-${row.id}`,
      kind: row.status === 'VOIDED' ? 'RETURN_VOIDED' : 'RETURN_CREDIT',
      amount: row.amount,
      at: row.distributedAt || row.createdAt,
      status: row.status,
      property: row.property,
      concept: row.concept,
      note: row.note,
      sourceId: row.id,
    })),
    ...cashOuts.map((row) => ({
      id: `cash-${row.id}`,
      kind: 'CASH_OUT',
      amount: row.amount,
      at: row.createdAt,
      status: row.status,
      adminNote: row.adminNote,
      sourceId: row.id,
    })),
    ...reinvests.map((row) => ({
      id: `reinvest-${row.id}`,
      kind: 'REINVEST',
      amount: row.amount,
      at: row.createdAt,
      status: row.status,
      property: row.destinationProperty,
      adminNote: row.adminNote,
      sourceId: row.id,
    })),
  ]
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, activityLimit)

  return {
    ...balance,
    perProperty,
    distributions,
    cashOuts,
    reinvests,
    activity,
  }
}
