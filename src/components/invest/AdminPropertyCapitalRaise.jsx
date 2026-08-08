'use client'

import { useCallback, useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Plus } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { adminSelectClassName } from '@/lib/adminFormClasses'
import { cn } from '@/lib/utils'
import { formatUsd } from '@/lib/formatMoney'
import AdminFormattedNumberInput from '@/components/admin/AdminFormattedNumberInput'
import { useMessaging } from '@/hooks/useMessaging'

const emptyForm = {
  source: 'INVESTOR',
  userId: '',
  amount: '',
  label: '',
  note: '',
}

export default function AdminPropertyCapitalRaise({ propertyId, investmentGoal = 0 }) {
  const t = useTranslations('Admin.investments')
  const tc = useTranslations('Admin.common')
  const locale = useLocale()
  const { confirm } = useMessaging()

  const [rows, setRows] = useState([])
  const [investors, setInvestors] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [status, setStatus] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const fundedAmount = rows
    .filter((row) => row.status === 'ACTIVE')
    .reduce((sum, row) => sum + Number(row.amount || 0), 0)
  const fundingPercent =
    investmentGoal > 0 ? Math.min(100, Math.round((fundedAmount / investmentGoal) * 100)) : 0

  const load = useCallback(async () => {
    const [contribRes, usersRes] = await Promise.all([
      fetch(
        `/api/admin/funding-contributions?propertyId=${propertyId}&includeCancelled=1`,
        { credentials: 'include' }
      ),
      fetch('/api/admin/users', { credentials: 'include' }),
    ])
    if (!contribRes.ok) throw new Error('Failed to load contributions')
    setRows(await contribRes.json())
    if (usersRes.ok) {
      const users = await usersRes.json()
      setInvestors(users.filter((user) => user.type === 'INVESTOR'))
    }
  }, [propertyId])

  useEffect(() => {
    load().catch(() => setStatus(t('errorLoad')))
  }, [load, t])

  const submit = async (event) => {
    event.preventDefault()
    setIsLoading(true)
    setStatus('')
    try {
      const res = await fetch('/api/admin/funding-contributions', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          source: form.source,
          userId: form.source === 'INVESTOR' ? form.userId : null,
          amount: Number(form.amount),
          label: form.label,
          note: form.note,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t('errorSave'))
      setForm(emptyForm)
      setShowForm(false)
      setStatus(t('savedContribution'))
      await load()
    } catch (error) {
      setStatus(error.message || t('errorSave'))
    } finally {
      setIsLoading(false)
    }
  }

  const cancelRow = async (id) => {
    const confirmed = await confirm({
      message: t('confirmCancel'),
      variant: 'destructive',
    })
    if (!confirmed) return
    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/funding-contributions/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t('errorSave'))
      setStatus(t('cancelledContribution'))
      await load()
    } catch (error) {
      setStatus(error.message || t('errorSave'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{t('raisedVsGoal')}</p>
          <p className="text-lg font-semibold text-primary">
            {formatUsd(fundedAmount)} / {formatUsd(investmentGoal)}{' '}
            <span className="text-sm font-normal text-muted-foreground">({fundingPercent}%)</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/admin/investments?tab=contributions&propertyId=${encodeURIComponent(propertyId)}`}
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
          >
            {t('openInvestmentsHub')}
          </Link>
          <Button type="button" size="sm" onClick={() => setShowForm((v) => !v)}>
            <Plus className="size-4" aria-hidden />
            {t('addContribution')}
          </Button>
        </div>
      </div>

      {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}

      {showForm ? (
        <form
          onSubmit={submit}
          className="grid gap-3 rounded-lg border border-border/70 p-4 md:grid-cols-2"
        >
          <div className="space-y-2">
            <Label>{t('source')}</Label>
            <select
              className={adminSelectClassName()}
              value={form.source}
              onChange={(e) => setForm((prev) => ({ ...prev, source: e.target.value }))}
            >
              <option value="INVESTOR">{t('sourceInvestor')}</option>
              <option value="MANUAL">{t('sourceManual')}</option>
            </select>
          </div>
          {form.source === 'INVESTOR' ? (
            <div className="space-y-2">
              <Label>{t('investor')}</Label>
              <select
                required
                className={adminSelectClassName()}
                value={form.userId}
                onChange={(e) => setForm((prev) => ({ ...prev, userId: e.target.value }))}
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
              <Label>{t('manualLabel')}</Label>
              <Input
                required
                value={form.label}
                onChange={(e) => setForm((prev) => ({ ...prev, label: e.target.value }))}
                placeholder={t('manualLabelPlaceholder')}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label>{t('amount')}</Label>
            <AdminFormattedNumberInput
              name="amount"
              required
              value={form.amount}
              onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>{t('note')}</Label>
            <Input
              value={form.note}
              onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
            />
          </div>
          <div className="flex gap-2 md:col-span-2">
            <Button type="submit" size="sm" disabled={isLoading}>
              {isLoading ? tc('saving') : t('saveContribution')}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setShowForm(false)}>
              {tc('cancel')}
            </Button>
          </div>
        </form>
      ) : null}

      <div className="overflow-x-auto rounded-lg border border-border/60">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">{t('colDate')}</th>
              <th className="px-3 py-2 font-medium">{t('party')}</th>
              <th className="px-3 py-2 font-medium">{t('amount')}</th>
              <th className="px-3 py-2 font-medium">{t('status')}</th>
              <th className="px-3 py-2 font-medium">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                  {t('emptyContributions')}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b border-border/50">
                  <td className="px-3 py-2 whitespace-nowrap">
                    {new Date(row.createdAt).toLocaleDateString(
                      locale === 'es' ? 'es-ES' : 'en-US'
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <span className="mr-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {row.source === 'MANUAL' ? t('sourceManual') : t('sourceInvestor')}
                    </span>
                    {row.source === 'MANUAL' ? row.label : row.user?.email || '—'}
                  </td>
                  <td className="px-3 py-2 font-medium">{formatUsd(row.amount)}</td>
                  <td className="px-3 py-2">
                    {row.status === 'ACTIVE' ? t('statusActive') : t('statusCancelled')}
                  </td>
                  <td className="px-3 py-2">
                    {row.status === 'ACTIVE' ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={isLoading}
                        onClick={() => cancelRow(row.id)}
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
    </div>
  )
}
