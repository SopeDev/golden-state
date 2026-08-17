import LegalDocumentPage from '@/components/Legal/LegalDocumentPage'
import { getLegalMetadata } from '@/lib/legalDocuments'

export async function generateMetadata({ params }) {
  const { locale } = await params
  return getLegalMetadata('terms', locale)
}

export default async function TermsPage({ params }) {
  const { locale } = await params
  return <LegalDocumentPage documentId="terms" locale={locale} />
}
