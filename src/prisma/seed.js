const { PrismaClient } = require('@prisma/client')
const { hash } = require('bcryptjs')

const prisma = new PrismaClient()

/** UTC afternoon so calendar dates stay on the intended day in US Pacific. */
function seedUtcDate(isoDate, hour = 18) {
  return new Date(`${isoDate}T${String(hour).padStart(2, '0')}:00:00.000Z`)
}

function slugifyPropertyName(value) {
  return (
    String(value || '')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'property'
  )
}

function bilingualSummary(text) {
  const value = String(text || '').trim()
  return {
    summary: value,
    summaryEn: value,
    summaryEs: value,
  }
}

const PROPERTY_TYPES = [
  {
    code: 'BUILD_TO_SELL',
    slug: 'build-to-sell',
    labelEn: 'Build to Sell',
    labelEs: 'Construir para Vender',
    descriptionEn: 'Residential developments positioned for disposition and targeted returns.',
    descriptionEs: 'Desarrollos residenciales orientados a la venta y retornos definidos.',
    sortOrder: 1,
  },
  {
    code: 'BUILD_TO_RENT',
    slug: 'build-to-rent',
    labelEn: 'Build to Rent',
    labelEs: 'Construir para Rentar',
    descriptionEn: 'Income-oriented projects designed for long-term rental performance.',
    descriptionEs: 'Proyectos orientados a ingreso y desempeño de renta a largo plazo.',
    sortOrder: 2,
  },
  {
    code: 'FLIPHOUSE',
    slug: 'fliphouses',
    labelEn: 'Fliphouses',
    labelEs: 'Fliphouses',
    descriptionEn: 'Value-add acquisitions and renovations with defined execution timelines.',
    descriptionEs: 'Adquisiciones y remodelaciones con plazos de ejecución definidos.',
    sortOrder: 3,
  },
  {
    code: 'MEX_TO_US',
    slug: 'mex-to-us',
    labelEn: 'MEX to US',
    labelEs: 'MEX a US',
    descriptionEn: 'Cross-border opportunities centered on Mexico-to-United States capital deployment.',
    descriptionEs: 'Oportunidades cross-border centradas en capital de México hacia Estados Unidos.',
    sortOrder: 4,
  },
  {
    code: 'US_TO_MEX',
    slug: 'us-to-mex',
    labelEn: 'US to MEX',
    labelEs: 'US a MEX',
    descriptionEn: 'Cross-border opportunities centered on United States-to-Mexico capital deployment.',
    descriptionEs: 'Oportunidades cross-border centradas en capital de Estados Unidos hacia México.',
    sortOrder: 5,
  },
]

