/**
 * Investor activity helpers: what is still in flight, and the single next action
 * the activity page should lead with.
 */

export const OPEN_INTENT_STATUSES = ['MEETING_REQUESTED', 'AWAITING_WIRE']

export const ACTIVITY_TABS = { requests: 'requests', wallet: 'wallet' }

export const countOpenRequests = (intents = []) =>
  intents.filter((row) => OPEN_INTENT_STATUSES.includes(row.status)).length

export const floorDollars = (value) => {
  const amount = Number(value)
  if (!Number.isFinite(amount) || amount <= 0) return 0
  return Math.floor(amount)
}

const findByStatus = (intents, status) =>
  intents.find((row) => row.status === status) || null

const investHref = (intent) => {
  const investmentId = intent?.property?.investmentId
  return investmentId ? `/properties/${investmentId}/invest` : '/projects'
}

/**
 * Only surfaced for work that leaves this page: an unconfirmed wire. Anything
 * reachable through the tabs below is not worth a banner.
 */
export const resolveActivityNextAction = ({ intents = [] } = {}) => {
  const awaitingWire = findByStatus(intents, 'AWAITING_WIRE')
  if (!awaitingWire) return null

  return {
    href: investHref(awaitingWire),
    propertyName: awaitingWire.property?.name || '',
  }
}

/** Open work first; otherwise land on the wallet when there is money to move. */
export const resolveDefaultActivityTab = ({ intents = [], wallet = null } = {}) => {
  if (countOpenRequests(intents) > 0) return ACTIVITY_TABS.requests
  if (floorDollars(wallet?.available) > 0) return ACTIVITY_TABS.wallet
  return ACTIVITY_TABS.requests
}
