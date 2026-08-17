import { routing } from '@/i18n/routing'
import { getSiteUrl } from '@/lib/seo'

export default function robots() {
  const site = getSiteUrl()
  const privatePrefixes = ['/admin', '/dashboard', '/account', '/forgot-password', '/reset-password']
  const disallow = [
    '/api/',
    ...routing.locales.flatMap((locale) =>
      privatePrefixes.map((prefix) => `/${locale}${prefix}`)
    ),
  ]

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow,
    },
    sitemap: `${site}/sitemap.xml`,
    host: site,
  }
}
