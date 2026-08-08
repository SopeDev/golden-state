'use client'

import { useCallback, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { adminSelectClassName } from '@/lib/adminFormClasses'
import { formatUsd } from '@/lib/formatMoney'
import { meetingChannelLabelKey } from '@/lib/investMeetingLinks'

export default function AdminInvestmentIntentsPanel({ propertyFilter, locale }) {
  const t = useTranslations('Admin.investments')
  const [intents, setIntents] = useState([])
  const [statusFilter, setStatusFilter] = useState('MEETING_REQUESTED')
  const [status, setStatus] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const refresh = useCallback(async () => {
    const params = new URLSearchParams()
    if (statusFilter) params.set('status', statusFilter)
    if (propertyFilter) params.set('propertyId', propertyFilter)
    const res = await fetch(`/api/admin/investment-intents?${params}`, {
      credentials: 'include',
    })
    if (!res.ok) throw new Error('Failed')
    setIntents(await res.json())
  }, [statusFilter, propertyFilter])

  useEffect(() => {
    refresh().catch(() => setStatus(t('errorLoad')))
  }, [refresh, t])

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
      <div className="flex flex-wrap gap-2">
        <select
          className={adminSelectClassName('w-full min-w-[12rem] sm:w-auto')}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">{t('allStatuses')}</option>
          <option value="MEETING_REQUESTED">{t('intentMeetingRequested')}</option>
          <option value="AWAITING_WIRE">{t('intentAwaitingWire')}</option>
          <option value="READY">{t('intentReady')}</option>
          <option value="COMPLETED">{t('intentCompleted')}</option>
          <option value="CANCELLED">{t('intentCancelled')}</option>
        </select>
      </div>

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
          <tbody>
            {intents.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-2 py-8 text-center text-muted-foreground">
                  {t('emptyIntents')}
                </td>
              </tr>
            ) : (
              intents.map((row) => (
                <tr key={row.id} className="border-b border-border/60">
                  <td className="px-2 py-3 whitespace-nowrap">
                    {new Date(row.meetingRequestedAt || row.updatedAt).toLocaleDateString(
                      locale === 'es' ? 'es-ES' : 'en-US'
                    )}
                  </td>
                  <td className="px-2 py-3">{row.user?.email}</td>
                  <td className="px-2 py-3">
                    #{row.property?.investmentId} · {row.property?.name}
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
    </div>
  )
}
