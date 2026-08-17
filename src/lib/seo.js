import { getPathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { getAppBaseUrl } from '@/lib/email/appLinks'

export const SITE_NAME = 'Golden State Capital Management'
export const SITE_SHORT_NAME = 'Golden State Capital'
export const DEFAULT_DESCRIPTION =
  'Premium California real estate investment opportunities from Golden State Capital Management.'
export const PUBLIC_SITE_URL = 'https://goldenstatecapitalmgt.com'

const OG_LOCALE = {

const OG_LOCALE = {
  en: 'en_US',
  es: 'es_MX',
}

export const PUBLIC_SITEMAP_PATHS = [
  { href: '/', changeFrequency: 'weekly', priority: 1 },
  { href: '/about', changeFrequency: 'monthly', priority: 0.8 },
  { href: '/projects', changeFrequency: 'weekly', priority: 0.9 },
  { href: '/projects/completed', changeFrequency: 'weekly', priority: 0.7 },
  { href: '/faq', changeFrequency: 'monthly', priority: 0.6 },
  { href: '/contact', changeFrequency: 'monthly', priority: 0.6 },
  { href: '/work-with-us', changeFrequency: 'monthly', priority: 0.5 },
  { href: '/register', changeFrequency: 'monthly', priority: 0.5 },
  { href: '/terms', changeFrequency: 'yearly', priority: 0.3 },
  { href: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
  { href: '/aviso-de-privacidad', changeFrequency: 'yearly', priority: 0.3 },
  { href: '/legal', changeFrequency: 'yearly', priority: 0.3 },
  { href: '/cookies', changeFrequency: 'yearly', priority: 0.3 },
]

export const getSiteUrl = () => {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || PUBLIC_SITE_URL || getAppBaseUrl()
  return String(raw || 'http://localhost:3000').replace(/\/$/, '')
}

export const toAbsoluteUrl = (path) => {
  if (!path) return undefined
  const value = String(path).trim()
  if (!value) return undefined
  if (value.startsWith('http://') || value.startsWith('https://')) return value
  return `${getSiteUrl()}${value.startsWith('/') ? value : `/${value}`}`
}

export const getLocalizedPathname = (locale, href = '/') => {
  try {
    const resolved = getPathname({ locale, href })
    if (typeof resolved === 'string' && resolved.length > 0) return resolved
  } catch {
    // Fall through to a locale-prefixed path.
  }

  const normalized = href === '/' ? '' : href.startsWith('/') ? href : `/${href}`
  return `/${locale}${normalized}`
}

export const getLocalizedUrl = (locale, href = '/') => {
  return `${getSiteUrl()}${getLocalizedPathname(locale, href)}`
}

export const getLanguageAlternates = (href = '/') => {
  const languages = {}
  routing.locales.forEach((locale) => {
    languages[locale] = getLocalizedUrl(locale, href)
  })
  languages['x-default'] = getLocalizedUrl(routing.defaultLocale, href)
  return languages
}

export const ogLocaleFor = (locale) => OG_LOCALE[locale] || OG_LOCALE.en

export const buildSitemapEntry = (href, extras = {}) => ({
  url: getLocalizedUrl(routing.defaultLocale, href),
  lastModified: extras.lastModified || new Date(),
  changeFrequency: extras.changeFrequency,
  priority: extras.priority,
  alternates: { languages: getLanguageAlternates(href) },
})

export const buildPageMetadata = ({
  locale,
  path,
  title,
  description,
  image,
  imageAlt,
  noIndex = false,
  type = 'website',
}) => {
  const canonical = getLocalizedUrl(locale, path)
  const ogImage = toAbsoluteUrl(image)
  const resolvedTitle = title || SITE_SHORT_NAME
  const resolvedDescription = description || DEFAULT_DESCRIPTION

  return {
    title: resolvedTitle,
    description: resolvedDescription,
    alternates: {
      canonical,
      languages: getLanguageAlternates(path),
    },
    openGraph: {
      title: resolvedTitle,
      description: resolvedDescription,
      url: canonical,
      siteName: SITE_NAME,
      locale: ogLocaleFor(locale),
      alternateLocale: routing.locales
        .filter((item) => item !== locale)
        .map(ogLocaleFor),
      type,
      ...(ogImage
        ? {
            images: [
              {
                url: ogImage,
                alt: imageAlt || resolvedTitle,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: resolvedTitle,
      description: resolvedDescription,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  }
}
