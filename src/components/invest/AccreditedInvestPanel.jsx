'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { MapPin, Phone, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from '@/i18n/navigation'
import { getInvestMeetingLinks } from '@/lib/investMeetingLinks'
import {
  canInvestorCancelMeetingRequest,
  canInvestorSubmitDeposit,
  MIN_INTENDED_INVESTMENT_AMOUNT,
} from '@/lib/investmentIntents'
import {
  getEffectiveMinInvestment,
  getRemainingCapacity,
  getStatedMinInvestment,
} from '@/lib/propertyFunding'
import {
  formatFormattedInteger,
  formatMoneyAmount,
  parseFormattedInteger,
} from '@/lib/formatMoney'
import DepositConfirmForm from '@/components/invest/DepositConfirmForm'
import { useMessaging } from '@/hooks/useMessaging'

const MEETING_POLL_MS = 15000

export default function AccreditedInvestPanel({ property, onActiveRequestChange }) {
  const t = useTranslations('Invest')
  const tAccount = useTranslations('MyAccount')
  const locale = useLocale()
  const router = useRouter()
  const { confirm } = useMessaging()
  const [intendedAmount, setIntendedAmount] = useState('')
  const [intent, setIntent] = useState(null)
  const [deposits, setDeposits] = useState([])
  const [status, setStatus] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  const remainingCapacity =
    property.remainingCapacity != null
      ? Number(property.remainingCapacity)
      : getRemainingCapacity(property.price, property.fundedAmount)
  const statedMin = getStatedMinInvestment(null, MIN_INTENDED_INVESTMENT_AMOUNT)
  const effectiveMin =
    property.effectiveMinInvestment != null
      ? Number(property.effectiveMinInvestment)
      : getEffectiveMinInvestment({
          goal: property.price,
          fundedAmount: property.fundedAmount,
          platformFloor: MIN_INTENDED_INVESTMENT_AMOUNT,
        })
  const isLastSlice = remainingCapacity > 0 && remainingCapacity < statedMin

  const parsedIntendedAmount =
    intendedAmount === '' ? NaN : Number(parseFormattedInteger(intendedAmount))
  const hasValidIntendedAmount =
    intendedAmount !== '' &&
    Number.isFinite(parsedIntendedAmount) &&
    parsedIntendedAmount >= effectiveMin &&
    parsedIntendedAmount <= remainingCapacity + 1e-6
  const intendedAmountDisplay = formatFormattedInteger(intendedAmount)
  const minAmountLabel = formatMoneyAmount(effectiveMin)
  const remainingLabel = formatMoneyAmount(remainingCapacity)

  const onIntendedAmountChange = (event) => {
    setIntendedAmount(parseFormattedInteger(event.target.value))
  }

  const links = useMemo(
    () =>
      getInvestMeetingLinks({
        propertyName: property.name,
        investmentId: property.investmentId,
        intendedAmount: Number.isFinite(parsedIntendedAmount) ? parsedIntendedAmount : null,
        locale,
      }),
    [property.name, property.investmentId, parsedIntendedAmount, locale]
  )

  const whatsappUrlForChannel = (channel) => {
    if (channel === 'PHONE_CALL') return links.phoneCallUrl
    if (channel === 'IN_PERSON') return links.inPersonUrl
    return links.videoCallUrl
  }

  const refresh = useCallback(async () => {
    const [intentRes, depositRes] = await Promise.all([
      fetch(`/api/investor/investment-intents?propertyId=${property.id}`, {
        credentials: 'include',
      }),
      fetch(`/api/investor/deposit-requests?propertyId=${property.id}`, {
        credentials: 'include',
      }),
    ])
    if (intentRes.ok) {
      const nextIntent = await intentRes.json()
      setIntent(nextIntent)
      if (
        nextIntent?.intendedAmount != null &&
        Number.isFinite(Number(nextIntent.intendedAmount))
      ) {
        setIntendedAmount((prev) =>
          prev === '' ? Number(nextIntent.intendedAmount) : prev
        )
      }
    }
    if (depositRes.ok) setDeposits(await depositRes.json())
    setHasLoaded(true)
  }, [property.id])

  useEffect(() => {
    refresh().catch(() => setHasLoaded(true))
  }, [refresh])

  useEffect(() => {
    if (!onActiveRequestChange) return
    const status = intent?.status
    const active =
      status === 'MEETING_REQUESTED' || status === 'AWAITING_WIRE'
    onActiveRequestChange(active)
  }, [intent?.status, onActiveRequestChange])

  useEffect(() => {
    if (intent?.status !== 'MEETING_REQUESTED') return undefined
    const id = window.setInterval(() => {
      refresh().catch(() => {})
    }, MEETING_POLL_MS)
    return () => window.clearInterval(id)
  }, [intent?.status, refresh])

  const requestMeeting = async (channel) => {
    if (!hasValidIntendedAmount) {
      if (
        Number.isFinite(parsedIntendedAmount) &&
        parsedIntendedAmount > remainingCapacity + 1e-6
      ) {
        setStatus(
          t('intendedAmountMaxError', {
            max: remainingLabel,
          })
        )
      } else {
        setStatus(
          t('intendedAmountMinError', {
            amount: minAmountLabel,
          })
        )
      }
      return
    }

    const confirmed = await confirm({
      title: t('meetingRequestConfirmTitle'),
      message: t('meetingRequestConfirmWhatsapp'),
      confirmLabel: t('meetingRequestConfirmCta'),
      cancelLabel: t('meetingRequestConfirmCancel'),
    })
    if (!confirmed) return

    setIsLoading(true)
    setStatus('')
    try {
      const res = await fetch('/api/investor/investment-intents', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: property.id,
          channel,
          intendedAmount: parsedIntendedAmount,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t('meetingRequestFailed'))
      setIntent(data)

      const url = whatsappUrlForChannel(channel)
      if (url) window.open(url, '_blank', 'noopener,noreferrer')
      router.push('/dashboard/activity')
    } catch (error) {
      setStatus(error.message || t('meetingRequestFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  const cancelMeetingRequest = async () => {
    if (!canInvestorCancelMeetingRequest(intent?.status)) return

    const confirmed = await confirm({
      title: tAccount('cancelMeetingRequestTitle'),
      message: tAccount('cancelMeetingRequestConfirm', {
        property: property.name,
      }),
      confirmLabel: tAccount('cancelMeetingRequestCta'),
      cancelLabel: tAccount('cancelMeetingRequestKeep'),
      variant: 'destructive',
    })
    if (!confirmed) return

    setIsCancelling(true)
    setStatus('')
    try {
      const res = await fetch('/api/investor/investment-intents', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: property.id, action: 'cancel' }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || tAccount('cancelMeetingRequestFailed'))
      setIntent(data)
      setStatus(tAccount('cancelMeetingRequestDone'))
    } catch (error) {
      setStatus(error.message || tAccount('cancelMeetingRequestFailed'))
    } finally {
      setIsCancelling(false)
    }
  }

  const pendingDeposit = deposits.find((row) => row.status === 'PENDING')
  const confirmedDeposit = deposits.find((row) => row.status === 'CONFIRMED')
  const intentCancelled = intent?.status === 'CANCELLED'
  const depositStepUnlocked =
    canInvestorSubmitDeposit(intent?.status) || Boolean(pendingDeposit) || Boolean(confirmedDeposit)
  const showScheduleStep = !depositStepUnlocked
  const canSubmitDeposit =
    canInvestorSubmitDeposit(intent?.status) && !pendingDeposit && !confirmedDeposit
  const meetingAlreadyRequested = intent?.status === 'MEETING_REQUESTED'

  if (!hasLoaded) {
    return (
      <Card className="border-border/80 shadow-md">
        <CardHeader>
          <CardTitle className="font-heading text-2xl text-primary">{t('approvedTitle')}</CardTitle>
          <CardDescription>{t('loadingInvestStep')}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="border-border/80 shadow-md">
      <CardHeader>
        <CardTitle className="font-heading text-2xl text-primary">
          {depositStepUnlocked ? t('depositStepTitle') : t('approvedTitle')}
        </CardTitle>
        <CardDescription>
          {depositStepUnlocked ? t('depositStepBody') : t('approvedBody')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="rounded-lg border border-border/70 bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          {t('noWireInApp')}
        </p>

        {intentCancelled ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm">
            {t('intentCancelled')}
          </div>
        ) : null}

        {confirmedDeposit ? (
          <div className="rounded-lg border border-main-gold/40 bg-main-gold/10 px-4 py-3 text-sm">
            {t('depositConfirmed')}
          </div>
        ) : null}

        {pendingDeposit ? (
          <div className="rounded-lg border border-border px-4 py-3 text-sm">
            {t('depositPendingReview')}
            {pendingDeposit.hasReceipt ? (
              <a
                href={`/api/deposit-receipts/${pendingDeposit.id}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 block text-primary underline"
              >
                {t('viewReceipt')}
              </a>
            ) : null}
          </div>
        ) : null}

        {showScheduleStep ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="intended-amount">{t('intendedAmountLabel')}</Label>
              <Input
                id="intended-amount"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                required
                value={intendedAmountDisplay}
                onChange={onIntendedAmountChange}
                placeholder={t('intendedAmountPlaceholder')}
                aria-invalid={intendedAmount !== '' && !hasValidIntendedAmount}
              />
              <p className="text-xs text-muted-foreground">
                {isLastSlice
                  ? t('intendedAmountLastSliceHint', {
                      remaining: remainingLabel,
                      amount: minAmountLabel,
                    })
                  : t('intendedAmountMinHint', {
                      amount: minAmountLabel,
                      max: remainingLabel,
                    })}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Button
                type="button"
                disabled={isLoading || !links.whatsappConfigured || !hasValidIntendedAmount}
                onClick={() => requestMeeting('VIDEO_CALL')}
                className="gap-2"
              >
                <Video className="size-4" aria-hidden />
                {meetingAlreadyRequested ? t('remessageVideoCall') : t('messageVideoCall')}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isLoading || !links.whatsappConfigured || !hasValidIntendedAmount}
                onClick={() => requestMeeting('PHONE_CALL')}
                className="gap-2"
              >
                <Phone className="size-4" aria-hidden />
                {meetingAlreadyRequested ? t('remessagePhoneCall') : t('messagePhoneCall')}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isLoading || !links.whatsappConfigured || !hasValidIntendedAmount}
                onClick={() => requestMeeting('IN_PERSON')}
                className="gap-2"
              >
                <MapPin className="size-4" aria-hidden />
                {meetingAlreadyRequested ? t('remessageInPerson') : t('messageInPerson')}
              </Button>
            </div>

            {meetingAlreadyRequested ? (
              <div className="text-sm">
                <button
                  type="button"
                  disabled={isCancelling || isLoading}
                  onClick={cancelMeetingRequest}
                  className="cursor-pointer text-destructive underline-offset-4 hover:underline disabled:opacity-50"
                >
                  {isCancelling
                    ? tAccount('cancelMeetingRequestWorking')
                    : tAccount('cancelMeetingRequestCta')}
                </button>
              </div>
            ) : null}

            {!links.whatsappConfigured ? (
              <p className="text-sm text-destructive">{t('meetingLinksMissing')}</p>
            ) : null}
          </>
        ) : null}

        {canSubmitDeposit ? (
          <DepositConfirmForm
            propertyId={property.id}
            minAmount={effectiveMin}
            onSubmitted={() => refresh()}
          />
        ) : null}

        {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
      </CardContent>
    </Card>
  )
}
