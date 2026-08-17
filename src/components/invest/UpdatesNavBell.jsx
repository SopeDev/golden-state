'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Bell } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { canAccessInvestorUpdates } from '@/lib/auth/userStatus'
import { INVESTOR_UPDATES_CHANGED_EVENT } from '@/lib/investorUpdateConstants'
import { cn } from '@/lib/utils'

const POLL_MS = 60_000

export default function UpdatesNavBell({ user, className }) {
  const t = useTranslations('Navbar')
  const { data: clientSession } = useSession()
  const sessionUser = clientSession?.user ?? user
  const enabled = canAccessInvestorUpdates(sessionUser)
  const [unreadCount, setUnreadCount] = useState(0)

  const loadCount = useCallback(async () => {
    if (!enabled) return
    try {
      const res = await fetch('/api/investor/updates?countOnly=1', { credentials: 'include' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) return
      setUnreadCount(Number(data.unreadCount) || 0)
    } catch {
      // Keep the last known count if the poll fails.
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled) return undefined
    loadCount()
    const timer = window.setInterval(loadCount, POLL_MS)
    const onFocus = () => loadCount()
    window.addEventListener('focus', onFocus)
    window.addEventListener(INVESTOR_UPDATES_CHANGED_EVENT, onFocus)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('focus', onFocus)
      window.removeEventListener(INVESTOR_UPDATES_CHANGED_EVENT, onFocus)
    }
  }, [enabled, loadCount])

  if (!enabled) return null

  const unreadLabel = unreadCount > 0 ? t('updatesUnread', { count: unreadCount }) : t('updatesAria')

  return (
    <Link
      href="/dashboard/updates"
      className={cn(
        'relative inline-flex size-10 items-center justify-center rounded-lg border border-border text-primary',
        'hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
        className
      )}
      aria-label={unreadLabel}
    >
      <Bell className="size-5" aria-hidden />
      {unreadCount > 0 ? (
        <span
          className="absolute -right-1 -top-1 inline-flex min-w-4 items-center justify-center rounded-full bg-secondary-blue px-1 py-px text-[10px] font-bold leading-none text-white"
          aria-hidden
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      ) : null}
    </Link>
  )
}
