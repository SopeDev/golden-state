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
import { useMessaging } from '@/hooks/useMessaging'

const emptyForm = {
  userId: '',
  propertyId: '',
  amount: '',
  concept: '',
  note: '',
  distributedAt: '',
}

function statusBadgeClass(status) {
  if (status === 'PENDING') return 'bg-amber-500/15 text-amber-900'
  if (status === 'CONFIRMED') return 'bg-emerald-500/15 text-emerald-900'
  if (status === 'REJECTED' || status === 'VOIDED') return 'bg-destructive/10 text-destructive'
  return 'bg-muted text-foreground'
}

export default function ReturnsAdminClient({
  initialDistributions,
  initialCashOuts,
  initialReinvests,
  investors,
  properties = [],
  locale,
  section = 'distributions',
}) {
  const t = useTranslations('Admin.returns')
  const tc = useTranslations('Admin.common')
  const { confirm, prompt } = useMessaging()

  const [distributions, setDistributions] = useState(initialDistributions || [])
  const [cashOuts, setCashOuts] = useState(initialCashOuts || [])
  const [reinvests, setReinvests] = useState(initialReinvests || [])
  const [statusFilter, setStatusFilter] = useState(
    section === 'distributions' ? '' : 'PENDING'
  )
  const [propertyFilter, setPropertyFilter] = useState('')
  const [investorFilter, setInvestorFilter] = useState('')
  const [query, setQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [holdingProperties, setHoldingProperties] = useState([])
  const [status, setStatus] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [listPage, setListPage] = useState(1)

  const pageTitle =
    section === 'distributions'
      ? t('distributionsTitle')
      : section === 'cashouts'
        ? t('cashOutsTitle')
        : t('reinvestsTitle')
  const pageSubtitle =
    section === 'distributions'
      ? t('distributionsDesc')
      : section === 'cashouts'
        ? t('cashOutsDesc')
        : t('reinvestsDesc')

  const refreshDistributions = useCallback(async () => {
    const params = new URLSearchParams({ includeVoided: '1' })
    if (statusFilter) params.set('status', statusFilter)
    if (propertyFilter) params.set('propertyId', propertyFilter)
    if (investorFilter) params.set('userId', investorFilter)
    const res = await fetch(`/api/admin/return-distributions?${params}`, {
      credentials: 'include',
    })
    if (!res.ok) throw new Error('Failed to load distributions')
    setDistributions(await res.json())
  }, [statusFilter, propertyFilter, investorFilter])

  const refreshCashOuts = useCallback(async () => {
    const params = new URLSearchParams()
    if (statusFilter) params.set('status', statusFilter)
    if (investorFilter) params.set('userId', investorFilter)
    const res = await fetch(`/api/admin/cash-out-requests?${params}`, {
      credentials: 'include',
    })
    if (!res.ok) throw new Error('Failed to load cash-outs')
    setCashOuts(await res.json())
  }, [statusFilter, investorFilter])

  const refreshReinvests = useCallback(async () => {
    const params = new URLSearchParams()
    if (statusFilter) params.set('status', statusFilter)
    if (propertyFilter) params.set('propertyId', propertyFilter)
    if (investorFilter) params.set('userId', investorFilter)
    const res = await fetch(`/api/admin/reinvest-requests?${params}`, {
      credentials: 'include',
    })
    if (!res.ok) throw new Error('Failed to load reinvests')
    setReinvests(await res.json())
  }, [statusFilter, propertyFilter, investorFilter])

  useEffect(() => {
    setListPage(1)
  }, [statusFilter, propertyFilter, investorFilter, query, section])

  useEffect(() => {
    setPropertyFilter('')
    setInvestorFilter('')
    setQuery('')
    setStatusFilter(section === 'distributions' ? '' : 'PENDING')
  }, [section])

  useEffect(() => {
    const load = async () => {
      try {
        if (section === 'distributions') await refreshDistributions()
        else if (section === 'cashouts') await refreshCashOuts()
        else await refreshReinvests()
      } catch {
        setStatus(t('errorLoad'))
      }
    }
    load()
  }, [section, refreshDistributions, refreshCashOuts, refreshReinvests, t])

  useEffect(() => {
    if (!form.userId) {
      setHoldingProperties([])
      setForm((prev) => ({ ...prev, propertyId: '' }))
      return
    }
    let cancelled = false
    fetch(`/api/admin/investors/${form.userId}/holdings`, { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed')
        const data = await res.json()
        if (!cancelled) {
          setHoldingProperties(data)
          setForm((prev) => {
            if (data.some((p) => p.id === prev.propertyId)) return prev
            return { ...prev, propertyId: '' }
          })
        }
      })
      .catch(() => {
        if (!cancelled) setHoldingProperties([])
      })
    return () => {
      cancelled = true
    }
  }, [form.userId])

  const filteredDistributions = useMemo(() => {
    let rows = distributions
    if (statusFilter) rows = rows.filter((row) => row.status === statusFilter)
    return rows.filter((row) =>
      matchesAdminQuery(
        query,
        row.user?.email,
        row.property?.name,
        row.property?.investmentId,
        row.concept,
        row.note,
        row.amount,
        row.status
      )
    )
  }, [distributions, statusFilter, query])

  const filteredCashOuts = useMemo(
    () =>
      cashOuts.filter((row) =>
        matchesAdminQuery(query, row.user?.email, row.amount, row.status, row.adminNote)
      ),
    [cashOuts, query]
  )

  const filteredReinvests = useMemo(
    () =>
      reinvests.filter((row) =>
        matchesAdminQuery(
          query,
          row.user?.email,
          row.destinationProperty?.name,
          row.destinationProperty?.investmentId,
          row.amount,
          row.status,
          row.adminNote
        )
      ),
    [reinvests, query]
  )

  const listRows =
    section === 'distributions'
      ? filteredDistributions
      : section === 'cashouts'
        ? filteredCashOuts
        : filteredReinvests

  const pagination = useMemo(
    () => paginateItems(listRows, listPage),
    [listRows, listPage]
  )

  const notifyPending = () => {
    window.dispatchEvent(new Event('admin-pending-count-changed'))
  }

  const submitDistribution = async (event) => {
    event.preventDefault()
    setIsLoading(true)
    setStatus('')
    try {
      const res = await fetch('/api/admin/return-distributions', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: form.userId,
          propertyId: form.propertyId,
          amount: Number(String(form.amount).replace(/,/g, '')),
          concept: form.concept,
          note: form.note,
          distributedAt: form.distributedAt || undefined,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || t('errorSave'))
      setForm(emptyForm)
      setShowForm(false)
      setStatus(t('savedDistribution'))
      await refreshDistributions()
    } catch (err) {
      setStatus(err.message || t('errorSave'))
    } finally {
      setIsLoading(false)
    }
  }

  const voidDistribution = async (id) => {
    const ok = await confirm({
      message: t('voidConfirm'),
      variant: 'destructive',
    })
    if (!ok) return
    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/return-distributions/${id}/void`, {
        method: 'POST',
        credentials: 'include',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || t('errorVoid'))
      setStatus(t('voidedDistribution'))
      await refreshDistributions()
    } catch (err) {
      setStatus(err.message || t('errorVoid'))
    } finally {
      setIsLoading(false)
    }
  }

  const reviewCashOut = async (id, action) => {
    let adminNote = null
    if (action === 'reject') {
      adminNote = await prompt({
        message: t('rejectNotePrompt'),
        label: t('rejectNoteLabel'),
      })
      if (adminNote === null) return
    } else {
      const ok = await confirm({
        message: t('confirmCashOutDesc'),
      })
      if (!ok) return
    }

    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/cash-out-requests/${id}/${action}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNote }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || t('errorReview'))
      setStatus(action === 'confirm' ? t('confirmedCashOut') : t('rejectedCashOut'))
      await refreshCashOuts()
      notifyPending()
    } catch (err) {
      setStatus(err.message || t('errorReview'))
    } finally {
      setIsLoading(false)
    }
  }

  const reviewReinvest = async (id, action) => {
    let adminNote = null
    if (action === 'reject') {
      adminNote = await prompt({
        message: t('rejectNotePrompt'),
        label: t('rejectNoteLabel'),
      })
      if (adminNote === null) return
    } else {
      const ok = await confirm({
        message: t('confirmReinvestDesc'),
      })
      if (!ok) return
    }

    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/reinvest-requests/${id}/${action}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNote }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || t('errorReview'))
      setStatus(action === 'confirm' ? t('confirmedReinvest') : t('rejectedReinvest'))
      await refreshReinvests()
      notifyPending()
    } catch (err) {
      setStatus(err.message || t('errorReview'))
    } finally {
      setIsLoading(false)
    }
  }

  const dateLocale = locale === 'es' ? 'es-ES' : 'en-US'

  return (
    <AdminPageFrame>
      <AdminPageHeader
        eyebrow={t('eyebrow')}
        title={pageTitle}
        description={pageSubtitle}
        actions={
          section === 'distributions' ? (
            <Button type="button" onClick={() => setShowForm((v) => !v)}>
              <Plus className="size-4" />
              {t('assignReturn')}
            </Button>
          ) : null
        }
      />

      {status ? (
        <p className="mt-4 text-sm text-muted-foreground" role="status">
          {status}
        </p>
      ) : null}

      <Card className="mt-6 border-border/80 shadow-sm">
        <CardHeader className="space-y-3 border-b border-border/60 pb-4">
          <CardTitle className="text-base font-semibold text-primary">{pageTitle}</CardTitle>
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
              {section !== 'cashouts' ? (
                <select
                  className={adminSelectClassName('h-9 w-auto min-w-[12rem]')}
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
              ) : null}
              <select
                className={adminSelectClassName('h-9 w-auto min-w-[14rem]')}
                value={investorFilter}
                onChange={(e) => setInvestorFilter(e.target.value)}
                aria-label={t('investor')}
              >
                <option value="">{t('allInvestors')}</option>
                {investors.map((investor) => (
                  <option key={investor.id} value={String(investor.id)}>
                    {investor.email}
                  </option>
                ))}
              </select>
              <Label htmlFor="statusFilter" className="sr-only">
                {t('status')}
              </Label>
              <select
                id="statusFilter"
                className={adminSelectClassName('h-9 w-auto min-w-[10rem]')}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">{t('allStatuses')}</option>
                {section === 'distributions' ? (
                  <>
                    <option value="ACTIVE">{t('statusActive')}</option>
                    <option value="VOIDED">{t('statusVoided')}</option>
                  </>
                ) : (
                  <>
                    <option value="PENDING">{t('statusPending')}</option>
                    <option value="CONFIRMED">{t('statusConfirmed')}</option>
                    <option value="REJECTED">{t('statusRejected')}</option>
                  </>
                )}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {section === 'distributions' && showForm ? (
            <form
              onSubmit={submitDistribution}
              className="grid gap-4 rounded-lg border border-border/70 p-4 md:grid-cols-2"
            >
              <div className="space-y-2">
                <Label htmlFor="investor">{t('investor')}</Label>
                <select
                  id="investor"
                  required
                  className={adminSelectClassName()}
                  value={form.userId}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, userId: e.target.value }))
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
                <Label htmlFor="property">{t('property')}</Label>
                <select
                  id="property"
                  required
                  className={adminSelectClassName()}
                  value={form.propertyId}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, propertyId: e.target.value }))
                  }
                  disabled={!form.userId}
                >
                  <option value="">
                    {form.userId ? t('selectProperty') : t('selectInvestorFirst')}
                  </option>
                  {holdingProperties.map((property) => (
                    <option key={property.id} value={property.id}>
                      #{property.investmentId} · {property.name}
                    </option>
                  ))}
                </select>
                {form.userId && holdingProperties.length === 0 ? (
                  <p className="text-xs text-muted-foreground">{t('noHoldings')}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">{t('amount')}</Label>
                <AdminFormattedNumberInput
                  id="amount"
                  name="amount"
                  required
                  value={form.amount}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, amount: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="distributedAt">{t('distributedAt')}</Label>
                <Input
                  id="distributedAt"
                  type="date"
                  value={form.distributedAt}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, distributedAt: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="concept">{t('concept')}</Label>
                <Input
                  id="concept"
                  value={form.concept}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, concept: e.target.value }))
                  }
                  placeholder={t('conceptPlaceholder')}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="note">{t('note')}</Label>
                <Textarea
                  id="note"
                  rows={2}
                  value={form.note}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, note: e.target.value }))
                  }
                />
              </div>
              <div className="flex gap-2 md:col-span-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? tc('saving') : t('saveDistribution')}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  {tc('cancel')}
                </Button>
              </div>
            </form>
          ) : null}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead className="border-b border-border text-muted-foreground">
                <tr>
                  <th className="px-2 py-2 font-medium">{t('colDate')}</th>
                  {section === 'distributions' || section === 'reinvests' ? (
                    <th className="px-2 py-2 font-medium">{t('property')}</th>
                  ) : null}
                  <th className="px-2 py-2 font-medium">{t('investor')}</th>
                  <th className="px-2 py-2 font-medium">{t('amount')}</th>
                  <th className="px-2 py-2 font-medium">{t('status')}</th>
                  <th className="px-2 py-2 font-medium">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {pagination.items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={section === 'cashouts' ? 5 : 6}
                      className="px-2 py-8 text-center text-muted-foreground"
                    >
                      {section === 'distributions'
                        ? t('emptyDistributions')
                        : section === 'cashouts'
                          ? t('emptyCashOuts')
                          : t('emptyReinvests')}
                    </td>
                  </tr>
                ) : section === 'distributions' ? (
                  pagination.items.map((row) => (
                    <tr key={row.id}>
                      <td className="whitespace-nowrap px-2 py-3">
                        {new Date(row.distributedAt).toLocaleDateString(dateLocale)}
                      </td>
                      <td className="px-2 py-3">
                        <AdminPropertyLink property={row.property} />
                        {row.concept ? (
                          <p className="text-xs text-muted-foreground">{row.concept}</p>
                        ) : null}
                      </td>
                      <td className="px-2 py-3">
                        <AdminInvestorLink user={row.user} />
                      </td>
                      <td className="px-2 py-3 font-medium">{formatUsd(row.amount)}</td>
                      <td className="px-2 py-3">
                        <span
                          className={cn(
                            'inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold',
                            statusBadgeClass(row.status)
                          )}
                        >
                          {row.status === 'VOIDED' ? t('statusVoided') : t('statusActive')}
                        </span>
                      </td>
                      <td className="px-2 py-3">
                        {row.status === 'ACTIVE' ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={isLoading}
                            onClick={() => voidDistribution(row.id)}
                          >
                            {t('void')}
                          </Button>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))
                ) : section === 'cashouts' ? (
                  pagination.items.map((row) => (
                    <tr key={row.id}>
                      <td className="whitespace-nowrap px-2 py-3">
                        {new Date(row.createdAt).toLocaleDateString(dateLocale)}
                      </td>
                      <td className="px-2 py-3">
                        <AdminInvestorLink user={row.user} />
                      </td>
                      <td className="px-2 py-3 font-medium">{formatUsd(row.amount)}</td>
                      <td className="px-2 py-3">
                        <span
                          className={cn(
                            'inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold',
                            statusBadgeClass(row.status)
                          )}
                        >
                          {t(`status${row.status === 'PENDING' ? 'Pending' : row.status === 'CONFIRMED' ? 'Confirmed' : 'Rejected'}`)}
                        </span>
                        {row.adminNote ? (
                          <p className="mt-1 text-xs text-muted-foreground">{row.adminNote}</p>
                        ) : null}
                      </td>
                      <td className="px-2 py-3">
                        {row.status === 'PENDING' ? (
                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              size="sm"
                              disabled={isLoading}
                              onClick={() => reviewCashOut(row.id, 'confirm')}
                            >
                              {t('confirm')}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={isLoading}
                              onClick={() => reviewCashOut(row.id, 'reject')}
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
                ) : (
                  pagination.items.map((row) => (
                    <tr key={row.id}>
                      <td className="whitespace-nowrap px-2 py-3">
                        {new Date(row.createdAt).toLocaleDateString(dateLocale)}
                      </td>
                      <td className="px-2 py-3">
                        <AdminPropertyLink property={row.destinationProperty} />
                      </td>
                      <td className="px-2 py-3">
                        <AdminInvestorLink user={row.user} />
                      </td>
                      <td className="px-2 py-3 font-medium">{formatUsd(row.amount)}</td>
                      <td className="px-2 py-3">
                        <span
                          className={cn(
                            'inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold',
                            statusBadgeClass(row.status)
                          )}
                        >
                          {t(`status${row.status === 'PENDING' ? 'Pending' : row.status === 'CONFIRMED' ? 'Confirmed' : 'Rejected'}`)}
                        </span>
                        {row.adminNote ? (
                          <p className="mt-1 text-xs text-muted-foreground">{row.adminNote}</p>
                        ) : null}
                      </td>
                      <td className="px-2 py-3">
                        {row.status === 'PENDING' ? (
                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              size="sm"
                              disabled={isLoading}
                              onClick={() => reviewReinvest(row.id, 'confirm')}
                            >
                              {t('confirm')}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={isLoading}
                              onClick={() => reviewReinvest(row.id, 'reject')}
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
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            from={pagination.from}
            to={pagination.to}
            onPageChange={setListPage}
          />
        </CardContent>
      </Card>
    </AdminPageFrame>
  )
}
