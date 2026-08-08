import {
  getEffectiveMinInvestment,
  getRemainingCapacity,
  getStatedMinInvestment,
  PLATFORM_MIN_INVESTMENT,
} from '@/lib/propertyFunding'

export {
  getEffectiveMinInvestment,
  getRemainingCapacity,
  getStatedMinInvestment,
  PLATFORM_MIN_INVESTMENT,
}

/** Platform-wide minimum intended investment (same for every property) */
export const MIN_INTENDED_INVESTMENT_AMOUNT = PLATFORM_MIN_INVESTMENT

export const INTENT_STATUSES = [
  'STARTED',
  'ACCREDITATION_PENDING',
  'READY',
  'MEETING_REQUESTED',
  'AWAITING_WIRE',
  'COMPLETED',
  'CANCELLED',
]

export {
  MEETING_CHANNELS,
  meetingChannelLabelKey,
  meetingChannelPlainLabel,
} from '@/lib/investMeetingLinks'

/** Investor may confirm a wire only after ops marks the intent awaiting wire */
export const canInvestorSubmitDeposit = (intentStatus) => intentStatus === 'AWAITING_WIRE'

/** Investor may cancel only while waiting for a meeting / ops follow-up */
export const canInvestorCancelMeetingRequest = (intentStatus) =>
  intentStatus === 'MEETING_REQUESTED'

export const investmentIntentInclude = {
  user: { select: { id: true, email: true, accreditedStatus: true, accountStatus: true } },
  property: {
    select: {
      id: true,
      name: true,
      investmentId: true,
      slug: true,
      minInvestment: true,
      price: true,
      status: true,
    },
  },
  depositRequests: {
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      amount: true,
      status: true,
      reference: true,
      createdAt: true,
      receiptFileName: true,
    },
  },
}

export async function markIntentCompleted(prisma, { userId, propertyId }) {
  if (!userId || !propertyId) return null
  return prisma.investmentIntent.updateMany({
    where: {
      userId,
      propertyId,
      status: { notIn: ['CANCELLED', 'COMPLETED'] },
    },
    data: { status: 'COMPLETED' },
  })
}
