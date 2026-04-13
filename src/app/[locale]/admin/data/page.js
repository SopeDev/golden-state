import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from '@/i18n/navigation'
import { PrismaClient } from '@prisma/client'
import AdminNav from '../components/AdminNav'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const prisma = new PrismaClient()

const badgeClass =
  'inline-flex items-center rounded-md bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground'

export default async function DataPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user?.type !== 'ADMIN') {
    redirect('/')
  }

  try {
    const [properties, users, investments] = await Promise.all([
      prisma.property.findMany({
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.findMany({
        select: {
          id: true,
          email: true,
          type: true,
          provider: true,
          createdAt: true,
          _count: {
            select: { investments: true },
          },
        },
      }),
      prisma.investment.findMany({
        include: {
          user: { select: { email: true } },
          property: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
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
        day: 'numeric',
      })
    }

    return (
      <div className="min-h-screen bg-background">
        <AdminNav />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Database Records</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Live data from the Golden State investment platform database.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Properties ({properties.length})
            </h2>
            <div className="grid gap-4">
              {properties.map((property) => (
                <Card key={property.id}>
                  <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2 border-b pb-4">
                    <div>
                      <CardTitle className="text-lg">{property.name}</CardTitle>
                    </div>
                    <span className={badgeClass}>{property.type}</span>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <p className="font-medium text-foreground">Investment ID</p>
                      <p className="text-muted-foreground">#{property.investmentId}</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Location</p>
                      <p className="text-muted-foreground">
                        {property.city}, {property.state}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Min Investment</p>
                      <p className="text-amber-600 dark:text-amber-400">{formatCurrency(property.minInvestment)}</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Est. ROI</p>
                      <p className="text-amber-600 dark:text-amber-400">{property.estimatedROI}%</p>
                    </div>
                  </CardContent>
                  <div className="px-4 pb-4 text-xs text-muted-foreground">
                    Created: {formatDate(property.createdAt)}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Users ({users.length})</h2>
            <div className="grid gap-4">
              {users.map((user) => (
                <Card key={user.id}>
                  <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2 border-b pb-4">
                    <CardTitle className="text-lg">{user.email}</CardTitle>
                    <span className={badgeClass}>{user.type}</span>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                    <div>
                      <p className="font-medium text-foreground">User ID</p>
                      <p className="text-muted-foreground">#{user.id}</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Provider</p>
                      <p className="text-muted-foreground">{user.provider || 'credentials'}</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Investments</p>
                      <p className="text-amber-600 dark:text-amber-400">{user._count.investments}</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Joined</p>
                      <p className="text-muted-foreground">{formatDate(user.createdAt)}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Investments ({investments.length})
            </h2>
            <div className="grid gap-4">
              {investments.map((investment) => (
                <Card key={investment.id}>
                  <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2 border-b pb-4">
                    <CardTitle className="text-base font-medium leading-snug">
                      {investment.user.email} → {investment.property.name}
                    </CardTitle>
                    <span className={badgeClass}>{formatCurrency(investment.amount)}</span>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                    <div>
                      <p className="font-medium text-foreground">Investment ID</p>
                      <p className="text-muted-foreground">{investment.id}</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Property</p>
                      <p className="text-muted-foreground">{investment.property.name}</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Date</p>
                      <p className="text-muted-foreground">{formatDate(investment.createdAt)}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error fetching data:', error)
    return (
      <div className="min-h-screen bg-background">
        <AdminNav />
        <div className="flex min-h-[60vh] items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Database Error</CardTitle>
              <CardDescription>Unable to fetch database records.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  } finally {
    await prisma.$disconnect()
  }
}
