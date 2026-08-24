'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { adminSelectClassName } from '@/lib/adminFormClasses'
import AdminFormField from '@/components/admin/AdminFormField'
import AdminFormSection from '@/components/admin/AdminFormSection'
import {
  formatExperienceForDisplay,
  formatProjectTypesForDisplay,
  INVESTMENT_RANGE_LABELS,
} from '@/lib/auth/investorProfileOptions'
import {
  adminAccountStatusLabel,
  adminAccreditedStatusLabel,
  adminUserTypeLabel,
} from '@/lib/admin/adminLabels'
import {
  buildUserActivityEvents,
  getInvestorAdminPhase,
  getInvestorAdminPhaseTone,
} from '@/lib/admin/userTimeline'
import { cn } from '@/lib/utils'
import { useMessaging } from '@/hooks/useMessaging'
import InvestorDocumentReviewGrid from '@/components/invest/InvestorDocumentReviewGrid'
import { getFieldLabelKeyForKind, parseResubmitKinds } from '@/lib/investorDocumentResubmit'
import {
  DEFAULT_OPERATOR_PERMISSIONS,
  OPERATOR_PERMISSION_GROUPS,
  OPERATOR_PERMISSIONS,
  normalizeOperatorPermissions,
} from '@/lib/operatorPermissions'

const buildInitialState = (user) => ({
  email: user?.email || '',
  password: '',
  type: user?.type || 'INVESTOR',
  provider: user?.provider || 'credentials',
  operatorPermissions:
    user?.type === 'OPERATOR'
      ? normalizeOperatorPermissions(user.operatorPermissions)
      : DEFAULT_OPERATOR_PERMISSIONS,
})

const PROFILE_FIELD_KEYS = [
  'fullName',
  'phone',
  'location',
  'interestedInInvestorVisa',
  'referralSource',
  'investmentRange',
  'investmentGoals',
  'projectTypes',
  'experience',
  'background',
]

const formatProfileValue = (key, profile, tRegister, projectTypeLabelByCode) => {
  if (key === 'projectTypes') {
    return formatProjectTypesForDisplay(profile.projectTypes, projectTypeLabelByCode)
  }
  if (key === 'interestedInInvestorVisa') {
    if (profile.location !== 'MX') return null
    return profile.interestedInInvestorVisa ? tRegister('yes') : tRegister('no')
  }
  const value = profile[key]
  if (!value) return null
  if (key === 'location') {
    try {
      return tRegister(`location_${value}`)
    } catch {
      return String(value)
    }
  }
  if (key === 'investmentRange') {
    try {
      return tRegister(`range_${value}`)
    } catch {
      return INVESTMENT_RANGE_LABELS[value] || String(value)
    }
  }
  if (key === 'experience') {
    return formatExperienceForDisplay(value, tRegister) || String(value)
  }
  return String(value)
}

const statusPill = (value, tone = 'neutral', label) => {
  const tones = {
    neutral: 'bg-muted text-muted-foreground',
    warn: 'bg-amber-400/30 text-amber-950 dark:bg-amber-500/25 dark:text-amber-100',
    ok: 'bg-green-600/15 text-green-800 dark:text-green-400',
    bad: 'bg-destructive/15 text-destructive',
    info: 'bg-blue-600/15 text-blue-800 dark:text-blue-300',
  }
  return (
    <span
      className={cn(
        'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        tones[tone]
      )}
    >
      {label ?? value?.replace(/_/g, ' ')?.toUpperCase() ?? '—'}
    </span>
  )
}

