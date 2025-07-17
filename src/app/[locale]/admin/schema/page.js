import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import AdminNav from '../components/AdminNav'

export default async function SchemaPage() {
  const session = await getServerSession(authOptions)
  
  // Redirect if not authenticated as admin
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
          { name: 'createdAt', type: 'DateTime', description: 'Account creation date' }
        ],
        relations: ['investments']
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
          { name: 'updatedAt', type: 'DateTime', description: 'Last update timestamp' }
        ],
        relations: ['investments']
      },
      {
        name: 'Investment',
        description: 'User investments in properties',
        fields: [
          { name: 'id', type: 'String', description: 'Primary key, CUID' },
          { name: 'userId', type: 'Int', description: 'Foreign key to User' },
          { name: 'propertyId', type: 'String', description: 'Foreign key to Property' },
          { name: 'amount', type: 'Float', description: 'Investment amount' },
          { name: 'createdAt', type: 'DateTime', description: 'Investment date' }
        ],
        relations: ['user', 'property']
      }
    ],
    enums: [
      {
        name: 'UserType',
        values: ['ADMIN', 'INVESTOR']
      },
      {
        name: 'PropertyType',
        values: ['BUILD_TO_SELL', 'BUILD_TO_RENT']
      }
    ]
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <div className="container mx-auto px-4 py-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-main-blue mb-4">Database Schema</h1>
          <p className="text-lg text-main-text max-w-2xl">
            Complete database structure for the Golden State investment platform.
          </p>
        </div>

        {/* Models Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-main-blue mb-4">Database Models</h2>
          <div className="grid gap-6">
            {schema.models.map((model) => (
              <div key={model.name} className="border border-main-blue rounded-xl bg-off-white p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-main-blue">{model.name}</h3>
                  <span className="text-sm text-secondary-blue bg-main-blue text-white px-3 py-1 rounded">
                    Model
                  </span>
                </div>
                <p className="text-main-text mb-4">{model.description}</p>
                
                <div className="mb-4">
                  <h4 className="font-semibold text-main-blue mb-2">Fields:</h4>
                  <div className="grid gap-2">
                    {model.fields.map((field) => (
                      <div key={field.name} className="flex items-center gap-4 p-2 bg-white rounded border">
                        <span className="font-mono text-sm text-main-blue min-w-[120px]">{field.name}</span>
                        <span className="text-sm text-secondary-blue bg-off-white px-2 py-1 rounded">
                          {field.type}
                        </span>
                        <span className="text-sm text-main-text flex-1">{field.description}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {model.relations.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-main-blue mb-2">Relations:</h4>
                    <div className="flex gap-2">
                      {model.relations.map((relation) => (
                        <span key={relation} className="text-sm text-main-gold bg-main-blue text-white px-2 py-1 rounded">
                          {relation}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Enums Section */}
        <div>
          <h2 className="text-2xl font-semibold text-main-blue mb-4">Enums</h2>
          <div className="grid gap-4">
            {schema.enums.map((enumItem) => (
              <div key={enumItem.name} className="border border-main-blue rounded-xl bg-off-white p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-main-blue">{enumItem.name}</h3>
                  <span className="text-sm text-secondary-blue bg-main-blue text-white px-3 py-1 rounded">
                    Enum
                  </span>
                </div>
                <div className="flex gap-2">
                  {enumItem.values.map((value) => (
                    <span key={value} className="text-sm text-main-gold bg-secondary-blue text-white px-3 py-1 rounded">
                      {value}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 