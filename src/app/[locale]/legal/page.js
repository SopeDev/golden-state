import LegalDocumentPage from '@/components/Legal/LegalDocumentPage'
import { getLegalMetadata } from '@/lib/legalDocuments'

export async function generateMetadata({ params }) {
  const { locale } = await params
  return getLegalMetadata('legal', locale)
}

export default async function LegalDisclosuresPage({ params }) {
  const { locale } = await params
  return <LegalDocumentPage documentId="legal" locale={locale} />
}
