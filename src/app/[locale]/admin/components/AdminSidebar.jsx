'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { usePathname, useRouter, Link } from '@/i18n/navigation'
import {
  Banknote,
  Building2,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  FileText,
  HandCoins,
  Home,
  Menu,
  Repeat2,
  Tags,
  TrendingUp,
  Users,
  Wallet,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

const SIDEBAR_COLLAPSED_KEY = 'admin-sidebar-collapsed'

function CountBadge({ count, active, ariaLabel, compact }) {
  if (!count || count <= 0) return null
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full font-bold leading-none',
        compact
          ? 'absolute right-1 top-1 min-w-4 px-0.5 py-px text-[9px]'
          : 'min-w-5 px-1.5 py-0.5 text-[10px]',
        active ? 'bg-main-gold/20 text-primary' : 'bg-secondary-blue text-white'
      )}
      aria-label={ariaLabel}
    >
      {count > 99 ? '99+' : count}
    </span>
  )
}

function splitHref(href) {
  const [path, query = ''] = href.split('?')
  return { path, queryParams: new URLSearchParams(query) }
}

function pathMatches(pathname, path, exact = false) {
  if (exact) {
    return pathname === path || pathname.endsWith(path)
  }
  return pathname === path || pathname.endsWith(path) || pathname.includes(`${path}/`)
}

function hrefIsActive(pathname, href, exact = false) {
  const { path } = splitHref(href)
  return pathMatches(pathname, path, exact)
}

function NavLink({
  href,
  label,
  icon: Icon,
  exact,
  badgeCount,
  badgeAria,
  pathname,
  searchParams,
  onNavigate,
  collapsed,
}) {
  const router = useRouter()
  const active = hrefIsActive(pathname, href, exact)
  const { path, queryParams } = splitHref(href)

  const handleClick = (event) => {
    onNavigate?.()
    if (!pathMatches(pathname, path, exact)) return
    const targetQuery = queryParams.toString()
    const currentQuery = searchParams?.toString() || ''
    if (targetQuery !== currentQuery) {
      event.preventDefault()
      router.push(href)
    }
  }

  const linkClassName = cn(
    'flex items-center rounded-lg text-sm font-medium transition-colors',
    collapsed ? 'relative justify-center px-2 py-2.5' : 'gap-2.5 px-3 py-2',
    active
      ? 'bg-main-gold/15 text-primary'
      : 'text-primary/85 hover:bg-muted/60 hover:text-primary'
  )

  const content = (
    <>
      {Icon ? (
        <Icon
          className={cn(
            'size-4 shrink-0',
            active ? 'text-primary' : 'text-muted-foreground'
          )}
          aria-hidden
        />
      ) : null}
      {collapsed ? (
        <CountBadge
          count={badgeCount}
          active={active}
          ariaLabel={badgeAria}
          compact
        />
      ) : (
        <>
          <span className="min-w-0 flex-1 truncate">{label}</span>
          <CountBadge count={badgeCount} active={active} ariaLabel={badgeAria} />
        </>
      )}
    </>
  )

  if (!collapsed) {
    return (
      <Link href={href} onClick={handleClick} className={linkClassName}>
        {content}
      </Link>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Link
            href={href}
            onClick={handleClick}
            aria-label={label}
            className={linkClassName}
          />
        }
      >
        {content}
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        {label}
      </TooltipContent>
    </Tooltip>
  )
}

function SectionLabel({ label, collapsed }) {
  if (collapsed) {
    return (
      <div className="my-2 flex justify-center" role="separator" aria-hidden>
        <span className="h-px w-4 bg-main-gold/50" />
      </div>
    )
  }

  return (
    <div className="mt-4 border-t border-border/80 pt-4 first:mt-0 first:border-t-0 first:pt-0">
      <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-main-gold">
        {label}
      </p>
    </div>
  )
}

function NavDivider({ collapsed }) {
  if (collapsed) {
    return (
      <div className="my-2 flex justify-center" role="separator">
        <span className="h-px w-4 bg-main-gold/50" />
      </div>
    )
  }

  return <div className="my-3 border-t border-border/80" role="separator" />
}

function CollapseToggle({ collapsed, onToggle, collapseLabel, expandLabel }) {
  const label = collapsed ? expandLabel : collapseLabel
  const Icon = collapsed ? ChevronRight : ChevronLeft

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={!collapsed}
            aria-label={label}
            className="absolute top-7 right-0 z-20 flex size-7 translate-x-1/2 cursor-pointer items-center justify-center rounded-full border border-border bg-background text-primary shadow-md transition-colors hover:bg-muted"
          />
        }
      >
        <Icon className="size-3.5" aria-hidden />
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={12}>
        {label}
      </TooltipContent>
    </Tooltip>
  )
}

