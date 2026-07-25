import { PrismaClient } from '@prisma/client'

const DEFAULT_TYPES = [
  {
    id: 'pt_build_to_sell',
    code: 'BUILD_TO_SELL',
    slug: 'build-to-sell',
    labelEn: 'Build to Sell',
    labelEs: 'Construir para Vender',
    descriptionEn:
      'Residential developments positioned for disposition and targeted returns.',
    descriptionEs:
      'Desarrollos residenciales orientados a la venta y retornos definidos.',
    sortOrder: 1,
  },
  {
    id: 'pt_build_to_rent',
    code: 'BUILD_TO_RENT',
    slug: 'build-to-rent',
    labelEn: 'Build to Rent',
    labelEs: 'Construir para Rentar',
    descriptionEn:
      'Income-oriented projects designed for long-term rental performance.',
    descriptionEs:
      'Proyectos orientados a ingreso y desempeño de renta a largo plazo.',
    sortOrder: 2,
  },
  {
    id: 'pt_fliphouse',
    code: 'FLIPHOUSE',
    slug: 'fliphouses',
    labelEn: 'Fliphouses',
    labelEs: 'Fliphouses',
    descriptionEn:
      'Value-add acquisitions and renovations with defined execution timelines.',
    descriptionEs:
      'Adquisiciones y remodelaciones con plazos de ejecución definidos.',
    sortOrder: 3,
  },
  {
    id: 'pt_mex_to_us',
    code: 'MEX_TO_US',
    slug: 'mex-to-us',
    labelEn: 'MEX to US',
    labelEs: 'MEX a US',
    descriptionEn:
      'Cross-border opportunities centered on Mexico-to-United States capital deployment.',
    descriptionEs:
      'Oportunidades cross-border centradas en capital de México hacia Estados Unidos.',
    sortOrder: 4,
  },
  {
    id: 'pt_us_to_mex',
    code: 'US_TO_MEX',
    slug: 'us-to-mex',
    labelEn: 'US to MEX',
    labelEs: 'US a MEX',
    descriptionEn:
      'Cross-border opportunities centered on United States-to-Mexico capital deployment.',
    descriptionEs:
      'Oportunidades cross-border centradas en capital de Estados Unidos hacia México.',
    sortOrder: 5,
  },
]

export const COMPLETED_PROJECTS_SLUG = 'completed'

export const ACTIVE_PROPERTY_STATUSES = [
  'FUNDING',
  'FUNDED',
  'PLANNING',
  'IN_PROGRESS',
]

export const propertyTypeInclude = {
  propertyType: true,
}

/** Soft-deleted properties are hidden from public / default admin lists. */
export const notDeletedProperty = { deletedAt: null }

export const activePropertyTypeWhere = { deletedAt: null }

export function slugifyPropertyType(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

export function codeFromSlug(slug) {
  const cleaned = slugifyPropertyType(slug).replace(/-/g, '_')
  return cleaned.toUpperCase().slice(0, 60) || 'TYPE'
}

export function toClientPropertyType(type) {
  if (!type) return null
  return {
    id: type.id,
    code: type.code,
    slug: type.slug,
    labelEn: type.labelEn,
    labelEs: type.labelEs,
    descriptionEn: type.descriptionEn || '',
    descriptionEs: type.descriptionEs || '',
    sortOrder: type.sortOrder,
    deletedAt: type.deletedAt,
  }
}

export function getPropertyTypeLabel(type, locale = 'en') {
  if (!type) return '—'
  if (typeof type === 'string') return type
  return locale === 'es' ? type.labelEs || type.labelEn : type.labelEn || type.labelEs
}

export function getPropertyTypeDescription(type, locale = 'en') {
  if (!type || typeof type === 'string') return ''
  return locale === 'es'
    ? type.descriptionEs || type.descriptionEn || ''
    : type.descriptionEn || type.descriptionEs || ''
}

/**
 * Normalize a Property row (with propertyType include) for API/UI.
 * Keeps `type` as the stable code string for backward-compatible consumers.
 */
export function toClientProperty(property) {
  if (!property) return property
  const propertyType = toClientPropertyType(property.propertyType)
  return {
    ...property,
    type: propertyType?.code || property.type || null,
    typeId: property.typeId || propertyType?.id || null,
    propertyType,
  }
}

export function toClientProperties(list) {
  return Array.isArray(list) ? list.map(toClientProperty) : []
}

export async function listActivePropertyTypes(prisma) {
  return prisma.propertyType.findMany({
    where: activePropertyTypeWhere,
    orderBy: [{ sortOrder: 'asc' }, { labelEn: 'asc' }],
  })
}

export async function listAllPropertyTypes(prisma, { includeDeleted = true } = {}) {
  return prisma.propertyType.findMany({
    where: includeDeleted ? undefined : activePropertyTypeWhere,
    orderBy: [{ sortOrder: 'asc' }, { labelEn: 'asc' }],
  })
}

export async function getPropertyTypeBySlug(prisma, slug) {
  if (!slug) return null
  return prisma.propertyType.findFirst({
    where: { slug, deletedAt: null },
  })
}

export async function getPropertyTypeById(prisma, id) {
  if (!id) return null
  return prisma.propertyType.findUnique({ where: { id } })
}

export async function getPropertyTypeByCode(prisma, code) {
  if (!code) return null
  return prisma.propertyType.findUnique({ where: { code } })
}

export async function ensureDefaultPropertyTypes(prisma = new PrismaClient()) {
  for (const type of DEFAULT_TYPES) {
    await prisma.propertyType.upsert({
      where: { code: type.code },
      create: type,
      update: {
        slug: type.slug,
        labelEn: type.labelEn,
        labelEs: type.labelEs,
        descriptionEn: type.descriptionEn,
        descriptionEs: type.descriptionEs,
        sortOrder: type.sortOrder,
      },
    })
  }
  return DEFAULT_TYPES
}

export function isCompletedProjectsSlug(slug) {
  return slug === COMPLETED_PROJECTS_SLUG
}

export { DEFAULT_TYPES as SEED_PROPERTY_TYPES }
