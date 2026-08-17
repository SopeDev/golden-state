import LegalDocumentPage from '@/components/Legal/LegalDocumentPage'
import { getLegalMetadata } from '@/lib/legalDocuments'

export async function generateMetadata({ params }) {
  const { locale } = await params
  return getLegalMetadata('cookies', locale)
}

export default async function CookiesPage({ params }) {
  const { locale } = await params
  return <LegalDocumentPage documentId="cookies" locale={locale} />
}
