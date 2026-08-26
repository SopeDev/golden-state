'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useLocale, useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/navigation'
import { getPropertyTypeLabel } from '@/lib/propertyTypes'
import { resolveProtectedActivityHref, resolveProtectedPortfolioHref, resolveProtectedUpdatesHref } from '@/lib/auth/userStatus'
import DropdownNavItem from './DropdownNavItem'
import AuthButton from './AuthButton'
import AccountNavMenu from './AccountNavMenu'
import UpdatesNavBell from '@/components/invest/UpdatesNavBell'
import { getAdminLandingPath } from '@/lib/operatorPermissions'

export default function NavMenu({ session: serverSession, propertyTypes = [] }) {
  const t = useTranslations('Navbar')
  const tProjects = useTranslations('Projects')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const { data: clientSession, status: sessionStatus } = useSession()
  const user =
    sessionStatus === 'loading' ? serverSession?.user : clientSession?.user
  const dashboardHref = '/dashboard'
  const portfolioHref = user ? resolveProtectedPortfolioHref(user) : '/login'
  const activityHref = user ? resolveProtectedActivityHref(user) : '/login'
  const updatesHref = user ? resolveProtectedUpdatesHref(user) : '/login'
  const myAccountHref = '/dashboard/account'

  const projectTypeLinks = propertyTypes.map((type) => ({
    href: `/projects/${type.slug}`,
    text: getPropertyTypeLabel(type, locale),
  }))

  const projectDropdownLinks = [
    { href: '/projects', text: t('allProjects') },
    ...projectTypeLinks,
    { divider: true },
    { href: '/projects/completed', text: tProjects('completed') },
  ]

  const closeMenu = () => setMenuOpen(false)

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  const handleMobileSignOut = async () => {
    closeMenu()
    await signOut({ redirect: false })
    router.push('/')
    router.refresh()
  }

  return (
    <div
      id="nav"
      className="fixed top-0 z-50 w-screen border-b border-border bg-background py-3 shadow-sm"
    >
      <div className="mx-auto flex w-full max-w-screen-xl items-center justify-between px-3 md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl">
        <div className="shrink-0">
          <Link href="/" onClick={closeMenu}>
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
          </ul>
        </nav>

        <div className="hidden shrink-0 items-center gap-3 lg:flex">
          {user ? (
            <>
              <UpdatesNavBell user={user} />
              <AccountNavMenu user={user} />
            </>
          ) : (
            <AuthButton t={t} />
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2 lg:hidden">
          {user ? <UpdatesNavBell user={user} /> : null}
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
        <div className="mt-3 flex max-h-[calc(100vh-5rem)] touch-pan-y flex-col gap-2 overflow-y-scroll overscroll-contain bg-background px-4 pb-[calc(5rem+env(safe-area-inset-bottom))] [-webkit-overflow-scrolling:touch] lg:hidden [max-height:calc(100svh-5rem)]">
          <hr />
          <span className="text-lg">Info</span>
          <Link href="/about" onClick={closeMenu}>
            <div className="py-1 text-sm text-primary hover:text-secondary-blue">{t('about')}</div>
          </Link>
          <Link href="/faq" onClick={closeMenu}>
            <div className="py-1 text-sm text-primary hover:text-secondary-blue">{t('faq')}</div>
          </Link>
          <Link href="/contact" onClick={closeMenu}>
            <div className="py-1 text-sm text-primary hover:text-secondary-blue">{t('contact')}</div>
          </Link>
          <hr />
          <span className="text-lg">{t('projects')}</span>
          <Link href="/projects" onClick={closeMenu}>
            <div className="py-1 text-sm text-primary hover:text-secondary-blue">{t('allProjects')}</div>
          </Link>
          {projectTypeLinks.map((item) => (
            <Link key={item.href} href={item.href} onClick={closeMenu}>
              <div className="py-1 text-sm text-primary hover:text-secondary-blue">
                {item.text}
              </div>
            </Link>
          ))}
          <hr className="border-border" />
          <Link href="/projects/completed" onClick={closeMenu}>
            <div className="py-1 text-sm text-primary hover:text-secondary-blue">
              {tProjects('completed')}
            </div>
          </Link>
          {user && (
            <>
              <hr />
              <span className="text-lg">{t('account')}</span>
              {user.email ? (
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              ) : null}
              {['ADMIN', 'OPERATOR'].includes(user.type) && (
                <>
                  <Link href={getAdminLandingPath(user)} onClick={closeMenu}>
                    <div className="py-1 text-sm text-primary hover:text-secondary-blue">{t('admin')}</div>
                  </Link>
                  <hr className="border-border" />
                </>
              )}
              <Link href={dashboardHref} onClick={closeMenu}>
                <div className="py-1 text-sm text-primary hover:text-secondary-blue">{t('dashboard')}</div>
              </Link>
              <Link href={portfolioHref} onClick={closeMenu}>
                <div className="py-1 text-sm text-primary hover:text-secondary-blue">{t('portfolio')}</div>
              </Link>
              <Link href={activityHref} onClick={closeMenu}>
                <div className="py-1 text-sm text-primary hover:text-secondary-blue">{t('activity')}</div>
              </Link>
              <Link href={updatesHref} onClick={closeMenu}>
                <div className="py-1 text-sm text-primary hover:text-secondary-blue">{t('updates')}</div>
              </Link>
              <Link href={myAccountHref} onClick={closeMenu}>
                <div className="py-1 text-sm text-primary hover:text-secondary-blue">{t('myAccount')}</div>
              </Link>
              <button
                type="button"
                onClick={handleMobileSignOut}
                className="mt-1 cursor-pointer py-1 text-left text-sm text-destructive"
              >
                {t('signOut')}
              </button>
            </>
          )}
          {!user && (
            <>
              <hr />
              <div className="flex justify-center sm:justify-end">
                <AuthButton t={t} onNavigate={closeMenu} />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
