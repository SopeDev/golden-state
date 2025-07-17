import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { PrismaClient } from '@prisma/client'
import AdminNav from '../components/AdminNav'

const prisma = new PrismaClient()

export default async function DataPage() {
  const session = await getServerSession(authOptions)
  
  // Redirect if not authenticated as admin
  if (!session || session.user?.type !== 'ADMIN') {
    redirect('/')
  }

  try {
    const [properties, users, investments] = await Promise.all([
      prisma.property.findMany({
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.findMany({
        select: {
          id: true,
          email: true,
          type: true,
          createdAt: true,
          _count: {
            select: { investments: true }
          }
        }
      }),
      prisma.investment.findMany({
        include: {
          user: { select: { email: true } },
          property: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' }
      })
    ])

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount)
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    return (
      <div className="min-h-screen bg-background">
        <AdminNav />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-main-blue mb-4">Database Records</h1>
            <p className="text-lg text-main-text max-w-2xl">
              Live data from the Golden State investment platform database.
            </p>
          </div>

          {/* Properties Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-main-blue mb-4">
              Properties ({properties.length})
            </h2>
            <div className="grid gap-4">
              {properties.map((property) => (
                <div key={property.id} className="border border-main-blue rounded-xl bg-off-white p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-main-blue">{property.name}</h3>
                    <span className="text-sm text-secondary-blue bg-main-blue text-white px-3 py-1 rounded">
                      {property.type}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-semibold text-main-blue">Investment ID:</span>
                      <br />
                      <span className="text-main-text">#{property.investmentId}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-main-blue">Location:</span>
                      <br />
                      <span className="text-main-text">{property.city}, {property.state}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-main-blue">Min Investment:</span>
                      <br />
                      <span className="text-main-gold">{formatCurrency(property.minInvestment)}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-main-blue">Est. ROI:</span>
                      <br />
                      <span className="text-main-gold">{property.estimatedROI}%</span>
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-secondary-blue">
                    Created: {formatDate(property.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Users Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-main-blue mb-4">
              Users ({users.length})
            </h2>
            <div className="grid gap-4">
              {users.map((user) => (
                <div key={user.id} className="border border-main-blue rounded-xl bg-off-white p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-main-blue">{user.email}</h3>
                    <span className="text-sm text-secondary-blue bg-main-blue text-white px-3 py-1 rounded">
                      {user.type}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-semibold text-main-blue">User ID:</span>
                      <br />
                      <span className="text-main-text">#{user.id}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-main-blue">Investments:</span>
                      <br />
                      <span className="text-main-gold">{user._count.investments}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-main-blue">Joined:</span>
                      <br />
                      <span className="text-main-text">{formatDate(user.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Investments Section */}
          <div>
            <h2 className="text-2xl font-semibold text-main-blue mb-4">
              Investments ({investments.length})
            </h2>
            <div className="grid gap-4">
              {investments.map((investment) => (
                <div key={investment.id} className="border border-main-blue rounded-xl bg-off-white p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-main-blue">
                      {investment.user.email} → {investment.property.name}
                    </h3>
                    <span className="text-sm text-main-gold bg-main-blue text-white px-3 py-1 rounded">
                      {formatCurrency(investment.amount)}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-semibold text-main-blue">Investment ID:</span>
                      <br />
                      <span className="text-main-text">{investment.id}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-main-blue">Property:</span>
                      <br />
                      <span className="text-main-text">{investment.property.name}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-main-blue">Date:</span>
                      <br />
                      <span className="text-main-text">{formatDate(investment.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error fetching data:', error)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-main-blue mb-4">Database Error</h1>
          <p className="text-main-text">Unable to fetch database records.</p>
        </div>
      </div>
    )
  } finally {
    await prisma.$disconnect()
  }
} 