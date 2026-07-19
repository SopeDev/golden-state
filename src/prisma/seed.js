const { PrismaClient } = require('@prisma/client')
const { hash } = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

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
        investmentGoals: 'Diversified coastal and hospitality exposure.',
        experience: 'intermediate',
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
        investmentGoals: 'Diversified coastal and hospitality exposure.',
        experience: 'intermediate',
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

  // Create sample properties
  // IN_PROGRESS and COMPLETED projects always include startDate
  const properties = [
    {
      investmentId: 1001,
      name: 'Hornblend Street Development',
      slug: 'hornblend-street-development',
      type: 'BUILD_TO_SELL',
      status: 'IN_PROGRESS',
      progressPercent: 45,
      startDate: new Date('2025-06-01'),
      targetCompletionDate: new Date('2026-12-01'),
      city: 'San Diego',
      state: 'CA',
      address: '2741 Hornblend St, San Diego, CA 92109',
      price: 3700000,
      unitCount: 4,
      minInvestment: 50000,
      estimatedROI: 4.5,
      estimatedMonths: '18',
      summary: 'Premium residential development in the heart of San Diego. This project features 4 luxury units with modern amenities and stunning ocean views.',
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
      slug: 'downtown-la-mixed-use',
      type: 'BUILD_TO_RENT',
      status: 'PLANNING',
      progressPercent: 10,
      targetCompletionDate: new Date('2027-06-01'),
      city: 'Los Angeles',
      state: 'CA',
      address: '123 Main St, Los Angeles, CA 90012',
      price: 8500000,
      unitCount: 12,
      minInvestment: 100000,
      estimatedROI: 6.2,
      estimatedMonths: '24',
      summary: 'Mixed-use development in downtown Los Angeles featuring 12 residential units with ground-floor retail space.',
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
      slug: 'pacific-flip-claremont-villas',
      type: 'FLIPHOUSE',
      status: 'IN_PROGRESS',
      progressPercent: 62,
      startDate: new Date('2025-09-15'),
      targetCompletionDate: new Date('2026-08-01'),
      city: 'San Diego',
      state: 'CA',
      address: '4100 Clairemont Mesa Blvd, San Diego, CA 92117',
      price: 2100000,
      unitCount: 2,
      minInvestment: 75000,
      estimatedROI: 5.8,
      estimatedMonths: '12-18',
      summary:
        'Strategic flip opportunity with cosmetic renovation scope and defined resale timeline in an established coastal submarket.',
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
      slug: 'crossborder-logistics-park-mex-us',
      type: 'MEX_TO_US',
      status: 'IN_PROGRESS',
      progressPercent: 28,
      startDate: new Date('2025-03-01'),
      targetCompletionDate: new Date('2028-03-01'),
      city: 'San Diego',
      state: 'CA',
      address: 'Near Otay Mesa POE, CA',
      price: 14200000,
      unitCount: 1,
      minInvestment: 250000,
      estimatedROI: 7.1,
      estimatedMonths: '36-48',
      summary:
        'Mexico-to-US corridor industrial exposure with phased leasing and hedged FX assumptions.',
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
      slug: 'baja-coastal-hospitality-co-invest',
      type: 'US_TO_MEX',
      status: 'IN_PROGRESS',
      progressPercent: 35,
      startDate: new Date('2025-08-01'),
      targetCompletionDate: new Date('2027-12-01'),
      city: 'Rosarito',
      state: 'BC',
      address: 'Km 38 Rosarito–Ensenada corridor',
      price: 6800000,
      unitCount: 1,
      minInvestment: 150000,
      estimatedROI: 6.4,
      estimatedMonths: '30-42',
      summary:
        'US-to-Mexico hospitality repositioning with staged capex and operator-led revenue management.',
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
      investmentId: 901,
      name: 'La Jolla Coastal Townhomes',
      slug: 'la-jolla-coastal-townhomes',
      type: 'BUILD_TO_SELL',
      status: 'COMPLETED',
      progressPercent: 100,
      startDate: new Date('2023-01-10'),
      targetCompletionDate: new Date('2024-11-01'),
      completedAt: new Date('2024-11-15'),
      city: 'La Jolla',
      state: 'CA',
      address: '7200 Fay Ave, La Jolla, CA 92037',
      price: 5400000,
      unitCount: 6,
      minInvestment: 60000,
      estimatedROI: 18.4,
      estimatedMonths: '22',
      summary:
        'Six-unit luxury townhome development delivered on schedule and sold out within four months of completion.',
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
      investmentId: 902,
      name: 'Encinitas Coastal Flip Series',
      slug: 'encinitas-coastal-flip-series',
      type: 'FLIPHOUSE',
      status: 'COMPLETED',
      progressPercent: 100,
      startDate: new Date('2023-09-01'),
      targetCompletionDate: new Date('2024-08-01'),
      completedAt: new Date('2024-08-20'),
      city: 'Encinitas',
      state: 'CA',
      address: '1480 N Coast Hwy 101, Encinitas, CA 92024',
      price: 1850000,
      unitCount: 1,
      minInvestment: 40000,
      estimatedROI: 14.1,
      estimatedMonths: '11',
      summary:
        'Cosmetic repositioning of a coastal asset with a clean resale exit and tightly managed renovation scope.',
      propertyFacts: {
        renovationScope: { en: { label: 'Renovation Scope', value: 'Cosmetic + layout' }, es: { label: 'Alcance de renovación', value: 'Cosmético + distribución' } },
      },
      investmentDetails: {
        netInvestorReturn: { en: { label: 'Net Investor Return', value: '14.1%' }, es: { label: 'Retorno neto al inversor', value: '14.1%' } },
      },
      images: ['/properties/2741-Hornblend-St-San-Diego-CA-Building-Photo-3-Large.avif'],
    },
    {
      investmentId: 903,
      name: 'Tijuana Riverfront Logistics',
      slug: 'tijuana-riverfront-logistics',
      type: 'MEX_TO_US',
      status: 'COMPLETED',
      progressPercent: 100,
      startDate: new Date('2022-03-15'),
      targetCompletionDate: new Date('2024-12-01'),
      completedAt: new Date('2025-01-10'),
      city: 'Tijuana',
      state: 'BC',
      address: 'Zona Río, Tijuana',
      price: 9800000,
      unitCount: 1,
      minInvestment: 120000,
      estimatedROI: 12.7,
      estimatedMonths: '34',
      summary:
        'Cross-border logistics facility delivered fully leased; long-term anchor tenant secured at delivery.',
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
    const property = await prisma.property.upsert({
      where: { slug: propertyData.slug },
      update: propertyData,
      create: propertyData,
    })
    console.log('✅ Property created:', property.name)
  }

  const propertyBySlug = Object.fromEntries(
    (
      await prisma.property.findMany({
        where: { slug: { in: properties.map((p) => p.slug) } },
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
    { userId: jamesUser.id, slug: 'crossborder-logistics-park-mex-us', amount: 300000 },
    { userId: jamesUser.id, slug: 'hornblend-street-development', amount: 125000 },
    { userId: jamesUser.id, slug: 'tijuana-riverfront-logistics', amount: 180000 },
  ]

  const seedInvestorIds = [investorUser.id, mariaUser.id, jamesUser.id]

  await prisma.investment.deleteMany({
    where: { userId: { in: seedInvestorIds } },
  })

  for (const holding of sampleHoldings) {
    const propertyId = propertyBySlug[holding.slug]
    if (!propertyId) {
      throw new Error(`Missing property for seed holding: ${holding.slug}`)
    }
    const investment = await prisma.investment.create({
      data: {
        userId: holding.userId,
        propertyId,
        amount: holding.amount,
      },
    })
    console.log(`✅ Holding: user ${holding.userId} → ${holding.slug} ($${investment.amount})`)
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
