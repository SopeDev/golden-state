import LegalDocumentPage from '@/components/Legal/LegalDocumentPage'
import { getLegalMetadata } from '@/lib/legalDocuments'

export async function generateMetadata({ params }) {
  const { locale } = await params
  return getLegalMetadata('aviso', locale)
}

export default async function AvisoDePrivacidadPage({ params }) {
  const { locale } = await params
  return <LegalDocumentPage documentId="aviso" locale={locale} />
}