export default function AdminSidebar() {
  const t = useTranslations('Admin')
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [pendingApproval, setPendingApproval] = useState(0)
  const [meetingRequests, setMeetingRequests] = useState(0)
  const [pendingDeposits, setPendingDeposits] = useState(0)
  const [pendingCashOuts, setPendingCashOuts] = useState(0)
  const [pendingReinvests, setPendingReinvests] = useState(0)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const navEntries = useMemo(
    () => [
      { type: 'link', href: '/admin', label: t('nav.home'), icon: Home, exact: true },
      { type: 'section', label: t('nav.properties') },
      { type: 'link', href: '/admin/properties', label: t('nav.properties'), icon: Building2 },
      { type: 'link', href: '/admin/property-types', label: t('nav.propertyTypes'), icon: Tags },
      { type: 'section', label: t('nav.investments') },
      {
        type: 'link',
        href: '/admin/investments',
        label: t('nav.meetingRequests'),
        icon: CalendarClock,
        exact: true,
        badgeCount: meetingRequests,
        badgeAria: t('nav.pendingMeetingRequestsAria', { count: meetingRequests }),
      },
      {
        type: 'link',
        href: '/admin/deposits',
        label: t('nav.depositQueue'),
        icon: HandCoins,
        badgeCount: pendingDeposits,
        badgeAria: t('nav.pendingDepositsAria', { count: pendingDeposits }),
      },
      {
        type: 'link',
        href: '/admin/contributions',
        label: t('nav.contributions'),
        icon: Wallet,
      },
      { type: 'section', label: t('nav.returns') },
      {
        type: 'link',
        href: '/admin/distributions',
        label: t('nav.distributions'),
        icon: TrendingUp,
      },
      {
        type: 'link',
        href: '/admin/cash-outs',
        label: t('nav.cashOutQueue'),
        icon: Banknote,
        badgeCount: pendingCashOuts,
        badgeAria: t('nav.pendingCashOutsAria', { count: pendingCashOuts }),
      },
      {
        type: 'link',
        href: '/admin/reinvests',
        label: t('nav.reinvestQueue'),
        icon: Repeat2,
        badgeCount: pendingReinvests,
        badgeAria: t('nav.pendingReinvestsAria', { count: pendingReinvests }),
      },
      { type: 'divider' },
      {
        type: 'link',
        href: '/admin/users',
        label: t('nav.users'),
        icon: Users,
        badgeCount: pendingApproval,
        badgeAria: t('nav.pendingUsersAria', { count: pendingApproval }),
      },
      { type: 'divider' },
      { type: 'link', href: '/admin/content', label: t('nav.content'), icon: FileText },
    ],
    [t, meetingRequests, pendingDeposits, pendingCashOuts, pendingReinvests, pendingApproval]
  )

  const fetchPendingCount = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/users/pending-count', { credentials: 'include' })
      if (!res.ok) return
      const data = await res.json()
      setPendingApproval(data.pendingApproval ?? 0)
      setMeetingRequests(data.meetingRequests ?? 0)
      setPendingDeposits(data.pendingDeposits ?? 0)
      setPendingCashOuts(data.pendingCashOuts ?? 0)
      setPendingReinvests(data.pendingReinvests ?? 0)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    fetchPendingCount()
    const interval = setInterval(fetchPendingCount, 60_000)
    const onRefresh = () => fetchPendingCount()
    window.addEventListener('admin-pending-count-changed', onRefresh)
    return () => {
      clearInterval(interval)
      window.removeEventListener('admin-pending-count-changed', onRefresh)
    }
  }, [fetchPendingCount, pathname, searchParams])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname, searchParams])

  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1')
    } catch {
      // ignore
    }
  }, [])

  const closeMobile = () => setMobileOpen(false)

  const toggleCollapsed = () => {
    setCollapsed((current) => {
      const next = !current
      try {
        window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? '1' : '0')
      } catch {
        // ignore
      }
      return next
    })
  }

  const renderNav = (isCollapsed, onNavigate) => (
    <>
      {isCollapsed ? null : (
        <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-main-gold">
          {t('panelTitle')}
        </p>
      )}
      <nav
        className={cn(
          'flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto',
          isCollapsed ? 'mt-1' : 'mt-5'
        )}
        aria-label={t('panelTitle')}
      >
        {navEntries.map((entry, index) => {
          if (entry.type === 'section') {
            return (
              <SectionLabel
                key={`section-${entry.label}-${index}`}
                label={entry.label}
                collapsed={isCollapsed}
              />
            )
          }

          if (entry.type === 'divider') {
            return <NavDivider key={`divider-${index}`} collapsed={isCollapsed} />
          }

          return (
            <NavLink
              key={entry.href}
              href={entry.href}
              label={entry.label}
              icon={entry.icon}
              exact={entry.exact}
              badgeCount={entry.badgeCount}
              badgeAria={entry.badgeAria}
              pathname={pathname}
              searchParams={searchParams}
              onNavigate={onNavigate}
              collapsed={isCollapsed}
            />
          )
        })}
      </nav>
    </>
  )

  return (
    <TooltipProvider delay={200}>
      <div className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border/80 bg-background px-4 py-3 lg:hidden">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-main-gold">
          {t('panelTitle')}
        </p>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={() => setMobileOpen((open) => !open)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? t('nav.closeMenu') : t('nav.openMenu')}
        >
          {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
        </Button>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label={t('nav.closeMenu')}
            onClick={closeMobile}
          />
          <aside className="absolute inset-y-0 left-0 flex w-[min(18rem,85vw)] flex-col border-r border-border/80 bg-background p-4 shadow-xl">
            {renderNav(false, closeMobile)}
          </aside>
        </div>
      ) : null}

      <div
        className={cn(
          'relative sticky top-0 hidden h-[calc(100vh-76px)] shrink-0 lg:block',
          'transition-[width] duration-200 ease-out',
          collapsed ? 'w-[4.25rem]' : 'w-56 xl:w-60'
        )}
      >
        <aside
          className={cn(
            'flex h-full flex-col overflow-y-auto border-r border-border/80 bg-background',
            collapsed ? 'p-2' : 'p-4'
          )}
        >
          {renderNav(collapsed, closeMobile)}
        </aside>
        <CollapseToggle
          collapsed={collapsed}
          onToggle={toggleCollapsed}
          collapseLabel={t('nav.collapseSidebar')}
          expandLabel={t('nav.expandSidebar')}
        />
      </div>
    </TooltipProvider>
  )
}
