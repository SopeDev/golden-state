import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { meetingChannelPlainLabel } from '@/lib/investMeetingLinks'
import { hasOperatorPermission, OPERATOR_PERMISSIONS as P } from '@/lib/operatorPermissions'

const prisma = new PrismaClient()
const PREVIEW_LIMIT = 5

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['ADMIN', 'OPERATOR'].includes(session.user?.type)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const canViewInvestors = hasOperatorPermission(session.user, P.VIEW_INVESTORS)
    const canManageInvestments = hasOperatorPermission(session.user, P.MANAGE_INVESTMENT_REQUESTS)
    const canViewFinance = hasOperatorPermission(session.user, P.VIEW_FINANCIAL_ACTIVITY)
    const canNotifyDocuments = hasOperatorPermission(session.user, P.NOTIFY_PROPERTY_INVESTORS)

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
      propertiesPendingDocumentNotification,
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
      prisma.property.findMany({
        where: {
          deletedAt: null,
          documents: { some: {} },
        },
        select: {
          id: true,
          investmentId: true,
          name: true,
          documentsNotifiedAt: true,
          documents: { select: { uploadedAt: true }, orderBy: { uploadedAt: 'desc' } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ])

    const pendingDocumentProperties = propertiesPendingDocumentNotification
      .map((property) => {
        const cutoff = property.documentsNotifiedAt?.getTime() || 0
        const pendingDocuments = property.documents.filter(
          (document) => document.uploadedAt.getTime() > cutoff
        )
        return {
          id: property.id,
          propertyLabel: `#${property.investmentId} · ${property.name}`,
          count: pendingDocuments.length,
          at: pendingDocuments[0]?.uploadedAt || null,
        }
      })
      .filter((property) => property.count > 0)

    const profileName = (profile) => {
      if (!profile || typeof profile !== 'object') return null
      return typeof profile.fullName === 'string' && profile.fullName.trim()
        ? profile.fullName.trim()
        : null
    }

    return NextResponse.json({
      counts: {
        pendingApproval: canViewInvestors ? pendingApprovalCount : 0,
        pendingAccreditation: canViewInvestors ? pendingAccreditationCount : 0,
        meetingRequests: canManageInvestments ? meetingRequestCount : 0,
        pendingDeposits: canViewFinance ? pendingDepositCount : 0,
        pendingCashOuts: canViewFinance ? pendingCashOutCount : 0,
        pendingReinvests: canViewFinance ? pendingReinvestCount : 0,
        pendingDocumentNotifications: canNotifyDocuments ? pendingDocumentProperties.length : 0,
        attentionTotal:
          (canViewInvestors ? pendingApprovalCount + pendingAccreditationCount : 0) +
          (canManageInvestments ? meetingRequestCount : 0) +
          (canViewFinance ? pendingDepositCount + pendingCashOutCount + pendingReinvestCount : 0) +
          (canNotifyDocuments ? pendingDocumentProperties.length : 0),
      },
      queues: {
        pendingApproval: (canViewInvestors ? pendingApprovals : []).map((user) => ({
          id: user.id,
          email: user.email,
          name: profileName(user.profile),
          at: user.createdAt,
        })),
        pendingAccreditation: (canViewInvestors ? pendingAccreditation : []).map((user) => ({
          id: user.id,
          email: user.email,
          name: profileName(user.profile),
          at: user.accreditedSubmittedAt,
        })),
        meetingRequests: (canManageInvestments ? meetingRequests : []).map((row) => ({
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
        pendingDeposits: (canViewFinance ? pendingDeposits : []).map((row) => ({
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
        pendingCashOuts: (canViewFinance ? pendingCashOuts : []).map((row) => ({
          id: row.id,
          email: row.user?.email || null,
          userId: row.user?.id || null,
          amount: row.amount,
          at: row.createdAt,
        })),
        pendingReinvests: (canViewFinance ? pendingReinvests : []).map((row) => ({
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
        pendingDocumentNotifications: canNotifyDocuments
          ? pendingDocumentProperties.slice(0, PREVIEW_LIMIT)
          : [],
      },
    })
  } catch (error) {
    console.error('Admin dashboard summary error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
