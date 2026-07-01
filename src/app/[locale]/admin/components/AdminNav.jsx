'use client'

import { useCallback, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname } from '@/i18n/navigation'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

export default function AdminNav() {
  const t = useTranslations('Admin')
  const pathname = usePathname()
  const [pendingApproval, setPendingApproval] = useState(0)

  const navItems = [
    { href: '/admin/properties', label: t('nav.properties') },
    { href: '/admin/users', label: t('nav.users'), showPendingBadge: true },
    { href: '/admin/content', label: t('nav.content') },
  ]

  const navItemsDatabase = [
    { href: '/admin/data', label: t('nav.data') },
    { href: '/admin/schema', label: t('nav.schema') },
  ]

  const fetchPendingCount = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/users/pending-count', { credentials: 'include' })
      if (!res.ok) return
      const data = await res.json()
      setPendingApproval(data.pendingApproval ?? 0)
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

  const linkClass = (href) =>
    cn(
      'inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
      pathname.endsWith(href)
        ? 'bg-primary text-primary-foreground'
        : 'text-foreground hover:bg-muted hover:text-primary'
    )

  return (
    <div className="mb-8 border-b border-border bg-card shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-8">
            <h2 className="font-heading text-xl font-semibold text-primary">{t('panelTitle')}</h2>
            <nav className="flex flex-wrap gap-2 lg:gap-4">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className={linkClass(item.href)}>
                  {item.label}
                  {item.showPendingBadge && pendingApproval > 0 ? (
                    <span
                      className={cn(
                        'inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none',
                        pathname.endsWith(item.href)
                          ? 'bg-primary-foreground text-primary'
                          : 'bg-secondary-blue text-white'
                      )}
                      aria-label={t('nav.pendingUsersAria', { count: pendingApproval })}
                    >
                      {pendingApproval > 99 ? '99+' : pendingApproval}
                    </span>
                  ) : null}
                </Link>
              ))}
            </nav>
          </div>
          <nav className="flex flex-wrap gap-2 border-t border-border pt-4 lg:border-0 lg:pt-0 lg:gap-4">
            {navItemsDatabase.map((item) => (
              <Link key={item.href} href={item.href} className={linkClass(item.href)}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}
