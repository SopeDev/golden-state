import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { meetingChannelPlainLabel } from '@/lib/investMeetingLinks'

const prisma = new PrismaClient()
const PREVIEW_LIMIT = 5

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.type !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [
      pendingApprovalCount,
      pendingAccreditationCount,
      meetingRequestCount,
      pendingDepositCount,
      pendingCashOutCount,
      pendingReinvestCount,
      pendingApprovals,
      pendingAccreditation,
      meetingRequests,
      pendingDeposits,
      pendingCashOuts,
      pendingReinvests,
    ] = await Promise.all([
      prisma.user.count({
        where: { type: 'INVESTOR', accountStatus: 'PENDING_ADMIN' },
      }),
      prisma.user.count({
        where: { type: 'INVESTOR', accreditedStatus: 'PENDING_REVIEW' },
      }),
      prisma.investmentIntent.count({
        where: { status: 'MEETING_REQUESTED' },
      }),
      prisma.depositRequest.count({
        where: { status: 'PENDING' },
      }),
      prisma.cashOutRequest.count({
        where: { status: 'PENDING' },
      }),
      prisma.reinvestRequest.count({
        where: { status: 'PENDING' },
      }),
      prisma.user.findMany({
        where: { type: 'INVESTOR', accountStatus: 'PENDING_ADMIN' },
        select: {
          id: true,
          email: true,
          createdAt: true,
          profile: true,
          accreditedSubmittedAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: PREVIEW_LIMIT,
      }),
      prisma.user.findMany({
        where: { type: 'INVESTOR', accreditedStatus: 'PENDING_REVIEW' },
        select: {
          id: true,
          email: true,
          accreditedSubmittedAt: true,
          profile: true,
        },
        orderBy: { accreditedSubmittedAt: 'desc' },
        take: PREVIEW_LIMIT,
      }),
      prisma.investmentIntent.findMany({
        where: { status: 'MEETING_REQUESTED' },
        select: {
          id: true,
          channel: true,
          intendedAmount: true,
          meetingRequestedAt: true,
          updatedAt: true,
          user: { select: { id: true, email: true } },
          property: { select: { id: true, name: true, investmentId: true } },
        },
        orderBy: { meetingRequestedAt: 'desc' },
        take: PREVIEW_LIMIT,
      }),
      prisma.depositRequest.findMany({
        where: { status: 'PENDING' },
        select: {
          id: true,
          amount: true,
          createdAt: true,
          user: { select: { id: true, email: true } },
          property: { select: { id: true, name: true, investmentId: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: PREVIEW_LIMIT,
      }),
      prisma.cashOutRequest.findMany({
        where: { status: 'PENDING' },
        select: {
          id: true,
          amount: true,
          createdAt: true,
          user: { select: { id: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: PREVIEW_LIMIT,
      }),
      prisma.reinvestRequest.findMany({
        where: { status: 'PENDING' },
        select: {
          id: true,
          amount: true,
          createdAt: true,
          user: { select: { id: true, email: true } },
          destinationProperty: { select: { id: true, name: true, investmentId: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: PREVIEW_LIMIT,
      }),
    ])

    const profileName = (profile) => {
      if (!profile || typeof profile !== 'object') return null
      return typeof profile.fullName === 'string' && profile.fullName.trim()
        ? profile.fullName.trim()
        : null
    }

    return NextResponse.json({
      counts: {
        pendingApproval: pendingApprovalCount,
        pendingAccreditation: pendingAccreditationCount,
        meetingRequests: meetingRequestCount,
        pendingDeposits: pendingDepositCount,
        pendingCashOuts: pendingCashOutCount,
        pendingReinvests: pendingReinvestCount,
        attentionTotal:
          pendingApprovalCount +
          pendingAccreditationCount +
          meetingRequestCount +
          pendingDepositCount +
          pendingCashOutCount +
          pendingReinvestCount,
      },
      queues: {
        pendingApproval: pendingApprovals.map((user) => ({
          id: user.id,
          email: user.email,
          name: profileName(user.profile),
          at: user.createdAt,
        })),
        pendingAccreditation: pendingAccreditation.map((user) => ({
          id: user.id,
          email: user.email,
          name: profileName(user.profile),
          at: user.accreditedSubmittedAt,
        })),
        meetingRequests: meetingRequests.map((row) => ({
          id: row.id,
          email: row.user?.email || null,
          userId: row.user?.id || null,
          propertyId: row.property?.id || null,
          propertyLabel: row.property
            ? `#${row.property.investmentId} · ${row.property.name}`
            : null,
          channel: row.channel,
          channelLabel: meetingChannelPlainLabel(row.channel, 'en'),
          amount: row.intendedAmount,
          at: row.meetingRequestedAt || row.updatedAt,
        })),
        pendingDeposits: pendingDeposits.map((row) => ({
          id: row.id,
          email: row.user?.email || null,
          userId: row.user?.id || null,
          propertyId: row.property?.id || null,
          propertyLabel: row.property
            ? `#${row.property.investmentId} · ${row.property.name}`
            : null,
          amount: row.amount,
          at: row.createdAt,
        })),
        pendingCashOuts: pendingCashOuts.map((row) => ({
          id: row.id,
          email: row.user?.email || null,
          userId: row.user?.id || null,
          amount: row.amount,
          at: row.createdAt,
        })),
        pendingReinvests: pendingReinvests.map((row) => ({
          id: row.id,
          email: row.user?.email || null,
          userId: row.user?.id || null,
          propertyId: row.destinationProperty?.id || null,
          propertyLabel: row.destinationProperty
            ? `#${row.destinationProperty.investmentId} · ${row.destinationProperty.name}`
            : null,
          amount: row.amount,
          at: row.createdAt,
        })),
      },
    })
  } catch (error) {
    console.error('Admin dashboard summary error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
