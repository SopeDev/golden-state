import { INVESTOR_DOCUMENT_FIELDS } from '@/lib/investorDocumentFields'

const VALID_KINDS = new Set(INVESTOR_DOCUMENT_FIELDS.map((field) => field.kind))

export function parseResubmitKinds(value) {
  if (!Array.isArray(value)) return []
  return value.filter((kind) => VALID_KINDS.has(kind))
}

export function resubmitKindsToFieldNames(kinds) {
  return parseResubmitKinds(kinds)
    .map((kind) => INVESTOR_DOCUMENT_FIELDS.find((field) => field.kind === kind)?.name)
    .filter(Boolean)
}

export function getFieldLabelKeyForKind(kind) {
  return INVESTOR_DOCUMENT_FIELDS.find((field) => field.kind === kind)?.labelKey
}

const DOCUMENT_EMAIL_LABELS = {
  en: {
    ACCREDITATION: 'Accreditation letter or certification',
    INCOME_PROOF: 'Proof of income',
    NET_WORTH: 'Proof of net worth',
    GOVERNMENT_ID: 'Government ID',
  },
  es: {
    ACCREDITATION: 'Carta o certificación de acreditación',
    INCOME_PROOF: 'Comprobante de ingresos',
    NET_WORTH: 'Comprobante de patrimonio neto',
    GOVERNMENT_ID: 'Identificación oficial',
  },
}

export function getDocumentEmailLabels(kinds, locale = 'en') {
  const labels = DOCUMENT_EMAIL_LABELS[locale === 'es' ? 'es' : 'en']
  return parseResubmitKinds(kinds).map((kind) => labels[kind] || kind)
}
