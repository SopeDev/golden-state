import { getTranslations } from 'next-intl/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from '@/i18n/navigation'
import AdminNav from '../components/AdminNav'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function SchemaPage() {
  const t = await getTranslations('Admin.schema')
  const session = await getServerSession(authOptions)

  if (!session || session.user?.type !== 'ADMIN') {
    await redirect('/')
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
        relations: ['fundingContributions', 'createdContributions', 'depositRequests'],
      },
      {
        name: 'Property',
        description: 'Real estate investment opportunities',
        fields: [
          { name: 'id', type: 'String', description: 'Primary key, CUID' },
          { name: 'investmentId', type: 'Int', description: 'User-facing incremental ID' },
          { name: 'name', type: 'String', description: 'Property name/title' },
          { name: 'slug', type: 'String', description: 'URL-friendly identifier' },
          { name: 'typeId', type: 'String', description: 'Foreign key to PropertyType' },
          { name: 'deletedAt', type: 'DateTime?', description: 'Soft-delete timestamp; null = live' },
          { name: 'city', type: 'String', description: 'Property city' },
          { name: 'state', type: 'String', description: 'Property state' },
          { name: 'address', type: 'String', description: 'Full property address' },
          { name: 'price', type: 'Int', description: 'Investment goal / raise target' },
          { name: 'unitCount', type: 'Int', description: 'Number of units' },
          { name: 'minInvestment', type: 'Int', description: 'Legacy field; always stored as platform minimum ($5,000)' },
          { name: 'estimatedROI', type: 'Float', description: 'Expected return percentage' },
          { name: 'estimatedMonths', type: 'String', description: 'Project timeline display value (e.g. 24-36)' },
          { name: 'summary', type: 'String', description: 'Executive summary' },
          { name: 'propertyFacts', type: 'Json', description: 'Technical property details' },
          { name: 'investmentDetails', type: 'Json', description: 'Funding breakdown' },
          { name: 'images', type: 'String[]', description: 'Array of image URLs' },
          { name: 'status', type: 'PropertyStatus', description: 'Lifecycle: FUNDING → FUNDED → PLANNING → IN_PROGRESS → COMPLETED' },
          { name: 'progressPercent', type: 'Int', description: '0–100 project completion percentage' },
          { name: 'startDate', type: 'DateTime?', description: 'Optional project start date' },
          { name: 'targetCompletionDate', type: 'DateTime?', description: 'Optional target completion date' },
          { name: 'completedAt', type: 'DateTime?', description: 'Optional actual completion date' },
          { name: 'createdAt', type: 'DateTime', description: 'Record creation date' },
          { name: 'updatedAt', type: 'DateTime', description: 'Last update timestamp' },
        ],
        relations: ['propertyType', 'fundingContributions', 'depositRequests'],
      },
      {
        name: 'PropertyType',
        description: 'Property category catalog (soft-deletable, admin-managed)',
        fields: [
          { name: 'id', type: 'String', description: 'Primary key, CUID' },
          { name: 'code', type: 'String', description: 'Stable unique code (e.g. BUILD_TO_SELL)' },
          { name: 'slug', type: 'String', description: 'URL-friendly identifier for /projects/[slug]' },
          { name: 'labelEn', type: 'String', description: 'English display label' },
          { name: 'labelEs', type: 'String', description: 'Spanish display label' },
          { name: 'descriptionEn', type: 'String', description: 'English description' },
          { name: 'descriptionEs', type: 'String', description: 'Spanish description' },
          { name: 'sortOrder', type: 'Int', description: 'Display order' },
          { name: 'deletedAt', type: 'DateTime?', description: 'Soft-delete timestamp; null = active' },
        ],
        relations: ['properties'],
      },
      {
        name: 'FundingContribution',
        description: 'Capital raise ledger event (investor holding or manual amount)',
        fields: [
          { name: 'id', type: 'String', description: 'Primary key, CUID' },
          { name: 'propertyId', type: 'String', description: 'Foreign key to Property' },
          { name: 'userId', type: 'Int?', description: 'Investor user id; null for MANUAL' },
          { name: 'amount', type: 'Float', description: 'Contribution amount' },
          { name: 'source', type: 'FundingContributionSource', description: 'INVESTOR or MANUAL' },
          { name: 'status', type: 'FundingContributionStatus', description: 'ACTIVE or CANCELLED' },
          { name: 'label', type: 'String?', description: 'Required label for MANUAL rows' },
          { name: 'note', type: 'String?', description: 'Optional admin note' },
          { name: 'createdAt', type: 'DateTime', description: 'Event timestamp' },
        ],
        relations: ['user', 'property', 'depositRequest'],
      },
      {
        name: 'DepositRequest',
        description: 'Bank-transfer deposit awaiting admin confirm/reject',
        fields: [
          { name: 'id', type: 'String', description: 'Primary key, CUID' },
          { name: 'userId', type: 'Int', description: 'Investor' },
          { name: 'propertyId', type: 'String', description: 'Property' },
          { name: 'amount', type: 'Float', description: 'Claimed deposit amount' },
          { name: 'reference', type: 'String?', description: 'Bank reference' },
          { name: 'status', type: 'DepositRequestStatus', description: 'PENDING / CONFIRMED / REJECTED' },
        ],
        relations: ['user', 'property', 'contribution'],
      },
    ],
    enums: [
      {
        name: 'UserType',
        values: ['ADMIN', 'INVESTOR'],
      },
      {
        name: 'PropertyStatus',
        values: ['FUNDING', 'FUNDED', 'PLANNING', 'IN_PROGRESS', 'COMPLETED'],
      },
      {
        name: 'FundingContributionSource',
        values: ['INVESTOR', 'MANUAL'],
      },
      {
        name: 'FundingContributionStatus',
        values: ['ACTIVE', 'CANCELLED'],
      },
      {
        name: 'DepositRequestStatus',
        values: ['PENDING', 'CONFIRMED', 'REJECTED'],
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
    <div className="flex-1 bg-background">
      <AdminNav />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">{t('title')}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">{t('subtitle')}</p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">{t('modelsHeading')}</h2>
          <div className="grid gap-6">
            {schema.models.map((model) => (
              <Card key={model.name}>
                <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2 border-b pb-4">
                  <div>
                    <CardTitle className="text-lg">{model.name}</CardTitle>
                    <CardDescription className="mt-1">{model.description}</CardDescription>
                  </div>
                  <span className={modelBadgeClass}>{t('modelBadge')}</span>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="mb-2 font-medium text-foreground">{t('fieldsHeading')}</h4>
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
                      <h4 className="mb-2 font-medium text-foreground">{t('relationsHeading')}</h4>
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
          <h2 className="text-2xl font-semibold text-foreground mb-4">{t('enumsHeading')}</h2>
          <div className="grid gap-4">
            {schema.enums.map((enumItem) => (
              <Card key={enumItem.name}>
                <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2 border-b pb-4">
                  <CardTitle className="text-lg">{enumItem.name}</CardTitle>
                  <span className={enumBadgeClass}>{t('enumBadge')}</span>
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
