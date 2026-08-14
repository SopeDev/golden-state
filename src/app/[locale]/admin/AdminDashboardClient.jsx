'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useSession } from 'next-auth/react'
import {
  BadgeCheck,
  Banknote,
  ClipboardList,
  HandCoins,
  Repeat2,
  Users,
} from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { formatUsd } from '@/lib/formatMoney'
import { meetingChannelLabelKey } from '@/lib/investMeetingLinks'
import { AdminPageFrame, AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminInvestorLink, AdminPropertyLink } from '@/components/admin/AdminEntityLinks'

function greetingKeyForHour(hour) {
  if (hour < 12) return 'greetingMorning'
  if (hour < 18) return 'greetingAfternoon'
  return 'greetingEvening'
}

function formatShortDate(value, locale) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleDateString(locale === 'es' ? 'es-MX' : 'en-US', {
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return '—'
  }
}

function QueueCard({
  title,
  description,
  count,
  emptyLabel,
  href,
  viewAllLabel,
  icon: Icon,
  accentClass,
  children,
}) {
  const hasItems = count > 0

  return (
    <Card className="flex h-full flex-col border-border/80 shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-3">
        <div className="min-w-0 space-y-1">
          <CardTitle className="font-heading text-lg text-primary">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <div
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-xl',
            accentClass
          )}
        >
          <Icon className="size-5" aria-hidden />
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <p
          className={cn(
            'font-heading text-4xl font-semibold tracking-tight',
            hasItems ? 'text-primary' : 'text-muted-foreground/50'
          )}
        >
          {count}
        </p>

        <div className="min-h-0 flex-1">
          {hasItems ? (
            <ul className="divide-y divide-border/70 overflow-hidden rounded-lg border border-border/70">
              {children}
            </ul>
          ) : (
            <div className="flex min-h-[7.5rem] items-center justify-center rounded-lg border border-dashed border-border/70 bg-muted/20 px-4 text-center text-sm text-muted-foreground">
              {emptyLabel}
            </div>
          )}
        </div>

        <Link
          href={href}
          className={cn(buttonVariants({ variant: hasItems ? 'default' : 'outline' }), 'w-full')}
        >
          {viewAllLabel}
        </Link>
      </CardContent>
    </Card>
  )
}

function PreviewRow({ primary, secondary, meta }) {
  return (
    <li className="flex items-start justify-between gap-3 px-3 py-2.5 text-sm">
      <div className="min-w-0">
        <div className="truncate font-medium text-foreground">{primary}</div>
        {secondary ? (
          <div className="mt-0.5 truncate text-xs text-muted-foreground">{secondary}</div>
        ) : null}
      </div>
      {meta ? (
        <span className="shrink-0 text-xs text-muted-foreground">{meta}</span>
      ) : null}
    </li>
  )
}

