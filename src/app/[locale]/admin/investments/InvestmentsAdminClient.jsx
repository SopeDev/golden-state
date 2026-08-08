'use client'

import { useCallback, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { adminSelectClassName } from '@/lib/adminFormClasses'
import { cn } from '@/lib/utils'
import { formatUsd } from '@/lib/formatMoney'
import AdminFormattedNumberInput from '@/components/admin/AdminFormattedNumberInput'
import AdminInvestmentIntentsPanel from './AdminInvestmentIntentsPanel'
import { useMessaging } from '@/hooks/useMessaging'

const emptyContributionForm = {
  source: 'INVESTOR',
  propertyId: '',
  userId: '',
  amount: '',
  label: '',
  note: '',
}

const emptyDepositForm = {
  propertyId: '',
  userId: '',
  amount: '',
  reference: '',
  depositedAt: '',
  confirmNow: false,
}

export default function InvestmentsAdminClient({
  initialContributions,
  initialDeposits,
  properties,
  investors,
  locale,
  initialTab = 'intents',
  initialPropertyId = '',
}) {
  const t = useTranslations('Admin.investments')
  const tc = useTranslations('Admin.common')
  const { confirm, prompt } = useMessaging()

  const [tab, setTab] = useState(initialTab)
  const [contributions, setContributions] = useState(initialContributions || [])
  const [deposits, setDeposits] = useState(initialDeposits || [])
  const [propertyFilter, setPropertyFilter] = useState(initialPropertyId)
  const [sourceFilter, setSourceFilter] = useState('')
  const [depositStatusFilter, setDepositStatusFilter] = useState('PENDING')
  const [showContributionForm, setShowContributionForm] = useState(false)
  const [showDepositForm, setShowDepositForm] = useState(false)
  const [contributionForm, setContributionForm] = useState(() => ({
    ...emptyContributionForm,
    propertyId: initialPropertyId || '',
  }))
  const [depositForm, setDepositForm] = useState(() => ({
    ...emptyDepositForm,
    propertyId: initialPropertyId || '',
  }))
  const [status, setStatus] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [meetingRequestCount, setMeetingRequestCount] = useState(0)
  const [pendingDepositCount, setPendingDepositCount] = useState(
    () => (initialDeposits || []).filter((d) => d.status === 'PENDING').length
  )

  const refreshPendingCounts = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/users/pending-count', { credentials: 'include' })
      if (!res.ok) return
      const data = await res.json()
      setMeetingRequestCount(data.meetingRequests ?? 0)
      setPendingDepositCount(data.pendingDeposits ?? 0)
    } catch {
      // ignore
    }
  }, [])

  const refreshContributions = useCallback(async () => {
    const params = new URLSearchParams({ includeCancelled: '1' })
    if (propertyFilter) params.set('propertyId', propertyFilter)
    if (sourceFilter) params.set('source', sourceFilter)
    const res = await fetch(`/api/admin/funding-contributions?${params}`, {
      credentials: 'include',
    })
    if (!res.ok) throw new Error('Failed to load contributions')
    setContributions(await res.json())
  }, [propertyFilter, sourceFilter])

  const refreshDeposits = useCallback(async () => {
    const params = new URLSearchParams()
    if (depositStatusFilter) params.set('status', depositStatusFilter)
    if (propertyFilter) params.set('propertyId', propertyFilter)
    const res = await fetch(`/api/admin/deposit-requests?${params}`, {
      credentials: 'include',
    })
    if (!res.ok) throw new Error('Failed to load deposits')
    setDeposits(await res.json())
  }, [depositStatusFilter, propertyFilter])

  useEffect(() => {
    if (tab === 'contributions') {
      refreshContributions().catch(() => setStatus(t('errorLoad')))
    } else if (tab === 'deposits') {
      refreshDeposits().catch(() => setStatus(t('errorLoad')))
    }
  }, [tab, refreshContributions, refreshDeposits, t])

  useEffect(() => {
    refreshPendingCounts()
    const onRefresh = () => refreshPendingCounts()
    window.addEventListener('admin-pending-count-changed', onRefresh)
    return () => window.removeEventListener('admin-pending-count-changed', onRefresh)
  }, [refreshPendingCounts])

  const submitContribution = async (event) => {
    event.preventDefault()
    setIsLoading(true)
    setStatus('')
    try {
      const res = await fetch('/api/admin/funding-contributions', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...contributionForm,
          amount: Number(contributionForm.amount),
          userId: contributionForm.source === 'INVESTOR' ? contributionForm.userId : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t('errorSave'))
      setContributionForm(emptyContributionForm)
      setShowContributionForm(false)
      setStatus(t('savedContribution'))
      await refreshContributions()
    } catch (error) {
      setStatus(error.message || t('errorSave'))
    } finally {
      setIsLoading(false)
    }
  }

  const cancelContribution = async (id) => {
    const confirmed = await confirm({
      message: t('confirmCancel'),
      variant: 'destructive',
    })
    if (!confirmed) return
    setIsLoading(true)
    setStatus('')
    try {
      const res = await fetch(`/api/admin/funding-contributions/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t('errorSave'))
      setStatus(t('cancelledContribution'))
      await refreshContributions()
    } catch (error) {
      setStatus(error.message || t('errorSave'))
    } finally {
      setIsLoading(false)
    }
  }

  const submitDeposit = async (event) => {
    event.preventDefault()
    setIsLoading(true)
    setStatus('')
    try {
      const res = await fetch('/api/admin/deposit-requests', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...depositForm,
          amount: Number(depositForm.amount),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t('errorSave'))
      setDepositForm(emptyDepositForm)
      setShowDepositForm(false)
      setDepositStatusFilter('PENDING')
      setStatus(t('savedDeposit'))
      await refreshDeposits()
    } catch (error) {
      setStatus(error.message || t('errorSave'))
    } finally {
      setIsLoading(false)
    }
  }

  const confirmDeposit = async (id) => {
    setIsLoading(true)
    setStatus('')
    try {
      const res = await fetch(`/api/admin/deposit-requests/${id}/confirm`, {
        method: 'POST',
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t('errorSave'))
      setStatus(t('confirmedDeposit'))
      await Promise.all([refreshDeposits(), refreshContributions()])
      window.dispatchEvent(new CustomEvent('admin-pending-count-changed'))
    } catch (error) {
      setStatus(error.message || t('errorSave'))
    } finally {
      setIsLoading(false)
    }
  }

  const rejectDeposit = async (id) => {
    const adminNote = await prompt({
      message: t('rejectNotePrompt'),
      label: t('rejectNoteLabel'),
      placeholder: t('rejectNotePlaceholder'),
    })
    if (adminNote === null) return
    setIsLoading(true)
    setStatus('')
    try {
      const res = await fetch(`/api/admin/deposit-requests/${id}/reject`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNote }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t('errorSave'))
      setStatus(t('rejectedDeposit'))
      await refreshDeposits()
      window.dispatchEvent(new CustomEvent('admin-pending-count-changed'))
    } catch (error) {
      setStatus(error.message || t('errorSave'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={tab === 'intents' ? 'default' : 'outline'}
          onClick={() => setTab('intents')}
        >
          {t('tabIntents')}
          {meetingRequestCount > 0 ? (
            <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-secondary-blue px-1.5 text-[10px] font-bold text-white">
              {meetingRequestCount > 99 ? '99+' : meetingRequestCount}
            </span>
          ) : null}
        </Button>
        <Button
          type="button"
          variant={tab === 'deposits' ? 'default' : 'outline'}
          onClick={() => setTab('deposits')}
        >
          {t('tabDeposits')}
          {pendingDepositCount > 0 ? (
            <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-secondary-blue px-1.5 text-[10px] font-bold text-white">
              {pendingDepositCount > 99 ? '99+' : pendingDepositCount}
            </span>
          ) : null}
        </Button>
        <Button
          type="button"
          variant={tab === 'contributions' ? 'default' : 'outline'}
          onClick={() => setTab('contributions')}
        >
          {t('tabContributions')}
        </Button>
      </div>

      {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}

      <Card>
        <CardHeader className="flex flex-col gap-4 border-b border-border/60 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle className="font-heading text-xl text-primary">
              {tab === 'intents'
                ? t('intentsTitle')
                : tab === 'contributions'
                  ? t('contributionsTitle')
                  : t('depositsTitle')}
            </CardTitle>
            <CardDescription>
              {tab === 'intents'
                ? t('intentsDesc')
                : tab === 'contributions'
                  ? t('contributionsDesc')
                  : t('depositsDesc')}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              className={adminSelectClassName('w-full min-w-[12rem] sm:w-auto')}
              value={propertyFilter}
              onChange={(e) => setPropertyFilter(e.target.value)}
            >
              <option value="">{t('allProperties')}</option>
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  #{property.investmentId} · {property.name}
                </option>
              ))}
            </select>
            {tab === 'contributions' ? (
              <select
                className={adminSelectClassName('w-full min-w-[10rem] sm:w-auto')}
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
              >
                <option value="">{t('allSources')}</option>
                <option value="INVESTOR">{t('sourceInvestor')}</option>
                <option value="MANUAL">{t('sourceManual')}</option>
              </select>
            ) : null}
            {tab === 'deposits' ? (
              <select
                className={adminSelectClassName('w-full min-w-[10rem] sm:w-auto')}
                value={depositStatusFilter}
                onChange={(e) => setDepositStatusFilter(e.target.value)}
              >
                <option value="">{t('allStatuses')}</option>
                <option value="PENDING">{t('statusPending')}</option>
                <option value="CONFIRMED">{t('statusConfirmed')}</option>
                <option value="REJECTED">{t('statusRejected')}</option>
              </select>
            ) : null}
            {tab !== 'intents' ? (
              <Button
                type="button"
                onClick={() =>
                  tab === 'contributions'
                    ? setShowContributionForm((v) => !v)
                    : setShowDepositForm((v) => !v)
                }
              >
                <Plus className="size-4" aria-hidden />
                {tab === 'contributions' ? t('addContribution') : t('addDeposit')}
              </Button>
            ) : null}
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {tab === 'intents' ? (
            <AdminInvestmentIntentsPanel propertyFilter={propertyFilter} locale={locale} />
          ) : null}

          {tab === 'contributions' && showContributionForm ? (
            <form
              onSubmit={submitContribution}
              className="grid gap-4 rounded-lg border border-border/70 p-4 md:grid-cols-2"
            >
              <div className="space-y-2">
                <Label htmlFor="source">{t('source')}</Label>
                <select
                  id="source"
                  className={adminSelectClassName()}
                  value={contributionForm.source}
                  onChange={(e) =>
                    setContributionForm((prev) => ({ ...prev, source: e.target.value }))
                  }
                >
                  <option value="INVESTOR">{t('sourceInvestor')}</option>
                  <option value="MANUAL">{t('sourceManual')}</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="propertyId">{t('property')}</Label>
                <select
                  id="propertyId"
                  required
                  className={adminSelectClassName()}
                  value={contributionForm.propertyId}
                  onChange={(e) =>
                    setContributionForm((prev) => ({ ...prev, propertyId: e.target.value }))
                  }
                >
                  <option value="">{t('selectProperty')}</option>
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      #{property.investmentId} · {property.name}
                    </option>
                  ))}
                </select>
              </div>
              {contributionForm.source === 'INVESTOR' ? (
                <div className="space-y-2">
                  <Label htmlFor="userId">{t('investor')}</Label>
                  <select
                    id="userId"
                    required
                    className={adminSelectClassName()}
                    value={contributionForm.userId}
                    onChange={(e) =>
                      setContributionForm((prev) => ({ ...prev, userId: e.target.value }))
                    }
                  >
                    <option value="">{t('selectInvestor')}</option>
                    {investors.map((investor) => (
                      <option key={investor.id} value={investor.id}>
                        {investor.email}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="label">{t('manualLabel')}</Label>
                  <Input
                    id="label"
                    required
                    value={contributionForm.label}
                    onChange={(e) =>
                      setContributionForm((prev) => ({ ...prev, label: e.target.value }))
                    }
                    placeholder={t('manualLabelPlaceholder')}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="amount">{t('amount')}</Label>
                <AdminFormattedNumberInput
                  id="amount"
                  name="amount"
                  required
                  value={contributionForm.amount}
                  onChange={(e) =>
                    setContributionForm((prev) => ({ ...prev, amount: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="note">{t('note')}</Label>
                <Textarea
                  id="note"
                  value={contributionForm.note}
                  onChange={(e) =>
                    setContributionForm((prev) => ({ ...prev, note: e.target.value }))
                  }
                  rows={2}
                />
              </div>
              <div className="flex gap-2 md:col-span-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? tc('saving') : t('saveContribution')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowContributionForm(false)}
                >
                  {tc('cancel')}
                </Button>
              </div>
            </form>
          ) : null}

          {tab === 'deposits' && showDepositForm ? (
            <form
              onSubmit={submitDeposit}
              className="grid gap-4 rounded-lg border border-border/70 p-4 md:grid-cols-2"
            >
              <div className="space-y-2">
                <Label htmlFor="depositProperty">{t('property')}</Label>
                <select
                  id="depositProperty"
                  required
                  className={adminSelectClassName()}
                  value={depositForm.propertyId}
                  onChange={(e) =>
                    setDepositForm((prev) => ({ ...prev, propertyId: e.target.value }))
                  }
                >
                  <option value="">{t('selectProperty')}</option>
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      #{property.investmentId} · {property.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="depositUser">{t('investor')}</Label>
                <select
                  id="depositUser"
                  required
                  className={adminSelectClassName()}
                  value={depositForm.userId}
                  onChange={(e) =>
                    setDepositForm((prev) => ({ ...prev, userId: e.target.value }))
                  }
                >
                  <option value="">{t('selectInvestor')}</option>
                  {investors.map((investor) => (
                    <option key={investor.id} value={investor.id}>
                      {investor.email}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="depositAmount">{t('amount')}</Label>
                <AdminFormattedNumberInput
                  id="depositAmount"
                  name="depositAmount"
                  required
                  value={depositForm.amount}
                  onChange={(e) =>
                    setDepositForm((prev) => ({ ...prev, amount: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="depositDate">{t('depositedAt')}</Label>
                <Input
                  id="depositDate"
                  type="date"
                  value={depositForm.depositedAt}
                  onChange={(e) =>
                    setDepositForm((prev) => ({ ...prev, depositedAt: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="depositRef">{t('reference')}</Label>
                <Input
                  id="depositRef"
                  value={depositForm.reference}
                  onChange={(e) =>
                    setDepositForm((prev) => ({ ...prev, reference: e.target.value }))
                  }
                  placeholder={t('referencePlaceholder')}
                />
              </div>
              <label className="flex items-center gap-2 text-sm md:col-span-2">
                <input
                  type="checkbox"
                  checked={depositForm.confirmNow}
                  onChange={(e) =>
                    setDepositForm((prev) => ({ ...prev, confirmNow: e.target.checked }))
                  }
                />
                {t('confirmNowLive')}
              </label>
              <div className="flex gap-2 md:col-span-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? tc('saving') : t('saveDeposit')}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowDepositForm(false)}>
                  {tc('cancel')}
                </Button>
              </div>
            </form>
          ) : null}

          {tab === 'contributions' ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[40rem] text-left text-sm">
                <thead className="border-b border-border text-muted-foreground">
                  <tr>
                    <th className="px-2 py-2 font-medium">{t('colDate')}</th>
                    <th className="px-2 py-2 font-medium">{t('property')}</th>
                    <th className="px-2 py-2 font-medium">{t('party')}</th>
                    <th className="px-2 py-2 font-medium">{t('amount')}</th>
                    <th className="px-2 py-2 font-medium">{t('status')}</th>
                    <th className="px-2 py-2 font-medium">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {contributions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-2 py-8 text-center text-muted-foreground">
                        {t('emptyContributions')}
                      </td>
                    </tr>
                  ) : (
                    contributions.map((row) => (
                      <tr key={row.id} className="border-b border-border/60">
                        <td className="px-2 py-3 whitespace-nowrap">
                          {new Date(row.createdAt).toLocaleDateString(
                            locale === 'es' ? 'es-ES' : 'en-US'
                          )}
                        </td>
                        <td className="px-2 py-3">
                          #{row.property?.investmentId} · {row.property?.name}
                        </td>
                        <td className="px-2 py-3">
                          <span
                            className={cn(
                              'mr-2 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold',
                              row.source === 'MANUAL'
                                ? 'bg-muted text-foreground'
                                : 'bg-main-gold/20 text-primary'
                            )}
                          >
                            {row.source === 'MANUAL' ? t('sourceManual') : t('sourceInvestor')}
                          </span>
                          {row.source === 'MANUAL'
                            ? row.label
                            : row.user?.email || '—'}
                        </td>
                        <td className="px-2 py-3 font-medium">
                          {formatUsd(row.amount)}
                        </td>
                        <td className="px-2 py-3">
                          {row.status === 'ACTIVE' ? t('statusActive') : t('statusCancelled')}
                        </td>
                        <td className="px-2 py-3">
                          {row.status === 'ACTIVE' ? (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={isLoading}
                              onClick={() => cancelContribution(row.id)}
                            >
                              {t('cancelContribution')}
                            </Button>
                          ) : (
                            '—'
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : null}

          {tab === 'deposits' ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[40rem] text-left text-sm">
                <thead className="border-b border-border text-muted-foreground">
                  <tr>
                    <th className="px-2 py-2 font-medium">{t('colDate')}</th>
                    <th className="px-2 py-2 font-medium">{t('property')}</th>
                    <th className="px-2 py-2 font-medium">{t('investor')}</th>
                    <th className="px-2 py-2 font-medium">{t('amount')}</th>
                    <th className="px-2 py-2 font-medium">{t('reference')}</th>
                    <th className="px-2 py-2 font-medium">{t('status')}</th>
                    <th className="px-2 py-2 font-medium">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {deposits.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-2 py-8 text-center text-muted-foreground">
                        {t('emptyDeposits')}
                      </td>
                    </tr>
                  ) : (
                    deposits.map((row) => (
                      <tr key={row.id} className="border-b border-border/60">
                        <td className="px-2 py-3 whitespace-nowrap">
                          {new Date(row.createdAt).toLocaleDateString(
                            locale === 'es' ? 'es-ES' : 'en-US'
                          )}
                        </td>
                        <td className="px-2 py-3">
                          #{row.property?.investmentId} · {row.property?.name}
                        </td>
                        <td className="px-2 py-3">{row.user?.email}</td>
                        <td className="px-2 py-3 font-medium">
                          {formatUsd(row.amount)}
                        </td>
                        <td className="px-2 py-3">
                          <div className="space-y-1">
                            <div>{row.reference || '—'}</div>
                            {row.hasReceipt ? (
                              <a
                                href={`/api/deposit-receipts/${row.id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-primary underline"
                              >
                                {t('viewReceipt')}
                              </a>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-2 py-3">
                          {row.status === 'PENDING'
                            ? t('statusPending')
                            : row.status === 'CONFIRMED'
                              ? t('statusConfirmed')
                              : t('statusRejected')}
                        </td>
                        <td className="px-2 py-3">
                          {row.status === 'PENDING' ? (
                            <div className="flex flex-wrap gap-2">
                              <Button
                                type="button"
                                size="sm"
                                disabled={isLoading}
                                onClick={() => confirmDeposit(row.id)}
                              >
                                {t('confirm')}
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                disabled={isLoading}
                                onClick={() => rejectDeposit(row.id)}
                              >
                                {t('reject')}
                              </Button>
                            </div>
                          ) : (
                            '—'
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
