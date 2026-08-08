import { getRequestConfig } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { routing } from './routing'
import en from '../../messages/en.json'
import es from '../../messages/es.json'

const messagesByLocale = { en, es }

export default getRequestConfig(async ({ requestLocale }) => {
  // Typically corresponds to the `[locale]` segment
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale

  return {
    locale,
    // Static imports so Turbopack invalidates when message JSON changes
    messages: messagesByLocale[locale] || messagesByLocale[routing.defaultLocale],
  }
})
