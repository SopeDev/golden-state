import { BadgeCheck, Banknote, IdCard, Landmark } from 'lucide-react'

export const INVESTOR_DOCUMENT_FIELDS = [
  {
    name: 'accreditation',
    kind: 'ACCREDITATION',
    labelKey: 'docAccreditation',
    hintKey: 'docAccreditationHint',
    icon: BadgeCheck,
  },
  {
    name: 'income',
    kind: 'INCOME_PROOF',
    labelKey: 'docIncome',
    hintKey: 'docIncomeHint',
    icon: Banknote,
  },
  {
    name: 'netWorth',
    kind: 'NET_WORTH',
    labelKey: 'docNetWorth',
    hintKey: 'docNetWorthHint',
    icon: Landmark,
  },
  {
    name: 'id',
    kind: 'GOVERNMENT_ID',
    labelKey: 'docId',
    hintKey: 'docIdHint',
    icon: IdCard,
  },
]

export const INVESTOR_DOCUMENT_KIND_MAP = Object.fromEntries(
  INVESTOR_DOCUMENT_FIELDS.map(({ name, kind }) => [name, kind])
)
