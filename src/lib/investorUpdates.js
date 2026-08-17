import {
  sendPropertyDocumentsUpdateEmail,
  sendPropertyStatusUpdateEmail,
} from '@/lib/email/mailer'
import { investorAppLinks } from '@/lib/email/appLinks'
import { sendSafely } from '@/lib/email/sendSafely'
import { resolveUserLocale } from '@/lib/auth/userLocale'
import { normalizePropertyLifecycle } from '@/lib/propertyStatusUi'
import { syncPropertyFundingStatus } from '@/lib/propertyFunding'
import {
  INVESTOR_UPDATE_TYPES,
  INVESTOR_UPDATES_CHANGED_EVENT,
} from '@/lib/investorUpdateConstants'

export { INVESTOR_UPDATE_TYPES, INVESTOR_UPDATES_CHANGED_EVENT }

const LIFECYCLE_LABELS = {
  en: {
    FUNDING: 'Funding',
    FUNDED: 'Funded',
    NONE: 'Not started',
    PLANNING: 'Planning',
    IN_PROGRESS: 'In progress',
    COMPLETED: 'Completed',
  },
  es: {
    FUNDING: 'En fondeo',
    FUNDED: 'Fondeado',
    NONE: 'Sin iniciar',
    PLANNING: 'Planeación',
    IN_PROGRESS: 'En curso',
    COMPLETED: 'Completado',
  },
}

const DOCUMENT_KIND_LABELS = {
  en: {
    CONSTRUCTION_PHOTOS: 'Construction / site photos',
    CONTRACT: 'Contract / legal',
    FINANCIAL_REPORT: 'Financial report',
    PERMIT: 'Permit / approval',
    PROGRESS_UPDATE: 'Progress update',
    OTHER: 'Other',
  },
  es: {
    CONSTRUCTION_PHOTOS: 'Fotos de obra / sitio',
    CONTRACT: 'Contrato / legal',
    FINANCIAL_REPORT: 'Reporte financiero',
    PERMIT: 'Permiso / autorización',
    PROGRESS_UPDATE: 'Actualización de avance',
    OTHER: 'Otro',
  },
}

export function lifecycleFingerprint(property) {
  const { fundingStatus, executionStatus } = normalizePropertyLifecycle(property || {})
  return `${fundingStatus}:${executionStatus}`
}

export function investorFacingLifecycle(property) {
  const { fundingStatus, executionStatus } = normalizePropertyLifecycle(property || {})
  return executionStatus !== 'NONE' ? executionStatus : fundingStatus
}

export function lifecycleLabel(status, locale) {
  const table = locale === 'es' ? LIFECYCLE_LABELS.es : LIFECYCLE_LABELS.en
  return table[status] || status
}

export function documentKindLabel(kind, locale) {
  const table = locale === 'es' ? DOCUMENT_KIND_LABELS.es : DOCUMENT_KIND_LABELS.en
  return table[kind] || table.OTHER
}

export function investorUpdateHref(propertyId) {
  if (!propertyId) return '/dashboard/portfolio'
  return `/dashboard/portfolio/${propertyId}/documents`
}

export function unannouncedDocumentsWhere(propertyId, documentsNotifiedAt) {
  return {
    propertyId,
    ...(documentsNotifiedAt ? { uploadedAt: { gt: documentsNotifiedAt } } : {}),
  }
}

export async function findPropertyHolderUsers(prisma, propertyId) {
  const rows = await prisma.fundingContribution.findMany({
    where: {
      propertyId,
      source: 'INVESTOR',
      status: 'ACTIVE',
      userId: { not: null },
    },
    distinct: ['userId'],
    select: {
      user: {
        select: {
          id: true,
          email: true,
          type: true,
          profile: true,
        },
      },
    },
  })

  return rows
    .map((row) => row.user)
    .filter((user) => user && user.type === 'INVESTOR')
}

async function notifyHolders(prisma, { property, type, payload, sendEmail }) {
  const holders = await findPropertyHolderUsers(prisma, property.id)
  if (!holders.length) {
    return { notified: 0, holderCount: 0 }
  }

  await prisma.investorUpdate.createMany({
    data: holders.map((user) => ({
      userId: user.id,
      propertyId: property.id,
      type,
      payload,
    })),
  })

  await Promise.all(
    holders.map((user) => {
      if (!user.email) return null
      const locale = resolveUserLocale(user)
      return sendSafely(`Investor update ${type}`, () =>
        sendEmail({ user, locale })
      )
    })
  )

  return { notified: holders.length, holderCount: holders.length }
}

