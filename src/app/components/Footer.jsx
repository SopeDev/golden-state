'use client'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import LocaleToggle from './LocaleToggle'

const PROJECT_FOOTER_LINKS = [
  { href: '/projects', labelKey: 'allProjects', fromNavbar: true },
  { href: '/projects/build-to-sell', labelKey: 'buildToSell', fromNavbar: false },
  { href: '/projects/build-to-rent', labelKey: 'buildToRent', fromNavbar: false },
  { href: '/projects/fliphouses', labelKey: 'fliphouse', fromNavbar: false },
  { href: '/projects/mex-to-us', labelKey: 'mexToUs', fromNavbar: false },
  { href: '/projects/us-to-mex', labelKey: 'usToMex', fromNavbar: false },
]

export default function Footer() {
  const t = useTranslations('Footer')
  const tProjects = useTranslations('Projects')

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-screen-xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <div>
              <img src="/logo.png" alt="Golden State" className="mb-4 h-12" />
            </div>
            <p className="text-sm leading-relaxed text-primary-foreground/80">
              {t('description')}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-primary-foreground/80 transition-colors hover:text-primary-foreground">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a href="#" className="text-primary-foreground/80 transition-colors hover:text-primary-foreground">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a href="#" className="text-primary-foreground/80 transition-colors hover:text-primary-foreground">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-main-gold">{t('quickLinks')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-primary-foreground/80 transition-colors hover:text-primary-foreground">
                  {t('whoAreWe')}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-primary-foreground/80 transition-colors hover:text-primary-foreground">
                  {t('faq')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-primary-foreground/80 transition-colors hover:text-primary-foreground">
                  {t('contact')}
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-main-gold">{t('projectsHeading')}</h3>
            <ul className="space-y-2">
              {PROJECT_FOOTER_LINKS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-primary-foreground/80 transition-colors hover:text-primary-foreground">
                    {item.fromNavbar ? t(item.labelKey) : tProjects(item.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-main-gold">{t('contactUs')}</h3>
            <div className="space-y-2 text-sm">
              <p className="text-primary-foreground/80">
                <span className="font-semibold text-main-gold">{t('phone')}:</span>
                <br />
                +1 (619) 555-0142
              </p>
              <p className="text-primary-foreground/80">
                <span className="font-semibold text-main-gold">{t('email')}:</span>
                <br />
                investors@goldenstatecap.com
              </p>
              <p className="text-primary-foreground/80">
                <span className="font-semibold text-main-gold">{t('address')}:</span>
                <br />
                401 B Street, Suite 1850
                <br />
                San Diego, CA 92101
              </p>
            </div>
            <div className="pt-2">
              <a
                href="mailto:investors@goldenstatecap.com"
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'default' }),
                  'w-full border-main-gold text-main-gold hover:bg-main-gold hover:text-primary-foreground'
                )}
              >
                {t('emailInvestorRelations')}
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-primary-foreground/20 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row md:gap-6">
            <div className="text-sm text-primary-foreground/70">{t('copyright')}</div>
            <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
                <Link href="/privacy" className="text-primary-foreground/70 transition-colors hover:text-primary-foreground">
                  {t('privacyPolicy')}
                </Link>
                <Link href="/terms" className="text-primary-foreground/70 transition-colors hover:text-primary-foreground">
                  {t('termsOfService')}
                </Link>
                <Link href="/legal" className="text-primary-foreground/70 transition-colors hover:text-primary-foreground">
                  {t('legalDisclaimers')}
                </Link>
              </div>
              <div className="flex items-center md:border-l md:border-primary-foreground/20 md:pl-6">
                <LocaleToggle variant="dark" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
