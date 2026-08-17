'use client'

import { useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatUsd } from '@/lib/formatMoney'
import { paginateItems } from '@/components/admin/AdminListPagination'

const ACTIVITY_PAGE_SIZE = 5

function statusClass(status) {
  if (status === 'PENDING') return 'bg-amber-500/15 text-amber-900'
  if (status === 'CONFIRMED' || status === 'ACTIVE') return 'bg-emerald-500/15 text-emerald-900'
  if (status === 'REJECTED' || status === 'VOIDED') return 'bg-destructive/10 text-destructive'
  return 'bg-muted text-foreground'
}

function activityLabel(t, item) {
  if (item.kind === 'RETURN_CREDIT') return t('activityCredit')
  if (item.kind === 'RETURN_VOIDED') return t('activityVoided')
  if (item.kind === 'CASH_OUT') return t('activityCashOut')
  if (item.kind === 'REINVEST') return t('activityReinvest')
  return item.kind
}

export default function WalletActivityList({ activity = [] }) {
  const t = useTranslations('ActivityPage')
  const locale = useLocale()
  const dateLocale = locale === 'es' ? 'es-ES' : 'en-US'
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [activity.length])

  const paged = paginateItems(activity, page, ACTIVITY_PAGE_SIZE)

  return (
    <div>
      <h3 className="text-sm font-semibold text-primary">{t('activityTitle')}</h3>

      {activity.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">{t('activityEmpty')}</p>
      ) : (
        <>
          <ul className="mt-3 divide-y divide-border/70 rounded-lg border border-border/70">
            {paged.items.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-start justify-between gap-2 px-3 py-3 text-sm"
              >
                <div className="min-w-0">
                  <p className="font-medium text-primary">{activityLabel(t, item)}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.at).toLocaleDateString(dateLocale)}
                    {item.property ? ` · #${item.property.investmentId} ${item.property.name}` : ''}
                    {item.concept ? ` · ${item.concept}` : ''}
                  </p>
                  {item.kind === 'CASH_OUT' && item.hasReceipt ? (
                    <a
                      href={`/api/cash-out-receipts/${item.sourceId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-block text-xs text-primary underline"
                    >
                      {t('viewBankNotice')}
                    </a>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold tabular-nums">{formatUsd(item.amount)}</span>
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold',
                      statusClass(item.status)
                    )}
                  >
                    {item.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          {paged.totalPages > 1 ? (
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                {t('activityPaginationRange', {
                  from: paged.from,
                  to: paged.to,
                  total: paged.total,
                })}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={paged.page <= 1}
                  onClick={() => setPage(paged.page - 1)}
                  className="gap-1"
                >
                  <ChevronLeft className="size-4" aria-hidden />
                  {t('activityPaginationPrev')}
                </Button>
                <span className="min-w-[5.5rem] text-center text-xs font-medium text-muted-foreground">
                  {t('activityPaginationPage', {
                    page: paged.page,
                    totalPages: paged.totalPages,
                  })}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={paged.page >= paged.totalPages}
                  onClick={() => setPage(paged.page + 1)}
                  className="gap-1"
                >
                  {t('activityPaginationNext')}
                  <ChevronRight className="size-4" aria-hidden />
                </Button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}
