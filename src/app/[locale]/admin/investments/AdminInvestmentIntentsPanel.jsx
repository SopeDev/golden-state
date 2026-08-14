'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { formatUsd } from '@/lib/formatMoney'
import { matchesAdminQuery } from '@/lib/adminSearch'
import { meetingChannelLabelKey } from '@/lib/investMeetingLinks'
import AdminListPagination, { paginateItems } from '@/components/admin/AdminListPagination'
import { AdminInvestorLink, AdminPropertyLink } from '@/components/admin/AdminEntityLinks'

export default function AdminInvestmentIntentsPanel({
  propertyFilter,
  investorFilter = '',
  statusFilter = 'MEETING_REQUESTED',
  searchQuery = '',
  locale,
}) {
  const t = useTranslations('Admin.investments')
  const [intents, setIntents] = useState([])
  const [status, setStatus] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [page, setPage] = useState(1)

  const refresh = useCallback(async () => {
    const params = new URLSearchParams()
    if (statusFilter) params.set('status', statusFilter)
    if (propertyFilter) params.set('propertyId', propertyFilter)
    if (investorFilter) params.set('userId', investorFilter)
    const res = await fetch(`/api/admin/investment-intents?${params}`, {
      credentials: 'include',
    })
    if (!res.ok) throw new Error('Failed')
    setIntents(await res.json())
  }, [statusFilter, propertyFilter, investorFilter])

  useEffect(() => {
    refresh().catch(() => setStatus(t('errorLoad')))
  }, [refresh, t])

  useEffect(() => {
    setPage(1)
  }, [statusFilter, propertyFilter, investorFilter, searchQuery])

  const filteredIntents = useMemo(
    () =>
      intents.filter((row) =>
        matchesAdminQuery(
          searchQuery,
          row.user?.email,
          row.property?.name,
          row.property?.investmentId,
          row.intendedAmount,
          row.status,
          row.meetingChannel
        )
      ),
    [intents, searchQuery]
  )

  const pagination = useMemo(() => paginateItems(filteredIntents, page), [filteredIntents, page])

  const setIntentStatus = async (id, nextStatus) => {
    setIsLoading(true)
    setStatus('')
    try {
      const res = await fetch(`/api/admin/investment-intents/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t('errorSave'))
      setStatus(t('intentUpdated'))
      await refresh()
      window.dispatchEvent(new CustomEvent('admin-pending-count-changed'))
    } catch (error) {
      setStatus(error.message || t('errorSave'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="border-b border-border text-muted-foreground">
            <tr>
              <th className="px-2 py-2 font-medium">{t('colDate')}</th>
              <th className="px-2 py-2 font-medium">{t('investor')}</th>
              <th className="px-2 py-2 font-medium">{t('property')}</th>
              <th className="px-2 py-2 font-medium">{t('channel')}</th>
              <th className="px-2 py-2 font-medium">{t('intendedAmount')}</th>
              <th className="px-2 py-2 font-medium">{t('status')}</th>
              <th className="px-2 py-2 font-medium">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {filteredIntents.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-2 py-8 text-center text-muted-foreground">
                  {t('emptyIntents')}
                </td>
              </tr>
            ) : (
              pagination.items.map((row) => (
                <tr key={row.id}>
                  <td className="px-2 py-3 whitespace-nowrap">
                    {new Date(row.meetingRequestedAt || row.updatedAt).toLocaleDateString(
                      locale === 'es' ? 'es-ES' : 'en-US'
                    )}
                  </td>
                  <td className="px-2 py-3">
                    <AdminInvestorLink user={row.user} />
                  </td>
                  <td className="px-2 py-3">
                    <AdminPropertyLink property={row.property} />
                  </td>
                  <td className="px-2 py-3">
                    {(() => {
                      const key = meetingChannelLabelKey(row.channel)
                      return key && t.has(key) ? t(key) : row.channel || '—'
                    })()}
                  </td>
                  <td className="px-2 py-3">
                    {row.intendedAmount
                      ? formatUsd(row.intendedAmount)
                      : '—'}
                  </td>
                  <td className="px-2 py-3">{row.status}</td>
                  <td className="px-2 py-3">
                    <div className="flex flex-wrap gap-2">
                      {row.status === 'MEETING_REQUESTED' ? (
                        <Button
                          type="button"
                          size="sm"
                          disabled={isLoading}
                          onClick={() => setIntentStatus(row.id, 'AWAITING_WIRE')}
                        >
                          {t('markAwaitingWire')}
                        </Button>
                      ) : null}
                      {row.status !== 'CANCELLED' && row.status !== 'COMPLETED' ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={isLoading}
                          onClick={() => setIntentStatus(row.id, 'CANCELLED')}
                        >
                          {t('cancelIntent')}
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <AdminListPagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        from={pagination.from}
        to={pagination.to}
        onPageChange={setPage}
      />
    </div>
  )
}
