/** Categories for private property progress documents (admin upload → investor holders). */
export const PROPERTY_DOCUMENT_KINDS = [
  'CONSTRUCTION_PHOTOS',
  'CONTRACT',
  'FINANCIAL_REPORT',
  'PERMIT',
  'PROGRESS_UPDATE',
  'OTHER',
]

const KIND_SET = new Set(PROPERTY_DOCUMENT_KINDS)

export function isPropertyDocumentKind(value) {
  return KIND_SET.has(value)
}

/** i18n key under PropertyDocuments.kinds.* */
export function getPropertyDocumentKindLabelKey(kind) {
  const map = {
    CONSTRUCTION_PHOTOS: 'constructionPhotos',
    CONTRACT: 'contract',
    FINANCIAL_REPORT: 'financialReport',
    PERMIT: 'permit',
    PROGRESS_UPDATE: 'progressUpdate',
    OTHER: 'other',
  }
  return map[kind] || 'other'
}

/** Fallback when a kind message is missing (should match messages/en.json). */
export const PROPERTY_DOCUMENT_KIND_LABEL_FALLBACK = {
  constructionPhotos: 'Construction / site photos',
  contract: 'Contract / legal',
  financialReport: 'Financial report',
  permit: 'Permit / approval',
  progressUpdate: 'Progress update',
  other: 'Other',
}

/** Resolve a kind label via next-intl `t` scoped to PropertyDocuments (or kinds). */
export function translatePropertyDocumentKind(t, kind) {
  const key = getPropertyDocumentKindLabelKey(kind)
  const nestedKey = `kinds.${key}`
  if (typeof t.has === 'function') {
    if (t.has(nestedKey)) return t(nestedKey)
    if (t.has(key)) return t(key)
  } else {
    try {
      const nested = t(nestedKey)
      if (nested && nested !== nestedKey) return nested
    } catch {
      /* fall through */
    }
    try {
      const direct = t(key)
      if (direct && direct !== key) return direct
    } catch {
      /* fall through */
    }
  }
  return PROPERTY_DOCUMENT_KIND_LABEL_FALLBACK[key] || PROPERTY_DOCUMENT_KIND_LABEL_FALLBACK.other
}

/** Display order for grouped investor panel */
export const PROPERTY_DOCUMENT_KIND_ORDER = [...PROPERTY_DOCUMENT_KINDS]

export const PROPERTY_DOCUMENT_ALLOWED_MIME = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
])

export function propertyDocumentClientUrl(documentId) {
  return `/api/property-documents/${documentId}`
}

export function toClientPropertyDocument(doc) {
  if (!doc) return doc
  return {
    id: doc.id,
    propertyId: doc.propertyId,
    kind: doc.kind,
    fileName: doc.fileName,
    mimeType: doc.mimeType,
    uploadedAt: doc.uploadedAt,
    fileUrl: propertyDocumentClientUrl(doc.id),
  }
}

export function toClientPropertyDocuments(docs) {
  return Array.isArray(docs) ? docs.map(toClientPropertyDocument) : []
}

/** Group docs by kind; within each kind sort uploadedAt desc. */
export function groupPropertyDocumentsByKind(docs) {
  const list = toClientPropertyDocuments(docs)
  const byKind = Object.fromEntries(PROPERTY_DOCUMENT_KIND_ORDER.map((k) => [k, []]))

  for (const doc of list) {
    const kind = isPropertyDocumentKind(doc.kind) ? doc.kind : 'OTHER'
    if (!byKind[kind]) byKind[kind] = []
    byKind[kind].push(doc)
  }

  for (const kind of Object.keys(byKind)) {
    byKind[kind].sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    )
  }

  return PROPERTY_DOCUMENT_KIND_ORDER.filter((kind) => byKind[kind].length > 0).map((kind) => ({
    kind,
    documents: byKind[kind],
  }))
}

export function sanitizeDocumentFileBase(name) {
  return String(name || '')
    .replace(/\.[^/.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}
