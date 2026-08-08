'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useLocale, useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/navigation'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import RequiredLabel from '@/components/ui/RequiredLabel'
import PhoneInputField from '@/components/auth/PhoneInputField'
import { cn } from '@/lib/utils'
import { getAccreditedStatusBadgeClass } from '@/lib/auth/userStatus'
import {
  getInvestorAdminPhase,
  getInvestorAdminPhaseBadgeClass,
} from '@/lib/admin/userTimeline'
import RequestReviewButton from '@/components/invest/RequestReviewButton'
import { getFieldLabelKeyForKind, parseResubmitKinds } from '@/lib/investorDocumentResubmit'

export default function AccountHubClient() {
  const t = useTranslations('MyAccount')
  const tInvest = useTranslations('Invest')
  const locale = useLocale()
  const router = useRouter()
  const { data: session, update } = useSession()
  const [account, setAccount] = useState(null)
  const [loading, setLoading] = useState(true)

  const formatDocKind = (kind) => {
    const labelKey = getFieldLabelKeyForKind(kind)
    if (labelKey && tInvest.has(labelKey)) return tInvest(labelKey)
    return kind?.replace(/_/g, ' ') || '—'
  }

  const [profileForm, setProfileForm] = useState({ fullName: '', phone: '' })
  const [profileErrors, setProfileErrors] = useState({})
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordErrors, setPasswordErrors] = useState({})
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  const loadAccount = async () => {
    const res = await fetch('/api/investor/account')
    if (!res.ok) {
      setLoading(false)
      return
    }
    const data = await res.json()
    setAccount(data)
    const profile = data.profile && typeof data.profile === 'object' ? data.profile : {}
    setProfileForm({
      fullName: profile.fullName || '',
      phone: profile.phone || '',
    })
    setLoading(false)
  }

  useEffect(() => {
    loadAccount()
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.location.hash === '#investment-requests') {
      router.replace('/dashboard/investments')
    }
  }, [router])

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setProfileSaving(true)
    setProfileErrors({})
    setProfileSuccess(false)

    const res = await fetch('/api/investor/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileForm),
    })
    const data = await res.json().catch(() => ({}))
    setProfileSaving(false)

    if (!res.ok) {
      if (data.errors) setProfileErrors(data.errors)
      return
    }

    setProfileSuccess(true)
    await update()
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPasswordSaving(true)
    setPasswordErrors({})
    setPasswordSuccess(false)

    const res = await fetch('/api/investor/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(passwordForm),
    })
    const data = await res.json().catch(() => ({}))
    setPasswordSaving(false)

    if (!res.ok) {
      if (data.errors) setPasswordErrors(data.errors)
      return
    }

    setPasswordSuccess(true)
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
  }

  if (loading) {
    return (
      <div className="flex-1 bg-muted/30">
        <div className="container mx-auto max-w-3xl px-4 py-16">
          <p className="text-center text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    )
  }

  const isAdmin = session?.user?.type === 'ADMIN'
  const provider = account?.provider || session?.user?.provider || 'credentials'
  const accountStatus = account?.accountStatus || session?.user?.accountStatus
  const profileComplete =
    Boolean(session?.user?.profileComplete) || Boolean(account?.profile?.completedAt)
  const emailVerified =
    Boolean(session?.user?.emailVerified) ||
    Boolean(account?.emailVerifiedAt) ||
    provider === 'google'
  const onboardingPhase = !isAdmin
    ? getInvestorAdminPhase({
        type: 'INVESTOR',
        accountStatus,
        emailVerified,
        profileComplete,
        profile: account?.profile,
        provider,
      })
    : null
  const isActive = accountStatus === 'ACTIVE'
  const accreditedStatus = account?.accreditedStatus || session?.user?.accreditedStatus || 'NOT_STARTED'
  const documents = account?.investorDocuments || []
  const resubmitKinds = parseResubmitKinds(account?.accreditationResubmitKinds)

  return (
    <div className="flex-1 bg-muted/30">
      <div className="container mx-auto max-w-3xl px-4 py-12 md:py-16">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="block text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            {t('backToDashboard')}
          </Link>
          <h1 className="mt-3 font-heading text-3xl font-semibold text-primary md:text-4xl">
            {t('title')}
          </h1>
          <p className="mt-2 text-muted-foreground">{t('subtitle')}</p>
        </div>

        <div className="space-y-8">
          {!isAdmin && onboardingPhase && onboardingPhase !== 'ACTIVE' ? (
            <Card className="border-border/80 shadow-sm">
              <CardHeader>
                <div className="flex flex-wrap items-center gap-3">
                  <CardTitle className="font-heading text-xl text-primary">
                    {t('applicationTitle')}
                  </CardTitle>
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                      getInvestorAdminPhaseBadgeClass(onboardingPhase)
                    )}
                  >
                    {t(`accountStatus.${onboardingPhase}`)}
                  </span>
                </div>
                <CardDescription>{t(`applicationDesc.${onboardingPhase}`)}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                {onboardingPhase === 'REJECTED' ? (
                  <>
                    <RequestReviewButton
                      scope="account"
                      label={t('requestReviewCta')}
                      pendingLabel={t('requestReviewSubmitted')}
                      needsDocumentsLabel={t('requestReviewNeedsDocuments')}
                      errorLabel={t('requestReviewFailed')}
                      variant="gold"
                      size="cta"
                    />
                    <Link
                      href="/contact"
                      className={cn(buttonVariants({ variant: 'outline', size: 'default' }))}
                    >
                      {t('contactTeam')}
                    </Link>
                  </>
                ) : null}
                {onboardingPhase === 'PENDING_EMAIL' ? (
                  <Link
                    href="/register/check-email"
                    className={cn(buttonVariants({ variant: 'gold', size: 'cta' }))}
                  >
                    {t('viewApplicationStatus')}
                  </Link>
                ) : null}
                {onboardingPhase === 'PENDING_PROFILE' ? (
                  <Link
                    href="/account/complete-profile"
                    className={cn(buttonVariants({ variant: 'gold', size: 'cta' }))}
                  >
                    {t('completeProfileCta')}
                  </Link>
                ) : null}
                {onboardingPhase === 'PENDING_ADMIN' ? (
                  <Link
                    href="/account/pending"
                    className={cn(buttonVariants({ variant: 'outline', size: 'default' }))}
                  >
                    {t('viewApplicationStatus')}
                  </Link>
                ) : null}
              </CardContent>
            </Card>
          ) : null}

          {!isAdmin && isActive ? (
            <Card className="border-border/80 shadow-sm">
              <CardHeader>
                <div className="flex flex-wrap items-center gap-3">
                  <CardTitle className="font-heading text-xl text-primary">
                    {t('accreditationTitle')}
                  </CardTitle>
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                      getAccreditedStatusBadgeClass(accreditedStatus)
                    )}
                  >
                    {t(`accreditedStatus.${accreditedStatus}`)}
                  </span>
                </div>
                <CardDescription>{t(`accreditationDesc.${accreditedStatus}`)}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {accreditedStatus === 'PENDING_REVIEW' && documents.length > 0 ? (
                  <ul className="space-y-2 rounded-lg border border-border bg-background p-4 text-sm">
                    {documents.map((doc) => (
                      <li key={doc.id} className="flex justify-between gap-4">
                        <span className="text-muted-foreground">{formatDocKind(doc.kind)}</span>
                        <span className="truncate font-medium">{doc.fileName}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}

                {accreditedStatus === 'APPROVED' ? (
                  <p className="text-sm text-muted-foreground">{t('accreditationApprovedNote')}</p>
                ) : null}

                {accreditedStatus === 'REJECTED' && resubmitKinds.length > 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t('accreditationResubmitSelectedNote', {
                      kinds: resubmitKinds
                        .map((kind) => tInvest(getFieldLabelKeyForKind(kind) || kind))
                        .join(', '),
                    })}
                  </p>
                ) : null}

                {accreditedStatus === 'REJECTED' && resubmitKinds.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t('accreditationRejectedNote')}</p>
                ) : null}

                {accreditedStatus === 'REJECTED' && documents.length > 0 && resubmitKinds.length === 0 ? (
                  <RequestReviewButton
                    scope="accreditation"
                    label={t('requestAccreditationReviewCta')}
                    pendingLabel={t('requestAccreditationReviewSubmitted')}
                    needsDocumentsLabel={t('requestReviewNeedsDocuments')}
                    errorLabel={t('requestReviewFailed')}
                    variant="outline"
                    onSuccess={() => loadAccount()}
                  />
                ) : null}

                {accreditedStatus === 'NOT_STARTED' || accreditedStatus === 'REJECTED' ? (
                  <Link
                    href="/dashboard/account/accreditation"
                    className={cn(buttonVariants({ variant: 'gold', size: 'cta' }), 'inline-flex')}
                  >
                    {accreditedStatus === 'REJECTED'
                      ? resubmitKinds.length > 0
                        ? t('accreditationResubmitSelectedCta')
                        : t('accreditationResubmit')
                      : t('accreditationStart')}
                  </Link>
                ) : null}

                {accreditedStatus === 'PENDING_REVIEW' ? (
                  <p className="text-sm text-muted-foreground">{t('accreditationPendingNote')}</p>
                ) : null}
              </CardContent>
            </Card>
          ) : null}

          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle className="font-heading text-xl text-primary">{t('profileTitle')}</CardTitle>
              <CardDescription>{t('profileDesc')}</CardDescription>
            </CardHeader>
            {isAdmin ? (
              <CardContent>
                <p className="text-sm text-muted-foreground">{t('adminNote')}</p>
                <p className="mt-2 text-sm font-medium">{account?.email}</p>
              </CardContent>
            ) : (
              <form onSubmit={handleProfileSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="account-email">{t('email')}</Label>
                    <Input id="account-email" value={account?.email || ''} disabled />
                    <p className="text-xs text-muted-foreground">{t('emailReadOnly')}</p>
                  </div>
                  <div className="space-y-2">
                    <RequiredLabel htmlFor="account-fullName">{t('fullName')}</RequiredLabel>
                    <Input
                      id="account-fullName"
                      value={profileForm.fullName}
                      onChange={(e) =>
                        setProfileForm((prev) => ({ ...prev, fullName: e.target.value }))
                      }
                      required
                    />
                    {profileErrors.fullName ? (
                      <p className="text-xs text-destructive">{t('errorRequired')}</p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="account-phone">{t('phone')}</Label>
                    <PhoneInputField
                      key={account?.id || 'phone'}
                      id="account-phone"
                      locale={locale}
                      defaultValue={profileForm.phone}
                      onChange={(phone) => setProfileForm((prev) => ({ ...prev, phone }))}
                      countryLabel={t('phoneCountryCode')}
                      numberPlaceholder={t('phoneNumberPlaceholder')}
                    />
                  </div>
                  {profileSuccess ? (
                    <p className="text-sm text-green-700 dark:text-green-400">{t('profileSaved')}</p>
                  ) : null}
                  <Button type="submit" disabled={profileSaving}>
                    {profileSaving ? t('saving') : t('saveProfile')}
                  </Button>
                </CardContent>
              </form>
            )}
          </Card>

          {!isAdmin && provider === 'credentials' ? (
            <Card className="border-border/80 shadow-sm">
              <CardHeader>
                <CardTitle className="font-heading text-xl text-primary">{t('securityTitle')}</CardTitle>
                <CardDescription>{t('securityDesc')}</CardDescription>
              </CardHeader>
              <form onSubmit={handlePasswordSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <RequiredLabel htmlFor="current-password">{t('currentPassword')}</RequiredLabel>
                    <Input
                      id="current-password"
                      type="password"
                      autoComplete="current-password"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                      }
                      required
                    />
                    {passwordErrors.currentPassword === 'invalid' ? (
                      <p className="text-xs text-destructive">{t('errorCurrentPassword')}</p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <RequiredLabel htmlFor="new-password">{t('newPassword')}</RequiredLabel>
                    <Input
                      id="new-password"
                      type="password"
                      autoComplete="new-password"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
                      }
                      required
                      minLength={8}
                    />
                    {passwordErrors.newPassword ? (
                      <p className="text-xs text-destructive">{t('errorPasswordShort')}</p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <RequiredLabel htmlFor="confirm-password">{t('confirmPassword')}</RequiredLabel>
                    <Input
                      id="confirm-password"
                      type="password"
                      autoComplete="new-password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                      }
                      required
                      minLength={8}
                    />
                    {passwordErrors.confirmPassword ? (
                      <p className="text-xs text-destructive">{t('errorPasswordMismatch')}</p>
                    ) : null}
                  </div>
                  {passwordSuccess ? (
                    <p className="text-sm text-green-700 dark:text-green-400">{t('passwordSaved')}</p>
                  ) : null}
                  <Button type="submit" disabled={passwordSaving}>
                    {passwordSaving ? t('saving') : t('updatePassword')}
                  </Button>
                </CardContent>
              </form>
            </Card>
          ) : !isAdmin ? (
            <Card className="border-border/80 shadow-sm">
              <CardHeader>
                <CardTitle className="font-heading text-xl text-primary">{t('securityTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{t('googlePasswordNote')}</p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  )
}
