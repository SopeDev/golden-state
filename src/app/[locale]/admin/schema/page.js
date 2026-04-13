import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from '@/i18n/navigation'
import AdminNav from '../components/AdminNav'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function SchemaPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user?.type !== 'ADMIN') {
    redirect('/')
  }

  const schema = {
    models: [
      {
        name: 'User',
        description: 'User accounts and authentication',
        fields: [
          { name: 'id', type: 'Int', description: 'Primary key, auto-increment' },
          { name: 'email', type: 'String', description: 'Unique email address' },
          { name: 'password', type: 'String', description: 'Hashed password' },
          { name: 'type', type: 'UserType', description: 'ADMIN or INVESTOR' },
          { name: 'createdAt', type: 'DateTime', description: 'Account creation date' },
        ],
        relations: ['investments'],
      },
      {
        name: 'Property',
        description: 'Real estate investment opportunities',
        fields: [
          { name: 'id', type: 'String', description: 'Primary key, CUID' },
          { name: 'investmentId', type: 'Int', description: 'User-facing incremental ID' },
          { name: 'name', type: 'String', description: 'Property name/title' },
          { name: 'slug', type: 'String', description: 'URL-friendly identifier' },
          { name: 'type', type: 'PropertyType', description: 'BUILD_TO_SELL or BUILD_TO_RENT' },
          { name: 'city', type: 'String', description: 'Property city' },
          { name: 'state', type: 'String', description: 'Property state' },
          { name: 'address', type: 'String', description: 'Full property address' },
          { name: 'price', type: 'Int', description: 'Total project cost in cents' },
          { name: 'unitCount', type: 'Int', description: 'Number of units' },
          { name: 'minInvestment', type: 'Int', description: 'Minimum investment amount' },
          { name: 'estimatedROI', type: 'Float', description: 'Expected return percentage' },
          { name: 'estimatedMonths', type: 'Int', description: 'Project timeline in months' },
          { name: 'summary', type: 'String', description: 'Executive summary' },
          { name: 'propertyFacts', type: 'Json', description: 'Technical property details' },
          { name: 'investmentDetails', type: 'Json', description: 'Funding breakdown' },
          { name: 'images', type: 'String[]', description: 'Array of image URLs' },
          { name: 'createdAt', type: 'DateTime', description: 'Record creation date' },
          { name: 'updatedAt', type: 'DateTime', description: 'Last update timestamp' },
        ],
        relations: ['investments'],
      },
      {
        name: 'Investment',
        description: 'User investments in properties',
        fields: [
          { name: 'id', type: 'String', description: 'Primary key, CUID' },
          { name: 'userId', type: 'Int', description: 'Foreign key to User' },
          { name: 'propertyId', type: 'String', description: 'Foreign key to Property' },
          { name: 'amount', type: 'Float', description: 'Investment amount' },
          { name: 'createdAt', type: 'DateTime', description: 'Investment date' },
        ],
        relations: ['user', 'property'],
      },
    ],
    enums: [
      {
        name: 'UserType',
        values: ['ADMIN', 'INVESTOR'],
      },
      {
        name: 'PropertyType',
        values: ['BUILD_TO_SELL', 'BUILD_TO_RENT'],
      },
    ],
  }

  const modelBadgeClass =
    'inline-flex items-center rounded-md bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground'
  const enumBadgeClass =
    'inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground'
  const fieldTypeClass =
    'inline-flex shrink-0 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground'
  const relationChipClass =
    'inline-flex items-center rounded-md bg-primary/90 px-2 py-0.5 text-xs font-medium text-primary-foreground'
  const enumValueClass =
    'inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground'

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Database Schema</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Complete database structure for the Golden State investment platform.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Database Models</h2>
          <div className="grid gap-6">
            {schema.models.map((model) => (
              <Card key={model.name}>
                <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2 border-b pb-4">
                  <div>
                    <CardTitle className="text-lg">{model.name}</CardTitle>
                    <CardDescription className="mt-1">{model.description}</CardDescription>
                  </div>
                  <span className={modelBadgeClass}>Model</span>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="mb-2 font-medium text-foreground">Fields</h4>
                    <div className="grid gap-2">
                      {model.fields.map((field) => (
                        <div
                          key={field.name}
                          className="flex flex-col gap-2 rounded-lg border border-border bg-muted/30 p-3 sm:flex-row sm:items-center sm:gap-4"
                        >
                          <span className="min-w-[120px] font-mono text-sm text-foreground">{field.name}</span>
                          <span className={fieldTypeClass}>{field.type}</span>
                          <span className="flex-1 text-sm text-muted-foreground">{field.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {model.relations.length > 0 && (
                    <div>
                      <h4 className="mb-2 font-medium text-foreground">Relations</h4>
                      <div className="flex flex-wrap gap-2">
                        {model.relations.map((relation) => (
                          <span key={relation} className={relationChipClass}>
                            {relation}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Enums</h2>
          <div className="grid gap-4">
            {schema.enums.map((enumItem) => (
              <Card key={enumItem.name}>
                <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2 border-b pb-4">
                  <CardTitle className="text-lg">{enumItem.name}</CardTitle>
                  <span className={enumBadgeClass}>Enum</span>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {enumItem.values.map((value) => (
                      <span key={value} className={enumValueClass}>
                        {value}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
