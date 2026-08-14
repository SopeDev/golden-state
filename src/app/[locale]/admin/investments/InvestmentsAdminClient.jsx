'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { adminSelectClassName } from '@/lib/adminFormClasses'
import { matchesAdminQuery } from '@/lib/adminSearch'
import { cn } from '@/lib/utils'
import { formatUsd } from '@/lib/formatMoney'
import AdminFormattedNumberInput from '@/components/admin/AdminFormattedNumberInput'
import AdminListPagination, { paginateItems } from '@/components/admin/AdminListPagination'
import { AdminPageFrame, AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminInvestorLink, AdminPropertyLink } from '@/components/admin/AdminEntityLinks'
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
  section = 'intents',
  initialPropertyId = '',
}) {
  const t = useTranslations('Admin.investments')
  const tc = useTranslations('Admin.common')
  const { confirm, prompt } = useMessaging()

  const [contributions, setContributions] = useState(initialContributions || [])
  const [deposits, setDeposits] = useState(initialDeposits || [])
  const [query, setQuery] = useState('')
  const [propertyFilter, setPropertyFilter] = useState(initialPropertyId)
  const [investorFilter, setInvestorFilter] = useState('')
  const [intentStatusFilter, setIntentStatusFilter] = useState('MEETING_REQUESTED')
  const [contributionStatusFilter, setContributionStatusFilter] = useState('')
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
  const [listPage, setListPage] = useState(1)

  const pageTitle =
    section === 'intents'
      ? t('intentsTitle')
      : section === 'contributions'
        ? t('contributionsTitle')
        : t('depositsTitle')
  const pageSubtitle =
    section === 'intents'
      ? t('intentsDesc')
      : section === 'contributions'
        ? t('contributionsDesc')
        : t('depositsDesc')

  const refreshContributions = useCallback(async () => {
    const params = new URLSearchParams()
    if (propertyFilter) params.set('propertyId', propertyFilter)
    if (investorFilter === 'MANUAL') {
      params.set('source', 'MANUAL')
    } else if (investorFilter) {
      params.set('userId', investorFilter)
    }
    if (contributionStatusFilter) {
      params.set('status', contributionStatusFilter)
      if (contributionStatusFilter === 'CANCELLED') params.set('includeCancelled', '1')
    } else {
      params.set('includeCancelled', '1')
    }
    const res = await fetch(`/api/admin/funding-contributions?${params}`, {
      credentials: 'include',
    })
    if (!res.ok) throw new Error('Failed to load contributions')
    setContributions(await res.json())
  }, [propertyFilter, investorFilter, contributionStatusFilter])

  const refreshDeposits = useCallback(async () => {
    const params = new URLSearchParams()
    if (depositStatusFilter) params.set('status', depositStatusFilter)
    if (propertyFilter) params.set('propertyId', propertyFilter)
    if (investorFilter) params.set('userId', investorFilter)
    const res = await fetch(`/api/admin/deposit-requests?${params}`, {
      credentials: 'include',
    })
    if (!res.ok) throw new Error('Failed to load deposits')
    setDeposits(await res.json())
  }, [depositStatusFilter, propertyFilter, investorFilter])

  useEffect(() => {
    if (section === 'contributions') {
      refreshContributions().catch(() => setStatus(t('errorLoad')))
    } else if (section === 'deposits') {
      refreshDeposits().catch(() => setStatus(t('errorLoad')))
    }
  }, [section, refreshContributions, refreshDeposits, t])

  useEffect(() => {
    setListPage(1)
    setShowContributionForm(false)
    setShowDepositForm(false)
    setStatus('')
  }, [
    section,
    query,
    propertyFilter,
    investorFilter,
    intentStatusFilter,
    contributionStatusFilter,
    depositStatusFilter,
  ])

  const filteredContributions = useMemo(
    () =>
      contributions.filter((row) =>
        matchesAdminQuery(
          query,
          row.user?.email,
          row.label,
          row.note,
          row.property?.name,
          row.property?.investmentId,
          row.amount,
          row.source,
          row.status
        )
      ),
    [contributions, query]
  )

  const filteredDeposits = useMemo(
    () =>
      deposits.filter((row) =>
        matchesAdminQuery(
          query,
          row.user?.email,
          row.property?.name,
          row.property?.investmentId,
          row.amount,
          row.reference,
          row.status
        )
      ),
    [deposits, query]
  )

  const contributionPagination = useMemo(
    () => paginateItems(filteredContributions, listPage),
    [filteredContributions, listPage]
  )
  const depositPagination = useMemo(
    () => paginateItems(filteredDeposits, listPage),
    [filteredDeposits, listPage]
  )

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
    <AdminPageFrame>
      <AdminPageHeader
        className="mb-6"
        eyebrow={t('eyebrow')}
        title={pageTitle}
        description={pageSubtitle}
        actions={
          section !== 'intents' ? (
            <Button
              type="button"
              className="gap-1.5"
              onClick={() =>
                section === 'contributions'
                  ? setShowContributionForm((v) => !v)
                  : setShowDepositForm((v) => !v)
              }
            >
              <Plus className="size-4" aria-hidden />
              {section === 'contributions' ? t('addContribution') : t('addDeposit')}
            </Button>
          ) : null
        }
      />

      {status ? <p className="mb-4 text-sm text-muted-foreground">{status}</p> : null}

      <Card className="border-border/80 shadow-sm">
        <CardHeader className="space-y-3 border-b border-border/60 pb-4">
          <CardTitle className="text-base text-primary">
            {section === 'intents'
              ? t('tabIntents')
              : section === 'contributions'
                ? t('tabContributions')
                : t('tabDeposits')}
          </CardTitle>
          <div className="flex flex-row flex-wrap items-center gap-2 sm:flex-nowrap">
            <div className="relative min-w-0 flex-1">
              <Search
                className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="pl-8"
              />
            </div>
            <div className="flex shrink-0 flex-row flex-wrap items-center gap-2">
              <select
                className={adminSelectClassName('w-auto min-w-[12rem]')}
                value={propertyFilter}
                onChange={(e) => setPropertyFilter(e.target.value)}
                aria-label={t('property')}
              >
                <option value="">{t('allProperties')}</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    #{property.investmentId} · {property.name}
                  </option>
                ))}
              </select>
              <select
                className={adminSelectClassName('w-auto min-w-[14rem]')}
                value={investorFilter}
                onChange={(e) => setInvestorFilter(e.target.value)}
                aria-label={t('investor')}
              >
                <option value="">{t('allInvestors')}</option>
                {section === 'contributions' ? (
                  <option value="MANUAL">{t('sourceManual')}</option>
                ) : null}
                {investors.map((investor) => (
                  <option key={investor.id} value={String(investor.id)}>
                    {investor.email}
                  </option>
                ))}
              </select>
              {section === 'intents' ? (
                <select
                  className={adminSelectClassName('w-auto min-w-[12rem]')}
                  value={intentStatusFilter}
                  onChange={(e) => setIntentStatusFilter(e.target.value)}
                  aria-label={t('status')}
                >
                  <option value="">{t('allStatuses')}</option>
                  <option value="MEETING_REQUESTED">{t('intentMeetingRequested')}</option>
                  <option value="AWAITING_WIRE">{t('intentAwaitingWire')}</option>
                  <option value="READY">{t('intentReady')}</option>
                  <option value="COMPLETED">{t('intentCompleted')}</option>
                  <option value="CANCELLED">{t('intentCancelled')}</option>
                </select>
              ) : null}
              {section === 'contributions' ? (
                <select
                  className={adminSelectClassName('w-auto min-w-[10rem]')}
                  value={contributionStatusFilter}
                  onChange={(e) => setContributionStatusFilter(e.target.value)}
                  aria-label={t('status')}
                >
                  <option value="">{t('allStatuses')}</option>
                  <option value="ACTIVE">{t('statusActive')}</option>
                  <option value="CANCELLED">{t('statusCancelled')}</option>
                </select>
              ) : null}
              {section === 'deposits' ? (
                <select
                  className={adminSelectClassName('w-auto min-w-[10rem]')}
                  value={depositStatusFilter}
                  onChange={(e) => setDepositStatusFilter(e.target.value)}
                  aria-label={t('status')}
                >
                  <option value="">{t('allStatuses')}</option>
                  <option value="PENDING">{t('statusPending')}</option>
                  <option value="CONFIRMED">{t('statusConfirmed')}</option>
                  <option value="REJECTED">{t('statusRejected')}</option>
                </select>
              ) : null}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 p-0 pt-0 sm:p-0">
          <div className="space-y-6 p-4 sm:p-6">
          {section === 'intents' ? (
            <AdminInvestmentIntentsPanel
              propertyFilter={propertyFilter}
              investorFilter={investorFilter}
              statusFilter={intentStatusFilter}
              searchQuery={query}
              locale={locale}
            />
          ) : null}

          {section === 'contributions' && showContributionForm ? (
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

          {section === 'deposits' && showDepositForm ? (
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

          {section === 'contributions' ? (
            <>
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
                <tbody className="divide-y divide-border/60">
                  {filteredContributions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-2 py-8 text-center text-muted-foreground">
                        {t('emptyContributions')}
                      </td>
                    </tr>
                  ) : (
                    contributionPagination.items.map((row) => (
                      <tr key={row.id}>
                        <td className="px-2 py-3 whitespace-nowrap">
                          {new Date(row.createdAt).toLocaleDateString(
                            locale === 'es' ? 'es-ES' : 'en-US'
                          )}
                        </td>
                        <td className="px-2 py-3">
                          <AdminPropertyLink property={row.property} />
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
                          {row.source === 'MANUAL' ? (
                            row.label
                          ) : (
                            <AdminInvestorLink user={row.user} />
                          )}
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
            <AdminListPagination
              page={contributionPagination.page}
              totalPages={contributionPagination.totalPages}
              total={contributionPagination.total}
              from={contributionPagination.from}
              to={contributionPagination.to}
              onPageChange={setListPage}
            />
            </>
          ) : null}

          {section === 'deposits' ? (
            <>
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
                <tbody className="divide-y divide-border/60">
                  {filteredDeposits.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-2 py-8 text-center text-muted-foreground">
                        {t('emptyDeposits')}
                      </td>
                    </tr>
                  ) : (
                    depositPagination.items.map((row) => (
                      <tr key={row.id}>
                        <td className="px-2 py-3 whitespace-nowrap">
                          {new Date(row.createdAt).toLocaleDateString(
                            locale === 'es' ? 'es-ES' : 'en-US'
                          )}
                        </td>
                        <td className="px-2 py-3">
                          <AdminPropertyLink property={row.property} />
                        </td>
                        <td className="px-2 py-3">
                          <AdminInvestorLink user={row.user} />
                        </td>
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
            <AdminListPagination
              page={depositPagination.page}
              totalPages={depositPagination.totalPages}
              total={depositPagination.total}
              from={depositPagination.from}
              to={depositPagination.to}
              onPageChange={setListPage}
            />
            </>
          ) : null}
          </div>
        </CardContent>
      </Card>
    </AdminPageFrame>
  )
}
