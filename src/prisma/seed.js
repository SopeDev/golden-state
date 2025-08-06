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
    update: {},
    create: {
      email: 'admin@goldenstate.com',
      password: hashedAdminPassword,
      type: 'ADMIN',
      provider: 'credentials'
    }
  })

  console.log('✅ Admin user created:', adminUser.email)

  // Create sample investor user
  const investorPassword = 'investor123'
  const hashedInvestorPassword = await hash(investorPassword, 10)
  
  const investorUser = await prisma.user.upsert({
    where: { email: 'investor@example.com' },
    update: {},
    create: {
      email: 'investor@example.com',
      password: hashedInvestorPassword,
      type: 'INVESTOR',
      provider: 'credentials'
    }
  })

  console.log('✅ Investor user created:', investorUser.email)

  // Create sample properties
  const properties = [
    {
      investmentId: 1001,
      name: 'Hornblend Street Development',
      slug: 'hornblend-street-development',
      type: 'BUILD_TO_SELL',
      city: 'San Diego',
      state: 'CA',
      address: '2741 Hornblend St, San Diego, CA 92109',
      price: 3700000,
      unitCount: 4,
      minInvestment: 50000,
      estimatedROI: 4.5,
      estimatedMonths: 18,
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
      city: 'Los Angeles',
      state: 'CA',
      address: '123 Main St, Los Angeles, CA 90012',
      price: 8500000,
      unitCount: 12,
      minInvestment: 100000,
      estimatedROI: 6.2,
      estimatedMonths: 24,
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
    }
  ]

  for (const propertyData of properties) {
    const property = await prisma.property.upsert({
      where: { slug: propertyData.slug },
      update: {},
      create: propertyData
    })
    console.log('✅ Property created:', property.name)
  }

  // Create sample investment
  const investment = await prisma.investment.create({
    data: {
      userId: investorUser.id,
      propertyId: (await prisma.property.findFirst({ where: { slug: 'hornblend-street-development' } })).id,
      amount: 75000
    }
  })

  console.log('✅ Sample investment created:', `$${investment.amount}`)

  console.log('\n🎉 Database seeding completed successfully!')
  console.log('\n📋 Login Credentials:')
  console.log('Admin: admin@goldenstate.com / admin')
  console.log('Investor: investor@example.com / investor123')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