export async function notifyIfPropertyLifecycleChanged(prisma, previous, next) {
  try {
    if (!previous || !next) return { notified: 0, holderCount: 0 }
    if (lifecycleFingerprint(previous) === lifecycleFingerprint(next)) {
      return { notified: 0, holderCount: 0 }
    }

    const previousLifecycle = normalizePropertyLifecycle(previous)
    const nextLifecycle = normalizePropertyLifecycle(next)
    const progressPercent = Number(next.progressPercent) || 0
    const payload = {
      propertyName: next.name,
      previousFundingStatus: previousLifecycle.fundingStatus,
      previousExecutionStatus: previousLifecycle.executionStatus,
      fundingStatus: nextLifecycle.fundingStatus,
      executionStatus: nextLifecycle.executionStatus,
      previousStatus: investorFacingLifecycle(previous),
      status: investorFacingLifecycle(next),
      progressPercent,
    }

    return await notifyHolders(prisma, {
      property: next,
      type: INVESTOR_UPDATE_TYPES.PROPERTY_STATUS,
      payload,
      sendEmail: ({ user, locale }) => {
        const links = investorAppLinks(locale)
        return sendPropertyStatusUpdateEmail({
          to: user.email,
          locale,
          propertyName: next.name,
          fromLabel: lifecycleLabel(payload.previousStatus, locale),
          toLabel: lifecycleLabel(payload.status, locale),
          progressPercent,
          documentsLink: links.propertyDocuments(next.id),
        })
      },
    })
  } catch (error) {
    console.error('Holder lifecycle notify failed:', error)
    return { notified: 0, holderCount: 0 }
  }
}

export async function syncPropertyFundingStatusWithHolderNotify(prisma, propertyId) {
  const before = await prisma.property.findUnique({ where: { id: propertyId } })
  const after = await syncPropertyFundingStatus(prisma, propertyId)
  await notifyIfPropertyLifecycleChanged(prisma, before, after)
  return after
}

export async function countUnannouncedDocuments(prisma, property) {
  if (!property?.id) return 0
  return prisma.propertyDocument.count({
    where: unannouncedDocumentsWhere(property.id, property.documentsNotifiedAt),
  })
}

export async function notifyHoldersOfNewDocuments(prisma, propertyId) {
  const property = await prisma.property.findUnique({ where: { id: propertyId } })
  if (!property) {
    const err = new Error('Property not found')
    err.code = 'NOT_FOUND'
    throw err
  }

  const docs = await prisma.propertyDocument.findMany({
    where: unannouncedDocumentsWhere(property.id, property.documentsNotifiedAt),
    select: { id: true, kind: true },
  })

  if (!docs.length) {
    return { notified: 0, holderCount: 0, documentCount: 0, skipped: true }
  }

  const kinds = [...new Set(docs.map((doc) => doc.kind))]
  const progressPercent = Number(property.progressPercent) || 0
  const payload = {
    propertyName: property.name,
    documentCount: docs.length,
    kinds,
    progressPercent,
  }

  const result = await notifyHolders(prisma, {
    property,
    type: INVESTOR_UPDATE_TYPES.PROPERTY_DOCUMENTS,
    payload,
    sendEmail: ({ user, locale }) => {
      const links = investorAppLinks(locale)
      return sendPropertyDocumentsUpdateEmail({
        to: user.email,
        locale,
        propertyName: property.name,
        documentCount: docs.length,
        kindLabels: kinds.map((kind) => documentKindLabel(kind, locale)),
        progressPercent,
        documentsLink: links.propertyDocuments(property.id),
      })
    },
  })

  await prisma.property.update({
    where: { id: propertyId },
    data: { documentsNotifiedAt: new Date() },
  })

  return { ...result, documentCount: docs.length, skipped: false }
}

export function serializeInvestorUpdate(row) {
  const payload = row.payload && typeof row.payload === 'object' ? row.payload : {}
  return {
    id: row.id,
    type: row.type,
    propertyId: row.propertyId,
    propertyName: row.property?.name || payload.propertyName || '',
    payload,
    readAt: row.readAt,
    createdAt: row.createdAt,
    href: investorUpdateHref(row.propertyId),
  }
}
