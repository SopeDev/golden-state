import { avisoContent } from '@/content/legal/aviso'
import { cookiesContent } from '@/content/legal/cookies'
import { disclosuresContent } from '@/content/legal/disclosures'
import { privacyContent } from '@/content/legal/privacy'
import { termsContent } from '@/content/legal/terms'
import { buildPageMetadata } from '@/lib/seo'

export const LEGAL_DOCUMENTS = {
  terms: termsContent,
  privacy: privacyContent,
  aviso: avisoContent,
  legal: disclosuresContent,
  cookies: cookiesContent,
}

export const LEGAL_UI = {
  en: {
    tocTitle: 'On this page',
    relatedTitle: 'Related documents',
    lastUpdatedLabel: 'Last updated',
  },
  es: {
    tocTitle: 'En esta página',
    relatedTitle: 'Documentos relacionados',
    lastUpdatedLabel: 'Última actualización',
  },
}

export const LEGAL_NAV = {
  en: [
    { id: 'terms', href: '/terms', label: 'Terms of Service' },
    { id: 'privacy', href: '/privacy', label: 'Privacy Policy' },
    { id: 'aviso', href: '/aviso-de-privacidad', label: 'Aviso de Privacidad' },
    { id: 'legal', href: '/legal', label: 'Legal Disclosures' },
    { id: 'cookies', href: '/cookies', label: 'Cookie Policy' },
  ],
  es: [
    { id: 'terms', href: '/terms', label: 'Términos de Servicio' },
    { id: 'privacy', href: '/privacy', label: 'Política de Privacidad' },
    { id: 'aviso', href: '/aviso-de-privacidad', label: 'Aviso de Privacidad' },
    { id: 'legal', href: '/legal', label: 'Avisos Legales' },
    { id: 'cookies', href: '/cookies', label: 'Política de Cookies' },
  ],
}

export const getLegalDocument = (id, locale) => {
  const document = LEGAL_DOCUMENTS[id]
  if (!document) return null
  return document[locale] || document.en
}

export const getLegalUi = (locale) => LEGAL_UI[locale] || LEGAL_UI.en

export const getLegalNav = (locale, excludeId) => {
  const items = LEGAL_NAV[locale] || LEGAL_NAV.en
  if (!excludeId) return items
  return items.filter((item) => item.id !== excludeId)
}

export const getLegalMetadata = (id, locale) => {
  const content = getLegalDocument(id, locale)
  if (!content) return {}
  const href = LEGAL_NAV.en.find((item) => item.id === id)?.href || `/${id}`
  return buildPageMetadata({
    locale,
    path: href,
    title: content.metaTitle,
    description: content.metaDescription,
  })
}
