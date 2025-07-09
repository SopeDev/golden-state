import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function getProperties() {
  try {
    const properties = await prisma.property.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
    return properties
  } catch (error) {
    console.error('Error fetching properties:', error)
    return []
  } finally {
    await prisma.$disconnect()
  }
}

export default async function ProjectsPage() {
  const properties = await getProperties()

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getPropertyTypeLabel = (type) => {
    switch (type) {
      case 'BUILD_TO_RENT':
        return 'Build to Rent'
      case 'BUILD_TO_SELL':
        return 'Build to Sell'
      default:
        return type
    }
  }

  return (
    <div className="min-h-screen bg-[--background]">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[--main-blue] mb-4">Our Projects</h1>
          <p className="text-lg text-[--main-text] max-w-2xl">
            Discover our curated selection of premium real estate investment opportunities across California.
          </p>
        </div>

        {properties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[--main-text] text-lg">No projects available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div key={property.id} className="border border-[--main-blue] rounded-xl bg-[--off-white] shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                {property.images && property.images.length > 0 ? (
                  <img 
                    src={property.images[0]} 
                    alt={property.name} 
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-[--secondary-blue] flex items-center justify-center">
                    <span className="text-white text-sm">No Image Available</span>
                  </div>
                )}

                <div className="p-4 text-[--main-text]">
                  <h2 className="text-xl font-semibold text-[--main-blue]">{property.name}</h2>
                  <p className="text-sm mb-1 text-[--secondary-blue]">{getPropertyTypeLabel(property.type)}</p>
                  <p className="text-sm">Min Investment: <span className="font-medium text-[--main-gold]">{formatCurrency(property.minInvestment)}</span></p>
                  <p className="text-sm">Timeframe: <span className="text-[--main-gold]">{property.estimatedMonths} months</span></p>
                  <p className="text-sm mb-4">Est. ROI: <span className="font-semibold text-[--main-gold]">{property.estimatedROI}%</span></p>

                  <button className="bg-[--main-blue] hover:bg-[--secondary-blue] text-white text-sm py-2 px-4 rounded transition-colors duration-200">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 