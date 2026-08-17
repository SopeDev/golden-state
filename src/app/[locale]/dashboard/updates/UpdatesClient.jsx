'use client'

import { useCallback, useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Bell, FileText, Megaphone } from 'lucide-react'
import { Link, useRouter } from '@/i18n/navigation'
import { buttonVariants, Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  getPropertyDocumentKindLabelKey,
} from '@/lib/propertyDocuments'
import { getPropertyStatusLabelKey } from '@/lib/propertyStatusUi'
import {
  INVESTOR_UPDATE_TYPES,
  INVESTOR_UPDATES_CHANGED_EVENT,
} from '@/lib/investorUpdateConstants'

const dispatchUpdatesChanged = () => {
  window.dispatchEvent(new Event(INVESTOR_UPDATES_CHANGED_EVENT))
}

function formatUpdateDate(value, locale) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(locale === 'es' ? 'es-MX' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export default function UpdatesClient() {
  const t = useTranslations('UpdatesPage')
  const tStatus = useTranslations('Projects.status')
  const tKinds = useTranslations('PropertyDocuments.kinds')
  const locale = useLocale()
  const router = useRouter()
  const [updates, setUpdates] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [markingAll, setMarkingAll] = useState(false)

  const loadUpdates = useCallback(async () => {
    setError('')
    try {
      const res = await fetch('/api/investor/updates', { credentials: 'include' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(t('loadError'))
        return
      }
      setUpdates(Array.isArray(data.updates) ? data.updates : [])
      setUnreadCount(Number(data.unreadCount) || 0)
    } catch {
      setError(t('loadError'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    loadUpdates()
  }, [loadUpdates])

  const markRead = async (id) => {
    await fetch(`/api/investor/updates/${id}/read`, { method: 'POST', credentials: 'include' })
    dispatchUpdatesChanged()
  }

  const handleOpen = async (update) => {
    if (!update.readAt) await markRead(update.id)
    router.push(update.href || '/dashboard/portfolio')
  }

  const handleMarkAll = async () => {
    if (markingAll || unreadCount <= 0) return
    setMarkingAll(true)
    try {
      await fetch('/api/investor/updates/read-all', { method: 'POST', credentials: 'include' })
      dispatchUpdatesChanged()
      await loadUpdates()
    } finally {
      setMarkingAll(false)
    }
  }

  const titleFor = (update) => {
    const name = update.propertyName || t('unknownProperty')
    if (update.type === INVESTOR_UPDATE_TYPES.PROPERTY_DOCUMENTS) {
      return t('documentsTitle', { property: name })
    }
    return t('statusTitle', { property: name })
  }

  const bodyFor = (update) => {
    const payload = update.payload || {}
    const percent = Number(payload.progressPercent) || 0
    if (update.type === INVESTOR_UPDATE_TYPES.PROPERTY_DOCUMENTS) {
      const kinds = Array.isArray(payload.kinds)
        ? payload.kinds
            .map((kind) => tKinds(getPropertyDocumentKindLabelKey(kind)))
            .join(', ')
        : ''
      return t('documentsBody', {
        count: Number(payload.documentCount) || 0,
        kinds,
        percent,
      })
    }
    return t('statusBody', {
      from: tStatus(getPropertyStatusLabelKey(payload.previousStatus)),
      to: tStatus(getPropertyStatusLabelKey(payload.status)),
      percent,
    })
  }

  return (
    <div className="flex-1 bg-background">
      <header className="bg-primary py-12 text-primary-foreground md:py-16">
        <div className="container mx-auto px-4">
          <Link
            href="/dashboard"
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'sm' }),
              'mb-4 text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground'
            )}
          >
            {t('backToDashboard')}
          </Link>
          <h1 className="font-heading text-4xl font-semibold md:text-5xl">{t('title')}</h1>
          <p className="mt-3 max-w-2xl text-lg text-primary-foreground/85">{t('subtitle')}</p>
        </div>
      </header>

      <div className="container mx-auto space-y-6 px-4 py-10 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {t('unreadSummary', { count: unreadCount })}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleMarkAll}
            disabled={markingAll || unreadCount <= 0}
          >
            {t('markAllRead')}
          </Button>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">{t('loading')}</p>
        ) : error ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : updates.length === 0 ? (
          <div className="rounded-2xl border border-border/70 bg-muted/30 px-6 py-12 text-center">
            <Bell className="mx-auto size-8 text-muted-foreground" aria-hidden />
            <p className="mt-3 font-heading text-lg font-semibold text-primary">{t('emptyTitle')}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t('emptyBody')}</p>
          </div>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border/70 bg-background">
            {updates.map((update) => {
              const unread = !update.readAt
              const Icon =
                update.type === INVESTOR_UPDATE_TYPES.PROPERTY_DOCUMENTS ? FileText : Megaphone
              return (
                <li key={update.id}>
                  <button
                    type="button"
                    onClick={() => handleOpen(update)}
                    className={cn(
                      'flex w-full cursor-pointer items-start gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/40',
                      unread && 'bg-main-gold/5'
                    )}
                  >
                    <span
                      className={cn(
                        'mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full',
                        unread ? 'bg-main-gold/20 text-primary' : 'bg-muted text-muted-foreground'
                      )}
                    >
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            'font-heading text-base font-semibold',
                            unread ? 'text-primary' : 'text-foreground'
                          )}
                        >
                          {titleFor(update)}
                        </span>
                        {unread ? (
                          <span className="rounded-full bg-secondary-blue px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                            {t('unreadBadge')}
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-1 block text-sm text-muted-foreground">
                        {bodyFor(update)}
                      </span>
                      <span className="mt-2 block text-xs text-muted-foreground">
                        {formatUpdateDate(update.createdAt, locale)}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