async function ensurePropertyTypes() {
  const typeIdByCode = {}
  for (const type of PROPERTY_TYPES) {
    const record = await prisma.propertyType.upsert({
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
    typeIdByCode[type.code] = record.id
    console.log('✅ Property type ready:', record.code)
  }
  return typeIdByCode
}

async function main() {
  console.log('🌱 Starting database seed...')

  const typeIdByCode = await ensurePropertyTypes()

  // Create admin user with hashed password
  const adminPassword = 'admin'
  const hashedAdminPassword = await hash(adminPassword, 10)
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@goldenstate.com' },
    update: {
      accountStatus: 'ACTIVE',
      emailVerifiedAt: new Date(),
    },
    create: {
      email: 'admin@goldenstate.com',
      password: hashedAdminPassword,
      type: 'ADMIN',
      provider: 'credentials',
      accountStatus: 'ACTIVE',
      emailVerifiedAt: new Date(),
    },
  })

  console.log('✅ Admin user created:', adminUser.email)

  // Create sample investor user
  const investorPassword = 'investor123'
  const hashedInvestorPassword = await hash(investorPassword, 10)
  
  const investorUser = await prisma.user.upsert({
    where: { email: 'investor@example.com' },
    update: {
      accountStatus: 'ACTIVE',
      emailVerifiedAt: new Date(),
      adminApprovedAt: new Date(),
      accreditedStatus: 'APPROVED',
      profile: {
        fullName: 'Sample Investor',
        phone: '+1 619 555 0100',
        location: 'US',
        interestedInInvestorVisa: false,
        investmentGoals: 'Long-term income and appreciation across California and Baja.',
        experience: 'experienced',
        investmentRange: '100k_250k',
        projectTypes: ['BUILD_TO_RENT', 'FLIPHOUSE'],
        referralSource: 'Referral',
        background: 'Seed account for local development.',
        completedAt: new Date().toISOString(),
      },
    },
    create: {
      email: 'investor@example.com',
      password: hashedInvestorPassword,
      type: 'INVESTOR',
      provider: 'credentials',
      accountStatus: 'ACTIVE',
      emailVerifiedAt: new Date(),
      adminApprovedAt: new Date(),
      accreditedStatus: 'APPROVED',
      profile: {
        fullName: 'Sample Investor',
        phone: '+1 619 555 0100',
        location: 'US',
        interestedInInvestorVisa: false,
        investmentGoals: 'Long-term income and appreciation across California and Baja.',
        experience: 'experienced',
        investmentRange: '100k_250k',
        projectTypes: ['BUILD_TO_RENT', 'FLIPHOUSE'],
        referralSource: 'Referral',
        background: 'Seed account for local development.',
        completedAt: new Date().toISOString(),
      },
    },
  })

  console.log('✅ Investor user created:', investorUser.email)

  const sampleInvestorPassword = await hash('investor123', 10)

  const mariaUser = await prisma.user.upsert({
    where: { email: 'maria.investor@example.com' },
    update: {
      accountStatus: 'ACTIVE',
      emailVerifiedAt: new Date(),
      adminApprovedAt: new Date(),
      accreditedStatus: 'APPROVED',
      profile: {
        fullName: 'Maria Santos',
        phone: '+1 619 555 0142',
        location: 'MX',
        interestedInInvestorVisa: true,
        investmentGoals: 'Diversified coastal and hospitality exposure.',
        experience: 'some',
        investmentRange: '250k_500k',
        projectTypes: ['BUILD_TO_RENT', 'US_TO_MEX', 'FLIPHOUSE'],
        referralSource: 'Web search',
        background: 'Seed investor with multi-property holdings.',
        completedAt: new Date().toISOString(),
      },
    },
    create: {
      email: 'maria.investor@example.com',
      password: sampleInvestorPassword,
      type: 'INVESTOR',
      provider: 'credentials',
      accountStatus: 'ACTIVE',
      emailVerifiedAt: new Date(),
      adminApprovedAt: new Date(),
      accreditedStatus: 'APPROVED',
      profile: {
        fullName: 'Maria Santos',
        phone: '+1 619 555 0142',
        location: 'MX',
        interestedInInvestorVisa: true,
        investmentGoals: 'Diversified coastal and hospitality exposure.',
        experience: 'some',
        investmentRange: '250k_500k',
        projectTypes: ['BUILD_TO_RENT', 'US_TO_MEX', 'FLIPHOUSE'],
        referralSource: 'Web search',
        background: 'Seed investor with multi-property holdings.',
        completedAt: new Date().toISOString(),
      },
    },
  })

  console.log('✅ Investor user created:', mariaUser.email)

  const jamesUser = await prisma.user.upsert({
    where: { email: 'james.investor@example.com' },
    update: {
      accountStatus: 'ACTIVE',
      emailVerifiedAt: new Date(),
      adminApprovedAt: new Date(),
      accreditedStatus: 'APPROVED',
      profile: {
        fullName: 'James Okonkwo',
        phone: '+1 858 555 0198',
        location: 'US',
        interestedInInvestorVisa: false,
        investmentGoals: 'Cross-border industrial and build-to-sell projects.',
        experience: 'experienced',
        investmentRange: '500k_plus',
        projectTypes: ['MEX_TO_US', 'BUILD_TO_SELL'],
        referralSource: 'Partner referral',
        background: 'Seed investor focused on corridor and completed exits.',
        completedAt: new Date().toISOString(),
      },
    },
    create: {
      email: 'james.investor@example.com',
      password: sampleInvestorPassword,
      type: 'INVESTOR',
      provider: 'credentials',
      accountStatus: 'ACTIVE',
      emailVerifiedAt: new Date(),
      adminApprovedAt: new Date(),
      accreditedStatus: 'APPROVED',
      profile: {
        fullName: 'James Okonkwo',
        phone: '+1 858 555 0198',
        location: 'US',
        interestedInInvestorVisa: false,
        investmentGoals: 'Cross-border industrial and build-to-sell projects.',
        experience: 'experienced',
        investmentRange: '500k_plus',
        projectTypes: ['MEX_TO_US', 'BUILD_TO_SELL'],
        referralSource: 'Partner referral',
        background: 'Seed investor focused on corridor and completed exits.',
        completedAt: new Date().toISOString(),
      },
    },
  })

  console.log('✅ Investor user created:', jamesUser.email)

  // Create sample properties — capital status is independent of execution:
  // - FUNDING/FUNDED + NONE: raise only
  // - FUNDING + PLANNING / IN_PROGRESS: still raising while construction starts
  // - FUNDED + PLANNING / IN_PROGRESS / COMPLETED
  const properties = [
    {
      investmentId: 1001,
      name: 'Hornblend Street Development',
      typeId: typeIdByCode.BUILD_TO_SELL,
      status: 'FUNDING',
      executionStatus: 'NONE',
      progressPercent: 0,
      startDate: null,
      targetCompletionDate: null,
      completedAt: null,
      city: 'San Diego',
      state: 'CA',
      address: '2741 Hornblend St, San Diego, CA 92109',
      price: 3700000,
      unitCount: 4,
      minInvestment: 5000,
      estimatedROI: 4.5,
      estimatedMonths: '18',
      ...bilingualSummary(
        'Premium residential development in the heart of San Diego. This project features 4 luxury units with modern amenities and stunning ocean views.'
      ),
      propertyFacts: {
        lotSize: '0.25 acres',
        zoning: 'R-2',
        permits: 'In progress',
        constructionType: 'Wood frame',
        parking: '2 spaces per unit'
      },
      investmentDetails: {
        landCost: 1200000,
        constructionCost: 2000000,
        softCosts: 300000,
        contingency: 200000,
        totalBudget: 3700000
      },
      images: [
        '/properties/2741-Hornblend-St-San-Diego-CA-Building-Photo-1-HighDefinition.webp',
        '/properties/2741-Hornblend-St-San-Diego-CA-Building-Photo-2-Large.avif',
        '/properties/2741-Hornblend-St-San-Diego-CA-Building-Photo-3-Large.avif'
      ]
    },
    {
      investmentId: 1002,
      name: 'Downtown LA Mixed-Use',
      typeId: typeIdByCode.BUILD_TO_RENT,
      status: 'FUNDING',
      executionStatus: 'NONE',
      progressPercent: 0,
      startDate: null,
      targetCompletionDate: null,
      completedAt: null,
      city: 'Los Angeles',
      state: 'CA',
      address: '123 Main St, Los Angeles, CA 90012',
      price: 8500000,
      unitCount: 12,
      minInvestment: 5000,
      estimatedROI: 6.2,
      estimatedMonths: '24',
      ...bilingualSummary(
        'Mixed-use development in downtown Los Angeles featuring 12 residential units with ground-floor retail space.'
      ),
      propertyFacts: {
        lotSize: '0.5 acres',
        zoning: 'C-2',
        permits: 'Approved',
        constructionType: 'Steel frame',
        parking: '1.5 spaces per unit'
      },
      investmentDetails: {
        landCost: 3000000,
        constructionCost: 4500000,
        softCosts: 600000,
        contingency: 400000,
        totalBudget: 8500000
      },
      images: [
        '/properties/2741-Hornblend-St-San-Diego-CA-Building-Photo-1-HighDefinition.webp'
      ]
    },
    {
      investmentId: 1003,
      name: 'Pacific Flip — Claremont Villas',
      typeId: typeIdByCode.FLIPHOUSE,
      status: 'FUNDED',
      executionStatus: 'NONE',
      progressPercent: 0,
      startDate: null,
      targetCompletionDate: null,
      completedAt: null,
      city: 'San Diego',
      state: 'CA',
      address: '4100 Clairemont Mesa Blvd, San Diego, CA 92117',
      price: 100000,
      unitCount: 2,
      minInvestment: 5000,
      estimatedROI: 5.8,
      estimatedMonths: '12-18',
      ...bilingualSummary(
        'Strategic flip opportunity with cosmetic renovation scope and defined resale timeline in an established coastal submarket.'
      ),
      propertyFacts: {
        acquisitionPrice: '850000',
        renovationBudget: '425000',
        strategy: 'Core cosmetic + layout optimization',
      },
      investmentDetails: {
        capitalStack: 'Senior debt + LP equity',
        exitType: 'Retail resale',
      },
      images: ['/properties/2741-Hornblend-St-San-Diego-CA-Building-Photo-2-Large.avif'],
    },
    {
      investmentId: 1004,
      name: 'CrossBorder Logistics Park',
      typeId: typeIdByCode.MEX_TO_US,
      status: 'FUNDED',
      executionStatus: 'PLANNING',
      progressPercent: 0,
      startDate: null,
      targetCompletionDate: null,
      completedAt: null,
      city: 'San Diego',
      state: 'CA',
      address: 'Near Otay Mesa POE, CA',
      price: 14200000,
      unitCount: 1,
      minInvestment: 5000,
      estimatedROI: 7.1,
      estimatedMonths: '36-48',
      ...bilingualSummary(
        'Mexico-to-US corridor industrial exposure with phased leasing and hedged FX assumptions. Raise complete; pre-construction planning.'
      ),
      propertyFacts: {
        footprint: '210000 sq ft phase 1',
        corridor: 'Tijuana–San Diego',
      },
      investmentDetails: {
        lender: 'Relationship banks',
        sponsorship: 'Operator JV',
      },
      images: ['/properties/2741-Hornblend-St-San-Diego-CA-Building-Photo-3-Large.avif'],
    },
    {
      investmentId: 1005,
      name: 'Baja Coastal Hospitality Co-Invest',
      typeId: typeIdByCode.US_TO_MEX,
      status: 'FUNDING',
      executionStatus: 'PLANNING',
      progressPercent: 5,
      startDate: new Date('2026-02-01'),
      targetCompletionDate: null,
      completedAt: null,
      city: 'Rosarito',
      state: 'BC',
      address: 'Km 38 Rosarito–Ensenada corridor',
      price: 6800000,
      unitCount: 1,
      minInvestment: 5000,
      estimatedROI: 6.4,
      estimatedMonths: '30-42',
      ...bilingualSummary(
        'US-to-Mexico hospitality repositioning with staged capex and operator-led revenue management. Kickoff dated; target TBD.'
      ),
      propertyFacts: {
        keys: '84 keys',
        flag: 'Independent boutique',
      },
      investmentDetails: {
        capexPlan: 'Phased',
        operator: 'Institutional hospitality PM',
      },
      images: ['/properties/2741-Hornblend-St-San-Diego-CA-Building-Photo-1-HighDefinition.webp'],
    },
    {
      investmentId: 902,
      name: 'Encinitas Coastal Flip Series',
      typeId: typeIdByCode.FLIPHOUSE,
      status: 'FUNDING',
      executionStatus: 'IN_PROGRESS',
      progressPercent: 48,
      startDate: new Date('2025-09-01'),
      targetCompletionDate: new Date('2026-08-01'),
      completedAt: null,
      city: 'Encinitas',
      state: 'CA',
      address: '1480 N Coast Hwy 101, Encinitas, CA 92024',
      price: 1850000,
      unitCount: 1,
      minInvestment: 5000,
      estimatedROI: 14.1,
      estimatedMonths: '11',
      ...bilingualSummary(
        'Cosmetic repositioning of a coastal asset currently under renovation with a scheduled resale exit.'
      ),
      propertyFacts: {
        renovationScope: { en: { label: 'Renovation Scope', value: 'Cosmetic + layout' }, es: { label: 'Alcance de renovación', value: 'Cosmético + distribución' } },
      },
      investmentDetails: {
        exitType: { en: { label: 'Exit', value: 'Retail resale' }, es: { label: 'Salida', value: 'Reventa' } },
      },
      images: ['/properties/2741-Hornblend-St-San-Diego-CA-Building-Photo-3-Large.avif'],
    },
    {
      investmentId: 901,
      name: 'La Jolla Coastal Townhomes',
      typeId: typeIdByCode.BUILD_TO_SELL,
      status: 'FUNDED',
      executionStatus: 'COMPLETED',
      progressPercent: 100,
      startDate: new Date('2023-01-10'),
      targetCompletionDate: null,
      completedAt: new Date('2024-11-15'),
      city: 'La Jolla',
      state: 'CA',
      address: '7200 Fay Ave, La Jolla, CA 92037',
      price: 5400000,
      unitCount: 6,
      minInvestment: 5000,
      estimatedROI: 18.4,
      estimatedMonths: '22',
      ...bilingualSummary(
        'Six-unit luxury townhome development delivered and sold out within four months of completion.'
      ),
      propertyFacts: {
        finalSalePrice: { en: { label: 'Final Sale Price', value: '6,720,000' }, es: { label: 'Precio final de venta', value: '6,720,000' } },
        timeline: { en: { label: 'Total Timeline', value: '22 months' }, es: { label: 'Tiempo total', value: '22 meses' } },
      },
      investmentDetails: {
        netInvestorReturn: { en: { label: 'Net Investor Return', value: '18.4%' }, es: { label: 'Retorno neto al inversor', value: '18.4%' } },
      },
      images: ['/properties/2741-Hornblend-St-San-Diego-CA-Building-Photo-2-Large.avif'],
    },
    {
      investmentId: 903,
      name: 'Tijuana Riverfront Logistics',
      typeId: typeIdByCode.MEX_TO_US,
      status: 'FUNDED',
      executionStatus: 'COMPLETED',
      progressPercent: 100,
      startDate: new Date('2022-03-15'),
      targetCompletionDate: new Date('2024-12-01'),
      completedAt: new Date('2025-01-10'),
      city: 'Tijuana',
      state: 'BC',
      address: 'Zona Río, Tijuana',
      price: 9800000,
      unitCount: 1,
      minInvestment: 5000,
      estimatedROI: 12.7,
      estimatedMonths: '34',
      ...bilingualSummary(
        'Cross-border logistics facility delivered fully leased; long-term anchor tenant secured at delivery.'
      ),
      propertyFacts: {
        anchorLease: { en: { label: 'Anchor Lease', value: '10-year corporate tenant' }, es: { label: 'Contrato ancla', value: 'Inquilino corporativo a 10 años' } },
      },
      investmentDetails: {
        netInvestorReturn: { en: { label: 'Net Investor Return', value: '12.7%' }, es: { label: 'Retorno neto al inversor', value: '12.7%' } },
      },
      images: ['/properties/2741-Hornblend-St-San-Diego-CA-Building-Photo-1-HighDefinition.webp'],
    },
  ]

  for (const propertyData of properties) {
    const slug = slugifyPropertyName(propertyData.name)
    const property = await prisma.property.upsert({
      where: { investmentId: propertyData.investmentId },
      update: { ...propertyData, slug },
      create: { ...propertyData, slug },
    })
    console.log('✅ Property created:', property.name)
  }

  const propertyBySlug = Object.fromEntries(
    (
      await prisma.property.findMany({
        where: { investmentId: { in: properties.map((p) => p.investmentId) } },
        select: { id: true, slug: true },
      })
    ).map((p) => [p.slug, p.id])
  )

  const sampleHoldings = [
    { userId: investorUser.id, slug: 'hornblend-street-development', amount: 75000 },
    { userId: investorUser.id, slug: 'pacific-flip-claremont-villas', amount: 100000 },
    { userId: investorUser.id, slug: 'la-jolla-coastal-townhomes', amount: 60000 },
    { userId: mariaUser.id, slug: 'downtown-la-mixed-use', amount: 150000 },
    { userId: mariaUser.id, slug: 'baja-coastal-hospitality-co-invest', amount: 200000 },
    { userId: mariaUser.id, slug: 'encinitas-coastal-flip-series', amount: 80000 },
  ]

  const jamesDeposits = [
    { slug: 'tijuana-riverfront-logistics', amount: 80000, depositedAt: '2026-01-14', reference: 'GS-JOK-260114' },
    { slug: 'hornblend-street-development', amount: 50000, depositedAt: '2026-03-11', reference: 'GS-JOK-260311' },
    { slug: 'crossborder-logistics-park', amount: 70000, depositedAt: '2026-05-19', reference: 'GS-JOK-260519' },
  ]

  const seedInvestorIds = [investorUser.id, mariaUser.id, jamesUser.id]

  await prisma.fundingContribution.deleteMany({
    where: { userId: { in: seedInvestorIds } },
  })
  await prisma.cashOutRequest.deleteMany({
    where: { userId: { in: seedInvestorIds } },
  })
  await prisma.reinvestRequest.deleteMany({
    where: { userId: { in: seedInvestorIds } },
  })
  await prisma.returnDistribution.deleteMany({
    where: { userId: { in: seedInvestorIds } },
  })
  await prisma.depositRequest.deleteMany({
    where: { userId: { in: seedInvestorIds } },
  })

  async function createSeedHolding({ userId, slug, amount, createdAt, depositRequestId, note, createdByAdminId }) {
    const propertyId = propertyBySlug[slug]
    if (!propertyId) {
      throw new Error(`Missing property for seed holding: ${slug}`)
    }

    const property = await prisma.property.findUnique({ where: { id: propertyId } })
    const fundedAgg = await prisma.fundingContribution.aggregate({
      where: { propertyId, status: 'ACTIVE' },
      _sum: { amount: true },
    })
    const currentFunded = Number(fundedAgg._sum.amount || 0)
    if (currentFunded + amount > property.price + 1e-6) {
      throw new Error(
        `Seed holding would overfund ${slug}: ${currentFunded + amount} > ${property.price}`
      )
    }

    return prisma.fundingContribution.create({
      data: {
        userId,
        propertyId,
        amount,
        source: 'INVESTOR',
        note: note || null,
        createdByAdminId: createdByAdminId || null,
        depositRequestId: depositRequestId || null,
        ...(createdAt ? { createdAt } : {}),
      },
    })
  }

  for (const holding of sampleHoldings) {
    const investment = await createSeedHolding(holding)
    console.log(`✅ Holding: user ${holding.userId} → ${holding.slug} ($${investment.amount})`)
  }

  for (const row of jamesDeposits) {
    const propertyId = propertyBySlug[row.slug]
    if (!propertyId) {
      throw new Error(`Missing property for seed deposit: ${row.slug}`)
    }

    const depositedAt = seedUtcDate(row.depositedAt)
    const submittedAt = seedUtcDate(row.depositedAt, 16)
    submittedAt.setUTCDate(submittedAt.getUTCDate() - 2)
    const reviewedAt = seedUtcDate(row.depositedAt, 20)

    const deposit = await prisma.depositRequest.create({
      data: {
        userId: jamesUser.id,
        propertyId,
        amount: row.amount,
        reference: row.reference,
        depositedAt,
        status: 'CONFIRMED',
        adminNote: 'Seed confirmed wire',
        reviewedAt,
        reviewedById: adminUser.id,
        createdByAdminId: adminUser.id,
        createdAt: submittedAt,
      },
    })

    const investment = await createSeedHolding({
      userId: jamesUser.id,
      slug: row.slug,
      amount: row.amount,
      createdAt: depositedAt,
      depositRequestId: deposit.id,
      note: `Wire ref: ${row.reference}`,
      createdByAdminId: adminUser.id,
    })
    console.log(
      `✅ James deposit: ${row.depositedAt} → ${row.slug} ($${investment.amount}) [${row.reference}]`
    )
  }

  // Auto FUNDING → FUNDED when capital meets goal
  for (const slug of Object.keys(propertyBySlug)) {
    const propertyId = propertyBySlug[slug]
    const property = await prisma.property.findUnique({ where: { id: propertyId } })
    if (!property || (property.status !== 'FUNDING' && property.status !== 'FUNDED')) continue
    const fundedAgg = await prisma.fundingContribution.aggregate({
      where: { propertyId, status: 'ACTIVE' },
      _sum: { amount: true },
    })
    const funded = Number(fundedAgg._sum.amount || 0)
    const fullyFunded = property.price > 0 && funded >= property.price - 1e-6
    if (property.status === 'FUNDING' && fullyFunded) {
      await prisma.property.update({
        where: { id: propertyId },
        data: { status: 'FUNDED' },
      })
      console.log(`✅ Auto-funded status: ${slug}`)
    } else if (property.status === 'FUNDED' && !fullyFunded) {
      await prisma.property.update({
        where: { id: propertyId },
        data: { status: 'FUNDING' },
      })
    }
  }

  const sampleReturns = [
    {
      userId: investorUser.id,
      slug: 'hornblend-street-development',
      amount: 3500,
      concept: 'Q1 distribution',
    },
    {
      userId: investorUser.id,
      slug: 'pacific-flip-claremont-villas',
      amount: 5200,
      concept: 'Sale proceeds share',
    },
    {
      userId: mariaUser.id,
      slug: 'downtown-la-mixed-use',
      amount: 7800,
      concept: 'Q2 dividend',
    },
    {
      userId: jamesUser.id,
      slug: 'tijuana-riverfront-logistics',
      amount: 25000,
      concept: 'Q1 operating distribution',
      distributedAt: '2026-02-20',
    },
    {
      userId: jamesUser.id,
      slug: 'tijuana-riverfront-logistics',
      amount: 40000,
      concept: 'Capital return',
      distributedAt: '2026-04-10',
    },
    {
      userId: jamesUser.id,
      slug: 'hornblend-street-development',
      amount: 18000,
      concept: 'Q1 preferred + catch-up',
      distributedAt: '2026-04-28',
    },
    {
      userId: jamesUser.id,
      slug: 'tijuana-riverfront-logistics',
      amount: 50000,
      concept: 'Sale proceeds share',
      distributedAt: '2026-06-18',
    },
    {
      userId: jamesUser.id,
      slug: 'hornblend-street-development',
      amount: 22000,
      concept: 'Q2 distribution',
      distributedAt: '2026-06-25',
    },
    {
      userId: jamesUser.id,
      slug: 'crossborder-logistics-park',
      amount: 28000,
      concept: 'Lease-up preferred',
      distributedAt: '2026-06-30',
    },
    {
      userId: jamesUser.id,
      slug: 'crossborder-logistics-park',
      amount: 35000,
      concept: 'Q2 operating distribution',
      distributedAt: '2026-07-22',
    },
    {
      userId: jamesUser.id,
      slug: 'tijuana-riverfront-logistics',
      amount: 30000,
      concept: 'Final residual distribution',
      distributedAt: '2026-08-04',
    },
    {
      userId: jamesUser.id,
      slug: 'crossborder-logistics-park',
      amount: 29000,
      concept: 'August preferred',
      distributedAt: '2026-08-06',
    },
    {
      userId: jamesUser.id,
      slug: 'hornblend-street-development',
      amount: 28000,
      concept: 'Q3 distribution',
      distributedAt: '2026-08-07',
    },
  ]

  for (const row of sampleReturns) {
    const propertyId = propertyBySlug[row.slug]
    if (!propertyId) continue
    const distributedAt = row.distributedAt ? seedUtcDate(row.distributedAt) : new Date()
    const created = await prisma.returnDistribution.create({
      data: {
        userId: row.userId,
        propertyId,
        amount: row.amount,
        concept: row.concept,
        createdByAdminId: adminUser.id,
        distributedAt,
        createdAt: distributedAt,
      },
    })
    console.log(
      `✅ Return: user ${row.userId} ← ${row.slug} ($${created.amount})${row.distributedAt ? ` [${row.distributedAt}]` : ''}`
    )
  }

  console.log('\n🎉 Database seeding completed successfully!')
  console.log('\n📋 Login Credentials:')
  console.log('Admin: admin@goldenstate.com / admin')
  console.log('Investor: investor@example.com / investor123')
  console.log('Investor: maria.investor@example.com / investor123')
  console.log('Investor: james.investor@example.com / investor123')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
