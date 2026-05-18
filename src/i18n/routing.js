import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'es'],
  defaultLocale: 'en',
  // Detect locale automatically from the `Accept-Language` header on first
  // visit. Once the user lands on a localized path (manually or via toggle),
  // next-intl persists the choice in the NEXT_LOCALE cookie and respects it
  // on subsequent visits.
  localeDetection: true,
  localeCookie: {
    name: 'NEXT_LOCALE',
    // ~1 year — user choice is sticky.
    maxAge: 60 * 60 * 24 * 365,
  },
})