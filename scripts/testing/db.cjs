const crypto = require('node:crypto')
const { PrismaClient } = require('@prisma/client')
const { hash } = require('bcryptjs')

let prisma
let counter = 0

function testDatabaseUrl() {
  const value = process.env.TEST_DATABASE_URL?.trim()
  if (!value) {
    throw new Error(
      'TEST_DATABASE_URL is required. The automation harness will not use DATABASE_URL.'
    )
  }
  return value
}

function assertSafeUrl(value) {
  const parsed = new URL(value)
  const marker = `${parsed.hostname}/${parsed.pathname}`.toLowerCase()
  if (!/(test|e2e|ci)/.test(marker)) {
    throw new Error(
      'Refusing database operation: TEST_DATABASE_URL host or database name must contain test, e2e, or ci.'
    )
  }
}

function client() {
  const url = testDatabaseUrl()
  assertSafeUrl(url)
  if (!prisma) prisma = new PrismaClient({ datasources: { db: { url } } })
  return prisma
}

function unique(prefix) {
  counter += 1
  return `${prefix}-${process.pid}-${Date.now()}-${counter}-${crypto.randomBytes(2).toString('hex')}`
}

async function assertSafeTestDatabase() {
  const url = testDatabaseUrl()
  assertSafeUrl(url)
  return true
}

async function resetTestData() {
  const db = client()
  await db.$transaction([
    db.user.updateMany({ data: { adminApprovedById: null } }),
    db.investorUpdate.deleteMany(),
    db.fundingContribution.deleteMany(),
    db.depositRequest.deleteMany(),
    db.cashOutRequest.deleteMany(),
    db.reinvestRequest.deleteMany(),
    db.returnDistribution.deleteMany(),
    db.propertyDocument.deleteMany(),
    db.investorDocument.deleteMany(),
    db.investmentIntent.deleteMany(),
    db.property.deleteMany(),
    db.propertyType.deleteMany(),
    db.pageContent.deleteMany(),
    db.user.deleteMany(),
  ])
  return null
}

function completedProfile(name = 'E2E Investor') {
  return {
    fullName: name,
    phone: '+16195550100',
    location: 'US',
    interestedInInvestorVisa: false,
    investmentGoals: 'Long-term income',
    experience: 'experienced',
    investmentRange: '100k_250k',
    projectTypes: ['BUILD_TO_RENT'],
    referralSource: 'Automated test',
    background: 'Isolated E2E fixture',
    locale: 'en',
    completedAt: '2026-01-15T18:00:00.000Z',
  }
}

async function createUser(db, options = {}) {
  const role = options.role || 'INVESTOR'
  const password = options.password || 'E2e-password-123!'
  const accountStatus = options.accountStatus || 'ACTIVE'
  const profileComplete = options.profileComplete ?? accountStatus !== 'PENDING_EMAIL'
  const emailVerified = options.emailVerified ?? accountStatus !== 'PENDING_EMAIL'
  const email = options.email || `${unique(role.toLowerCase())}@e2e.invalid`
  const row = await db.user.create({
    data: {
      email,
      password: await hash(password, 4),
      type: role,
      provider: 'credentials',
      accountStatus,
      accreditedStatus: options.accreditedStatus || 'NOT_STARTED',
      emailVerifiedAt: emailVerified ? new Date('2026-01-15T18:00:00.000Z') : null,
      adminApprovedAt: accountStatus === 'ACTIVE' ? new Date('2026-01-15T18:00:00.000Z') : null,
      profile: profileComplete ? completedProfile(options.name) : undefined,
      operatorPermissions: options.permissions || [],
      sessionEpoch: options.sessionEpoch || 0,
    },
  })
  return { ...row, password }
}

async function createProperty(db, options = {}) {
  const key = unique('property')
  const type = await db.propertyType.create({
    data: {
      code: unique('TYPE').toUpperCase().replace(/-/g, '_'),
      slug: `${key}-type`,
      labelEn: 'E2E Property Type',
      labelEs: 'Tipo de propiedad E2E',
    },
  })
  return db.property.create({
    data: {
      name: options.name || 'E2E Funding Property',
      slug: key,
      typeId: type.id,
      city: 'San Diego',
      state: 'CA',
      address: '100 Test Avenue',
      price: options.price ?? 100000,
      unitCount: 4,
      minInvestment: options.minInvestment ?? 10000,
      estimatedROI: 12,
      estimatedMonths: '18',
      summary: 'E2E property',
      summaryEn: 'E2E property',
      summaryEs: 'Propiedad E2E',
      propertyFacts: {},
      investmentDetails: {},
      images: [],
      status: options.status || 'FUNDING',
    },
  })
}

async function addContribution(db, { userId, propertyId, amount, source = 'INVESTOR' }) {
  return db.fundingContribution.create({
    data: {
      userId: source === 'INVESTOR' ? userId : null,
      propertyId,
      amount,
      source,
      label: source === 'MANUAL' ? 'E2E manual capital' : null,
    },
  })
}

async function baseActors(db) {
  const admin = await createUser(db, { role: 'ADMIN', accreditedStatus: 'APPROVED' })
  const investor = await createUser(db, { accreditedStatus: 'APPROVED' })
  return { admin, investor }
}

async function createScenario({ name, overrides = {} }) {
  const db = client()
  switch (name) {
    case 'actors':
      return baseActors(db)
    case 'operatorAuthorization': {
      const actors = await baseActors(db)
      const operator = await createUser(db, {
        role: 'OPERATOR',
        permissions: overrides.permissions || [],
      })
      return { ...actors, operator }
    }
    case 'openProperty': {
      const actors = await baseActors(db)
      const property = await createProperty(db, overrides.property)
      return { ...actors, property }
    }
    case 'wallet': {
      const actors = await baseActors(db)
      const property = await createProperty(db, overrides.property)
      await addContribution(db, {
        userId: actors.investor.id,
        propertyId: property.id,
        amount: overrides.investedAmount || 20000,
      })
      const distribution = await db.returnDistribution.create({
        data: {
          userId: actors.investor.id,
          propertyId: property.id,
          amount: overrides.returnAmount || 1000,
          createdByAdminId: actors.admin.id,
        },
      })
      return { ...actors, property, distribution }
    }
    default:
      throw new Error(`Unknown test scenario: ${name}`)
  }
}

async function inspectTestData({ model, where = {} }) {
  const allowed = new Set([
    'user',
    'investmentIntent',
    'depositRequest',
    'fundingContribution',
    'returnDistribution',
    'cashOutRequest',
    'reinvestRequest',
  ])
  if (!allowed.has(model)) throw new Error(`Inspection not allowed for model: ${model}`)
  return client()[model].findMany({ where })
}

module.exports = {
  assertSafeTestDatabase,
  createScenario,
  inspectTestData,
  resetTestData,
}
