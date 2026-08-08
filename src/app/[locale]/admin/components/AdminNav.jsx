'use client'

import { useCallback, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname } from '@/i18n/navigation'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

function CountBadge({ count, active, ariaLabel }) {
  if (!count || count <= 0) return null
  return (
    <span
      className={cn(
        'inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none',
        active ? 'bg-main-gold/20 text-primary' : 'bg-secondary-blue text-white'
      )}
      aria-label={ariaLabel}
    >
      {count > 99 ? '99+' : count}
    </span>
  )
}

export default function AdminNav() {
  const t = useTranslations('Admin')
  const pathname = usePathname()
  const [pendingApproval, setPendingApproval] = useState(0)
  const [meetingRequests, setMeetingRequests] = useState(0)

  const navItems = [
    { href: '/admin/properties', label: t('nav.properties') },
    { href: '/admin/property-types', label: t('nav.propertyTypes') },
    {
      href: '/admin/investments',
      label: t('nav.investments'),
      badgeCount: meetingRequests,
      badgeAria: t('nav.pendingMeetingRequestsAria', { count: meetingRequests }),
    },
    {
      href: '/admin/users',
      label: t('nav.users'),
      badgeCount: pendingApproval,
      badgeAria: t('nav.pendingUsersAria', { count: pendingApproval }),
    },
    { href: '/admin/content', label: t('nav.content') },
  ]

  const fetchPendingCount = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/users/pending-count', { credentials: 'include' })
      if (!res.ok) return
      const data = await res.json()
      setPendingApproval(data.pendingApproval ?? 0)
      setMeetingRequests(data.meetingRequests ?? 0)
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
  }, [fetchPendingCount, pathname])

  const isActive = (href) => pathname === href || pathname.endsWith(href)

  return (
    <div className="mb-8 border-b border-border/80 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-3 pt-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
          <p className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.22em] text-main-gold">
            {t('panelTitle')}
          </p>
          <nav className="-mb-px flex flex-wrap gap-x-1 gap-y-0" aria-label={t('panelTitle')}>
            {navItems.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'inline-flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'border-main-gold text-primary'
                      : 'border-transparent text-muted-foreground hover:border-border hover:text-primary'
                  )}
                >
                  {item.label}
                  <CountBadge
                    count={item.badgeCount}
                    active={active}
                    ariaLabel={item.badgeAria}
                  />
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </div>
  )
}
