import { createNavigation } from 'next-intl/navigation'
import { getLocale } from 'next-intl/server'
import { routing } from './routing'

const navigation = createNavigation(routing)

export const { Link, usePathname, useRouter, getPathname } = navigation

/** Locale-aware redirect for Server Components (next-intl v4 requires `{ href, locale }`). */
export async function redirect(href) {
  const locale = await getLocale()
  navigation.redirect({ href, locale })
}

export async function permanentRedirect(href) {
  const locale = await getLocale()
  navigation.permanentRedirect({ href, locale })
}