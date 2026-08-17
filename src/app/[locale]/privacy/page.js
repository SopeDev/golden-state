import LegalDocumentPage from '@/components/Legal/LegalDocumentPage'
import { getLegalMetadata } from '@/lib/legalDocuments'

export async function generateMetadata({ params }) {
  const { locale } = await params
  return getLegalMetadata('privacy', locale)
}

export default async function PrivacyPage({ params }) {
  const { locale } = await params
  return <LegalDocumentPage documentId="privacy" locale={locale} />
}