export default function UserEditor({
  user,
  isCreating,
  isLoading,
  onSubmit,
  onCancel,
  onDelete,
  onUserUpdated,
}) {
  const t = useTranslations('Admin')
  const tRegister = useTranslations('Register')
  const tInvest = useTranslations('Invest')
  const locale = useLocale()
  const { alert } = useMessaging()
  const { data: session } = useSession()
  const canManageStaff = session?.user?.type === 'ADMIN'
  const initialState = useMemo(() => buildInitialState(user), [user])
  const [formData, setFormData] = useState(initialState)
  const [reviewNote, setReviewNote] = useState('')
  const [selectedResubmitKinds, setSelectedResubmitKinds] = useState([])
  const [actionLoading, setActionLoading] = useState(false)
  const [projectTypeLabelByCode, setProjectTypeLabelByCode] = useState({})

  const adminPhase = useMemo(
    () => (user && !isCreating && user.type === 'INVESTOR' ? getInvestorAdminPhase(user) : null),
    [user, isCreating]
  )

  const activityEvents = useMemo(
    () => (user && !isCreating ? buildUserActivityEvents(user) : []),
    [user, isCreating]
  )

  const formatEventDateTime = (value) => {
    if (!value) return '—'
    return new Date(value).toLocaleString(locale === 'es' ? 'es-ES' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  useEffect(() => {
    let cancelled = false
    fetch('/api/admin/property-types')
      .then((res) => (res.ok ? res.json() : { types: [] }))
      .then((data) => {
        if (cancelled) return
        const types = Array.isArray(data.types) ? data.types : []
        setProjectTypeLabelByCode(
          Object.fromEntries(types.map((type) => [type.code, type.labelEn]))
        )
      })
      .catch(() => {
        if (!cancelled) setProjectTypeLabelByCode({})
      })
    return () => {
      cancelled = true
    }
  }, [])

  const resetForm = useCallback(() => {
    setFormData(buildInitialState(user))
    setReviewNote('')
    setSelectedResubmitKinds([])
  }, [user])

  useEffect(() => {
    resetForm()
  }, [user?.id, isCreating, resetForm])

  const isDirty = useMemo(() => {
    return (
      formData.email !== initialState.email ||
      formData.type !== initialState.type ||
      JSON.stringify(formData.operatorPermissions) !== JSON.stringify(initialState.operatorPermissions) ||
      formData.password.length > 0
    )
  }, [formData, initialState])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const togglePermission = (permission) => {
    setFormData((prev) => {
      const current = new Set(prev.operatorPermissions || [])
      if (current.has(permission)) {
        current.delete(permission)
        if (permission === OPERATOR_PERMISSIONS.MANAGE_PROPERTY_DOCUMENTS) {
          current.delete(OPERATOR_PERMISSIONS.NOTIFY_PROPERTY_INVESTORS)
        }
      } else {
        current.add(permission)
        if (permission === OPERATOR_PERMISSIONS.NOTIFY_PROPERTY_INVESTORS) {
          current.add(OPERATOR_PERMISSIONS.MANAGE_PROPERTY_DOCUMENTS)
        }
      }
      return { ...prev, operatorPermissions: normalizeOperatorPermissions([...current]) }
    })
  }

  const handleCancelClick = () => {
    if (isCreating) {
      onCancel?.()
      return
    }
    resetForm()
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const submitData = { ...formData }
    delete submitData.provider
    if (!submitData.password) {
      delete submitData.password
    }
    onSubmit(submitData)
  }

  const runStatusAction = async (endpoint, action, extra = {}) => {
    if (!user?.id) return
    setActionLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${user.id}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, note: reviewNote || undefined, ...extra }),
        credentials: 'include',
      })
      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        await alert(error.error || error.message || t('common.actionFailed'))
        return
      }
      const updated = await response.json()
      onUserUpdated?.(updated)
      setReviewNote('')
      setSelectedResubmitKinds([])
    } catch (error) {
      console.error('Status action error:', error)
      await alert(t('common.actionFailed'))
    } finally {
      setActionLoading(false)
    }
  }

  const headingPrefix = isCreating ? t('users.createTitle') : t('users.editTitle')
  const profile = user?.profile && typeof user.profile === 'object' ? user.profile : null
  const documents = user?.investorDocuments || []
  const canApproveAccount = user?.accountStatus !== 'ACTIVE'
  const canRejectAccount = user?.accountStatus !== 'REJECTED'
  const hasSubmittedAccreditationDocs = documents.length > 0
  const canApproveAccredited =
    user?.accountStatus === 'ACTIVE' &&
    hasSubmittedAccreditationDocs &&
    user?.accreditedStatus !== 'APPROVED'
  const canRejectAccredited =
    user?.accountStatus === 'ACTIVE' &&
    (user?.accreditedStatus === 'APPROVED' ||
      (user?.accreditedStatus === 'PENDING_REVIEW' && hasSubmittedAccreditationDocs))
  const pendingResubmitKinds = parseResubmitKinds(user?.accreditationResubmitKinds)

  const toggleResubmitKind = (kind) => {
    setSelectedResubmitKinds((prev) =>
      prev.includes(kind) ? prev.filter((value) => value !== kind) : [...prev, kind]
    )
  }

  return (
    <Card className="border-border/80 shadow-md">
      <CardHeader className="border-b border-border/60 pb-4">
        <div>
          <CardTitle className="font-heading text-2xl text-primary">{headingPrefix}</CardTitle>
          {user && !isCreating ? (
            <p className="mt-1 text-xs text-muted-foreground">
              {t('users.userMeta', { id: user.id, provider: user.provider || t('common.credentials') })}
            </p>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        <Tabs
          defaultValue={isCreating ? 'account' : user?.type === 'INVESTOR' ? 'review' : 'account'}
          className="gap-4"
        >
          <TabsList
            variant="line"
            className="h-auto w-full flex-wrap justify-start gap-1 rounded-none border-b border-border/70 bg-transparent p-0"
          >
            {user && !isCreating && user.type === 'INVESTOR' ? (
              <TabsTrigger value="review" className="px-3 py-2">
                {t('users.tabReview')}
              </TabsTrigger>
            ) : null}
            {profile && !isCreating ? (
              <TabsTrigger value="profile" className="px-3 py-2">
                {t('users.tabProfile')}
              </TabsTrigger>
            ) : null}
            <TabsTrigger value="account" className="px-3 py-2">
              {t('users.tabAccount')}
            </TabsTrigger>
            {user && !isCreating ? (
              <TabsTrigger value="activity" className="px-3 py-2">
                {t('users.tabActivity')}
              </TabsTrigger>
            ) : null}
          </TabsList>

          {user && !isCreating && user.type === 'INVESTOR' ? (
            <TabsContent value="review" keepMounted className="outline-none">
              <AdminFormSection title={t('users.reviewSectionTitle')}>
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold tracking-wide text-muted-foreground">
                      {t('users.accountStatusLabel')}
                    </span>
                    {statusPill(
                      adminPhase || user.accountStatus,
                      getInvestorAdminPhaseTone(adminPhase || user.accountStatus),
                      adminPhase
                        ? t(`accountPhase.${adminPhase}`)
                        : adminAccountStatusLabel(t, user.accountStatus)
                    )}
                    <span className="text-xs font-semibold tracking-wide text-muted-foreground">
                      {t('users.accreditedStatusLabel')}
                    </span>
                    {statusPill(
                      user.accreditedStatus,
                      user.accreditedStatus === 'APPROVED'
                        ? 'ok'
                        : user.accreditedStatus === 'REJECTED'
                          ? 'bad'
                          : user.accreditedStatus === 'PENDING_REVIEW'
                            ? 'info'
                            : 'neutral',
                      adminAccreditedStatusLabel(t, user.accreditedStatus)
                    )}
                  </div>
                  {user.accreditedReviewNote ? (
                    <p className="rounded-md border border-border/60 bg-background px-3 py-2 text-xs text-muted-foreground">
                      <span className="font-semibold text-main-gold">{t('users.reviewNoteCurrent')}:</span>{' '}
                      {user.accreditedReviewNote}
                    </p>
                  ) : null}
                  {canApproveAccount || canRejectAccount ? (
                    <div className="space-y-2">
                      {user.accountStatus === 'REJECTED' || user.accountStatus === 'ACTIVE' ? (
                        <p className="text-xs text-muted-foreground">{t('users.accountActionsHelp')}</p>
                      ) : null}
                      <div className="flex flex-wrap gap-2">
                        {canApproveAccount ? (
                          <Button
                            type="button"
                            size="sm"
                            disabled={actionLoading}
                            onClick={() => runStatusAction('account-status', 'approve')}
                          >
                            {t('users.approveAccount')}
                          </Button>
                        ) : null}
                        {canRejectAccount ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="text-destructive"
                            disabled={actionLoading}
                            onClick={() => runStatusAction('account-status', 'reject')}
                          >
                            {t('users.rejectAccount')}
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                  {documents.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-foreground">{t('users.uploadedDocuments')}</h4>
                      <InvestorDocumentReviewGrid
                        documents={documents}
                        t={tInvest}
                        viewLabel={t('common.view')}
                        missingLabel={t('users.documentNotUploaded')}
                        closeLabel={t('common.close')}
                        openInNewTabLabel={t('common.openInNewTab')}
                        previewUnavailableLabel={t('common.previewUnavailable')}
                        selectable={user.accreditedStatus === 'PENDING_REVIEW'}
                        selectedKinds={selectedResubmitKinds}
                        onToggleKind={toggleResubmitKind}
                        selectLabel={t('users.resubmitSelectDocument')}
                      />
                      {user.accreditedStatus === 'PENDING_REVIEW' ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="w-full text-xs text-muted-foreground">{t('users.resubmitSelectHelp')}</p>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={actionLoading || selectedResubmitKinds.length === 0}
                            onClick={() =>
                              runStatusAction('accredited-status', 'request_resubmit', {
                                resubmitKinds: selectedResubmitKinds,
                              })
                            }
                          >
                            {t('users.requestDocumentResubmit')}
                          </Button>
                        </div>
                      ) : null}
                      {pendingResubmitKinds.length > 0 ? (
                        <p className="text-xs text-muted-foreground">
                          {t('users.awaitingResubmitKinds', {
                            kinds: pendingResubmitKinds
                              .map((kind) => tInvest(getFieldLabelKeyForKind(kind) || kind))
                              .join(', '),
                          })}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                  {canApproveAccredited || canRejectAccredited ? (
                    <div className="space-y-2">
                      {canApproveAccredited &&
                      (user.accreditedStatus === 'REJECTED' || user.accreditedStatus === 'NOT_STARTED') ? (
                        <p className="text-xs text-muted-foreground">{t('users.accreditedActionsHelp')}</p>
                      ) : null}
                      {canRejectAccredited && user.accreditedStatus === 'APPROVED' ? (
                        <p className="text-xs text-muted-foreground">{t('users.accreditedActionsHelp')}</p>
                      ) : null}
                      <div className="flex flex-wrap gap-2">
                        {canApproveAccredited ? (
                          <Button
                            type="button"
                            size="sm"
                            disabled={actionLoading}
                            onClick={() => runStatusAction('accredited-status', 'approve')}
                          >
                            {t('users.approveAccredited')}
                          </Button>
                        ) : null}
                        {canRejectAccredited ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="text-destructive"
                            disabled={actionLoading}
                            onClick={() => runStatusAction('accredited-status', 'reject')}
                          >
                            {t('users.rejectAccredited')}
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                  <AdminFormField label={t('users.reviewNote')} htmlFor="review-note">
                    <Input
                      id="review-note"
                      value={reviewNote}
                      onChange={(e) => setReviewNote(e.target.value)}
                      placeholder={t('users.reviewNotePlaceholder')}
                    />
                  </AdminFormField>
                </div>
              </AdminFormSection>
            </TabsContent>
          ) : null}

          {profile && !isCreating ? (
            <TabsContent value="profile" keepMounted className="outline-none">
              <AdminFormSection title={t('users.questionnaire')}>
                <dl className="grid gap-3 text-sm md:grid-cols-2">
                  {PROFILE_FIELD_KEYS.map((key) => {
                    const display = formatProfileValue(key, profile, tRegister, projectTypeLabelByCode)
                    if (!display) return null
                    return (
                      <div
                        key={key}
                        className={cn(
                          'rounded-lg border border-border/70 bg-background px-3 py-2.5 shadow-sm',
                          (key === 'investmentGoals' || key === 'background') && 'md:col-span-2'
                        )}
                      >
                        <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          {t(`users.profile.${key}`)}
                        </dt>
                        <dd className="mt-1.5 text-sm text-foreground whitespace-pre-wrap">{display}</dd>
                      </div>
                    )
                  })}
                </dl>
              </AdminFormSection>
            </TabsContent>
          ) : null}

          <TabsContent value="account" keepMounted className="outline-none">
            <form onSubmit={handleSubmit}>
              <AdminFormSection title={t('users.accountDetailsSectionTitle')}>
                <div className="grid gap-4 md:grid-cols-2">
                  <AdminFormField label={t('users.emailAddress')} htmlFor="user-email">
                    <Input
                      id="user-email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </AdminFormField>

                  <AdminFormField
                    label={`${t('users.password')}${user && !isCreating ? ` ${t('users.passwordKeepHint')}` : ''}`}
                    htmlFor="user-password"
                  >
                    <Input
                      id="user-password"
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required={isCreating}
                      placeholder={
                        isCreating
                          ? t('users.passwordPlaceholderNew')
                          : '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022'
                      }
                    />
                  </AdminFormField>

                  <AdminFormField label={t('users.userType')} htmlFor="user-type">
                    <select
                      id="user-type"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className={adminSelectClassName()}
                      disabled={!canManageStaff}
                      required
                    >
                      <option value="INVESTOR">{adminUserTypeLabel(t, 'INVESTOR')}</option>
                      {canManageStaff ? (
                        <>
                          <option value="OPERATOR">{adminUserTypeLabel(t, 'OPERATOR')}</option>
                          <option value="ADMIN">{adminUserTypeLabel(t, 'ADMIN')}</option>
                        </>
                      ) : null}
                    </select>
                  </AdminFormField>

                  <AdminFormField label={t('users.authProvider')} hint={t('users.authProviderHint')}>
                    <Input
                      value={formData.provider || t('common.credentials')}
                      disabled
                      readOnly
                      className="bg-muted"
                    />
                  </AdminFormField>
                </div>
              </AdminFormSection>

              {canManageStaff && formData.type === 'OPERATOR' ? (
                <AdminFormSection
                  title={t('users.operatorPermissionsTitle')}
                  description={t('users.operatorPermissionsDescription')}
                >
                  <div className="grid gap-5 md:grid-cols-2">
                    {OPERATOR_PERMISSION_GROUPS.map((group) => (
                      <fieldset key={group.id} className="rounded-lg border border-border/70 p-4">
                        <legend className="px-1 text-sm font-semibold text-primary">
                          {t(`users.permissionGroups.${group.id}`)}
                        </legend>
                        <div className="mt-2 space-y-3">
                          {group.permissions.map((permission) => (
                            <label key={permission} className="flex cursor-pointer items-start gap-3">
                              <input
                                type="checkbox"
                                checked={formData.operatorPermissions.includes(permission)}
                                onChange={() => togglePermission(permission)}
                                className="mt-1 size-4 accent-primary"
                              />
                              <span>
                                <span className="block text-sm font-medium text-foreground">
                                  {t(`users.permissions.${permission}.label`)}
                                </span>
                                <span className="block text-xs text-muted-foreground">
                                  {t(`users.permissions.${permission}.description`)}
                                </span>
                              </span>
                            </label>
                          ))}
                        </div>
                      </fieldset>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData((prev) => ({ ...prev, operatorPermissions: DEFAULT_OPERATOR_PERMISSIONS }))}
                    >
                      {t('users.resetDefaultPermissions')}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFormData((prev) => ({ ...prev, operatorPermissions: [] }))}
                    >
                      {t('users.clearPermissions')}
                    </Button>
                  </div>
                </AdminFormSection>
              ) : null}

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
                <div className="flex min-w-0 flex-col gap-1.5">
                  <p className="text-xs text-muted-foreground">
                    {isDirty ? (
                      <span className="text-main-gold">{t('common.unsavedChanges')}</span>
                    ) : isCreating ? (
                      t('common.fillFormThenCreate')
                    ) : (
                      t('common.noUnsavedChanges')
                    )}
                  </p>
                  {canManageStaff && !isCreating && user ? (
                    <button
                      type="button"
                      onClick={() => onDelete?.(user.id)}
                      disabled={isLoading || actionLoading}
                      className="w-fit text-left text-xs text-muted-foreground/80 underline-offset-2 transition-colors hover:text-destructive hover:underline disabled:pointer-events-none disabled:opacity-50"
                    >
                      {t('common.deleteUser')}
                    </button>
                  ) : null}
                </div>
                <div className="flex flex-wrap justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelClick}
                    disabled={isLoading || actionLoading || (!isCreating && !isDirty)}
                  >
                    {isCreating ? t('common.cancel') : t('common.discardChanges')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading || actionLoading || (!isCreating && !isDirty)}
                  >
                    {isLoading
                      ? t('common.saving')
                      : isCreating
                        ? t('users.createUser')
                        : t('common.saveChanges')}
                  </Button>
                </div>
              </div>
            </form>
          </TabsContent>

          {user && !isCreating ? (
            <TabsContent value="activity" keepMounted className="outline-none">
              <AdminFormSection
                title={t('users.activityLogTitle')}
                description={t('users.activityLogDesc')}
              >
                {activityEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t('users.activityLogEmpty')}</p>
                ) : (
                  <ol className="relative ml-2 space-y-0 border-l border-border/80">
                    {activityEvents.map((event) => (
                      <li key={event.id} className="relative pb-4 pl-5 last:pb-0">
                        <span
                          className="absolute top-1.5 -left-[5px] size-2.5 rounded-full border-2 border-background bg-main-gold"
                          aria-hidden
                        />
                        <p className="text-sm font-medium text-foreground">
                          {t(`users.activity.${event.key}`)}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {formatEventDateTime(event.at)}
                        </p>
                      </li>
                    ))}
                  </ol>
                )}
              </AdminFormSection>
            </TabsContent>
          ) : null}
        </Tabs>
      </CardContent>
    </Card>
  )
}
