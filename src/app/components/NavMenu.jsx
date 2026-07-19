'use client'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { resolveProtectedPortfolioHref } from '@/lib/auth/userStatus'
import DropdownNavItem from './DropdownNavItem'
import AuthButton from './AuthButton'

const PROJECT_TYPE_LINKS = [
  { href: '/projects/build-to-sell', projectsLabelKey: 'buildToSell' },
  { href: '/projects/build-to-rent', projectsLabelKey: 'buildToRent' },
  { href: '/projects/fliphouses', projectsLabelKey: 'fliphouse' },
  { href: '/projects/mex-to-us', projectsLabelKey: 'mexToUs' },
  { href: '/projects/us-to-mex', projectsLabelKey: 'usToMex' },
]

export default function NavMenu({ session: serverSession }) {
  const t = useTranslations('Navbar')
  const tProjects = useTranslations('Projects')
  const [menuOpen, setMenuOpen] = useState(false)
  const { data: clientSession } = useSession()
  const user = clientSession?.user ?? serverSession?.user
  const dashboardHref = user ? '/dashboard' : '/login'
  const portfolioHref = user ? resolveProtectedPortfolioHref(user) : '/login'
  const myAccountHref = user ? '/dashboard/account' : '/login'

  const projectDropdownLinks = [
    { href: '/projects', text: t('allProjects') },
    ...PROJECT_TYPE_LINKS.map((item) => ({
      href: item.href,
      text: tProjects(item.projectsLabelKey),
    })),
    { divider: true },
    { href: '/projects/completed', text: tProjects('completed') },
  ]

  return (
    <div
      id="nav"
      className="fixed top-0 z-50 w-screen border-b border-border bg-background py-3 shadow-sm"
    >
      <div className="mx-auto flex w-full max-w-screen-xl items-center justify-between px-3 md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl">
        <div className="shrink-0">
          <Link href="/">
            <img src="/logo.png" alt="Golden State" className="h-13" />
          </Link>
        </div>

        <nav
          className="hidden w-fit shrink-0 lg:flex"
          aria-label={t('primaryNavigation')}
        >
          <ul className="relative flex items-center gap-4">
            <li>
              <Link
                href="/about"
                className="block px-2 py-1 text-primary hover:text-secondary-blue"
              >
                {t('about')}
              </Link>
            </li>
            <DropdownNavItem label="projects" t={t} links={projectDropdownLinks} />
            <li>
              <Link
                href="/faq"
                className="block px-2 py-1 text-primary hover:text-secondary-blue"
              >
                {t('faq')}
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="block px-2 py-1 text-primary hover:text-secondary-blue"
              >
                {t('contact')}
              </Link>
            </li>
            {user && (
              <DropdownNavItem
                label="account"
                t={t}
                links={[
                  { href: dashboardHref, label: 'dashboard' },
                  { href: portfolioHref, label: 'portfolio' },
                  { href: myAccountHref, label: 'myAccount' },
                ]}
              />
            )}
          </ul>
        </nav>

        <div className="hidden shrink-0 items-center gap-3 lg:flex">
          {user?.type === 'ADMIN' && (
            <Link
              href="/admin/properties"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'default' }),
                'border-main-gold text-main-gold hover:bg-main-gold/10'
              )}
            >
              Admin
            </Link>
          )}
          <AuthButton t={t} />
        </div>

        <div className="flex shrink-0 items-center lg:hidden">
          <button
            type="button"
            className="cursor-pointer"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="h-8 w-8 cursor-pointer text-secondary-blue"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 4h20M6 12h16M10 20h12" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="mt-3 flex flex-col gap-2 bg-background px-4 lg:hidden">
          <hr />
          <span className="text-lg">Info</span>
          <Link href="/about" onClick={() => setMenuOpen(false)}>
            <div className="py-1 text-sm text-primary hover:text-secondary-blue">{t('about')}</div>
          </Link>
          <Link href="/faq" onClick={() => setMenuOpen(false)}>
            <div className="py-1 text-sm text-primary hover:text-secondary-blue">{t('faq')}</div>
          </Link>
          <Link href="/contact" onClick={() => setMenuOpen(false)}>
            <div className="py-1 text-sm text-primary hover:text-secondary-blue">{t('contact')}</div>
          </Link>
          <hr />
          <span className="text-lg">{t('projects')}</span>
          <Link href="/projects" onClick={() => setMenuOpen(false)}>
            <div className="py-1 text-sm text-primary hover:text-secondary-blue">{t('allProjects')}</div>
          </Link>
          {PROJECT_TYPE_LINKS.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
              <div className="py-1 text-sm text-primary hover:text-secondary-blue">
                {tProjects(item.projectsLabelKey)}
              </div>
            </Link>
          ))}
          <hr className="border-border" />
          <Link href="/projects/completed" onClick={() => setMenuOpen(false)}>
            <div className="py-1 text-sm text-primary hover:text-secondary-blue">
              {tProjects('completed')}
            </div>
          </Link>
          {user && (
            <>
              <hr />
              <span className="text-lg">{t('account')}</span>
              <Link href={dashboardHref} onClick={() => setMenuOpen(false)}>
                <div className="py-1 text-sm text-primary hover:text-secondary-blue">{t('dashboard')}</div>
              </Link>
              <Link href={portfolioHref} onClick={() => setMenuOpen(false)}>
                <div className="py-1 text-sm text-primary hover:text-secondary-blue">{t('portfolio')}</div>
              </Link>
              <Link href={myAccountHref} onClick={() => setMenuOpen(false)}>
                <div className="py-1 text-sm text-primary hover:text-secondary-blue">{t('myAccount')}</div>
              </Link>
            </>
          )}
          <hr />
          <div className="flex justify-center sm:justify-end">
            <AuthButton t={t} />
          </div>
        </div>
      )}
    </div>
  )
}