export default function AdminDashboardClient() {
  const t = useTranslations('Admin.dashboard')
  const tInvest = useTranslations('Admin.investments')
  const locale = useLocale()
  const { data: session } = useSession()
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const firstName = useMemo(() => {
    const name = session?.user?.name?.trim()
    if (name) return name.split(/\s+/)[0]
    const email = session?.user?.email || ''
    return email.split('@')[0] || 'Admin'
  }, [session])

  const greeting = t(greetingKeyForHour(new Date().getHours()), { name: firstName })

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/dashboard', { credentials: 'include' })
      if (!res.ok) throw new Error('failed')
      const data = await res.json()
      setSummary(data)
      setError('')
    } catch {
      setError(t('loadError'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    load()
    const onRefresh = () => load()
    window.addEventListener('admin-pending-count-changed', onRefresh)
    const id = window.setInterval(load, 60_000)
    return () => {
      window.removeEventListener('admin-pending-count-changed', onRefresh)
      window.clearInterval(id)
    }
  }, [load])

  const counts = summary?.counts || {
    pendingApproval: 0,
    pendingAccreditation: 0,
    meetingRequests: 0,
    pendingDeposits: 0,
    pendingCashOuts: 0,
    pendingReinvests: 0,
    attentionTotal: 0,
  }
  const queues = summary?.queues || {
    pendingApproval: [],
    pendingAccreditation: [],
    meetingRequests: [],
    pendingDeposits: [],
    pendingCashOuts: [],
    pendingReinvests: [],
  }

  const channelLabel = (channel) => {
    const key = meetingChannelLabelKey(channel)
    if (key && tInvest.has(key)) return tInvest(key)
    return channel || '—'
  }

  return (
    <AdminPageFrame className="md:py-10">
      <AdminPageHeader
        className="mb-8"
        eyebrow={t('eyebrow')}
        title={greeting}
        description={
          loading
            ? t('subtitleLoading')
            : counts.attentionTotal > 0
              ? t('subtitleAttention', { count: counts.attentionTotal })
              : t('subtitleClear')
        }
      />

      {error ? (
        <p className="mb-6 text-sm text-destructive">{error}</p>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <QueueCard
          title={t('approvalsTitle')}
          description={t('approvalsDesc')}
          count={counts.pendingApproval}
          emptyLabel={t('emptyQueue')}
          href="/admin/users?accountStatus=PENDING_ADMIN"
          viewAllLabel={t('viewApprovals')}
          icon={Users}
          accentClass="bg-amber-500/15 text-amber-800"
        >
          {queues.pendingApproval.map((row) => (
            <PreviewRow
              key={row.id}
              primary={<AdminInvestorLink userId={row.id}>{row.name || row.email}</AdminInvestorLink>}
              secondary={row.name ? row.email : null}
              meta={formatShortDate(row.at, locale)}
            />
          ))}
        </QueueCard>

        <QueueCard
          title={t('accreditationTitle')}
          description={t('accreditationDesc')}
          count={counts.pendingAccreditation}
          emptyLabel={t('emptyQueue')}
          href="/admin/users?accreditation=PENDING_REVIEW"
          viewAllLabel={t('viewAccreditation')}
          icon={BadgeCheck}
          accentClass="bg-violet-500/15 text-violet-800"
        >
          {queues.pendingAccreditation.map((row) => (
            <PreviewRow
              key={row.id}
              primary={<AdminInvestorLink userId={row.id}>{row.name || row.email}</AdminInvestorLink>}
              secondary={row.name ? row.email : null}
              meta={formatShortDate(row.at, locale)}
            />
          ))}
        </QueueCard>

        <QueueCard
          title={t('meetingsTitle')}
          description={t('meetingsDesc')}
          count={counts.meetingRequests}
          emptyLabel={t('emptyQueue')}
          href="/admin/investments"
          viewAllLabel={t('viewMeetings')}
          icon={ClipboardList}
          accentClass="bg-sky-500/15 text-sky-800"
        >
          {queues.meetingRequests.map((row) => (
            <PreviewRow
              key={row.id}
              primary={<AdminInvestorLink userId={row.userId}>{row.email || '—'}</AdminInvestorLink>}
              secondary={
                <span className="inline-flex flex-wrap items-center gap-x-1">
                  {row.propertyLabel ? (
                    <AdminPropertyLink propertyId={row.propertyId}>
                      {row.propertyLabel}
                    </AdminPropertyLink>
                  ) : null}
                  {row.propertyLabel && row.channel ? <span aria-hidden>·</span> : null}
                  {row.channel ? <span>{channelLabel(row.channel)}</span> : null}
                </span>
              }
              meta={
                row.amount != null
                  ? formatUsd(row.amount)
                  : formatShortDate(row.at, locale)
              }
            />
          ))}
        </QueueCard>

        <QueueCard
          title={t('depositsTitle')}
          description={t('depositsDesc')}
          count={counts.pendingDeposits}
          emptyLabel={t('emptyQueue')}
          href="/admin/deposits"
          viewAllLabel={t('viewDeposits')}
          icon={HandCoins}
          accentClass="bg-emerald-500/15 text-emerald-800"
        >
          {queues.pendingDeposits.map((row) => (
            <PreviewRow
              key={row.id}
              primary={<AdminInvestorLink userId={row.userId}>{row.email || '—'}</AdminInvestorLink>}
              secondary={
                <AdminPropertyLink propertyId={row.propertyId}>{row.propertyLabel}</AdminPropertyLink>
              }
              meta={row.amount != null ? formatUsd(row.amount) : formatShortDate(row.at, locale)}
            />
          ))}
        </QueueCard>

        <QueueCard
          title={t('cashOutsTitle')}
          description={t('cashOutsDesc')}
          count={counts.pendingCashOuts}
          emptyLabel={t('emptyQueue')}
          href="/admin/cash-outs"
          viewAllLabel={t('viewCashOuts')}
          icon={Banknote}
          accentClass="bg-orange-500/15 text-orange-800"
        >
          {queues.pendingCashOuts.map((row) => (
            <PreviewRow
              key={row.id}
              primary={<AdminInvestorLink userId={row.userId}>{row.email || '—'}</AdminInvestorLink>}
              secondary={formatShortDate(row.at, locale)}
              meta={row.amount != null ? formatUsd(row.amount) : null}
            />
          ))}
        </QueueCard>

        <QueueCard
          title={t('reinvestsTitle')}
          description={t('reinvestsDesc')}
          count={counts.pendingReinvests}
          emptyLabel={t('emptyQueue')}
          href="/admin/reinvests"
          viewAllLabel={t('viewReinvests')}
          icon={Repeat2}
          accentClass="bg-teal-500/15 text-teal-800"
        >
          {queues.pendingReinvests.map((row) => (
            <PreviewRow
              key={row.id}
              primary={<AdminInvestorLink userId={row.userId}>{row.email || '—'}</AdminInvestorLink>}
              secondary={
                <AdminPropertyLink propertyId={row.propertyId}>{row.propertyLabel}</AdminPropertyLink>
              }
              meta={row.amount != null ? formatUsd(row.amount) : formatShortDate(row.at, locale)}
            />
          ))}
        </QueueCard>
      </div>
    </AdminPageFrame>
  )
}
