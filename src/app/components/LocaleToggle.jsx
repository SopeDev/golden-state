'use client'

import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'
import { useParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import { routing } from '@/i18n/routing'
import { cn } from '@/lib/utils'

const localeLabels = { en: 'EN', es: 'ES' }

const localeAriaKey = { en: 'langEnglish', es: 'langSpanish' }

const VARIANT_CLASSES = {
  light: {
    separator: 'text-muted-foreground/30 dark:text-muted-foreground/40',
    active: 'text-primary',
    inactive: 'text-muted-foreground/45 hover:text-secondary-blue dark:text-muted-foreground/55',
  },
  dark: {
    separator: 'text-primary-foreground/30',
    active: 'text-main-gold',
    inactive: 'text-primary-foreground/60 hover:text-primary-foreground',
  },
}

export default function LocaleToggle({ className, variant = 'light' }) {
  const t = useTranslations('Navbar')
  const pathname = usePathname()
  const router = useRouter()
  const params = useParams()
  const currentLocale = useLocale()

  const styles = VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.light

  const switchLocale = (targetLocale) => {
    if (targetLocale === currentLocale) return
    router.replace({ pathname, params }, { locale: targetLocale })
  }

  const orderedLocales = routing.locales.includes(currentLocale)
    ? [currentLocale, ...routing.locales.filter((l) => l !== currentLocale)]
    : [...routing.locales]

  return (
    <div
      className={cn('flex items-center text-sm', className)}
      role="group"
      aria-label={t('languageSwitcher')}
    >
      {orderedLocales.map((loc, index) => {
        const active = currentLocale === loc
        return (
          <span key={loc} className="inline-flex items-center">
            {index > 0 && (
              <span
                className={cn('px-1.5 select-none', styles.separator)}
                aria-hidden
              >
                /
              </span>
            )}
            <button
              type="button"
              onClick={() => switchLocale(loc)}
              aria-label={t(localeAriaKey[loc])}
              aria-pressed={active}
              className={cn(
                'cursor-pointer border-0 bg-transparent px-0.5 py-1 font-medium transition-colors',
                'rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                active ? styles.active : styles.inactive
              )}
            >
              {localeLabels[loc]}
            </button>
          </span>
        )
      })}
    </div>
  )
}
