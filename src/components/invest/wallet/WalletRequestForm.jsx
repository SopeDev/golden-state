'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Landmark, Repeat2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import WalletRequestDetails from '@/components/invest/wallet/WalletRequestDetails'
import WalletRequestReview from '@/components/invest/wallet/WalletRequestReview'
import WalletRequestSuccess from '@/components/invest/wallet/WalletRequestSuccess'

export default function WalletRequestForm({ form }) {
  const t = useTranslations('ActivityPage')
  const isReinvest = form.mode === 'reinvest'
  const inputId = isReinvest ? 'reinvestAmount' : 'cashAmount'
  const [step, setStep] = useState('details')
  const [submitted, setSubmitted] = useState(null)

  useEffect(() => {
    if (form.mode) {
      setStep('details')
      setSubmitted(null)
    }
  }, [form.mode])

  const goToReview = (event) => {
    event.preventDefault()
    if (form.canSubmit) setStep('review')
  }

  const confirm = async () => {
    const summary = {
      amount: form.parsedAmount,
      property: form.selectedTarget,
      mode: form.mode,
    }
    if (await form.submit()) {
      setSubmitted(summary)
      setStep('success')
    }
  }

  return (
    <Dialog open={Boolean(form.mode)} onOpenChange={(open) => !open && form.close()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        {step === 'success' ? (
          <WalletRequestSuccess submitted={submitted} onDone={form.close} />
        ) : (
          <>
            <DialogHeader>
              <div className="mb-1 flex size-11 items-center justify-center rounded-full bg-main-gold/15 text-main-gold">
                {isReinvest ? <Repeat2 className="size-5" /> : <Landmark className="size-5" />}
              </div>
              <DialogTitle className="text-2xl">
                {isReinvest ? t('reinvestFormTitle') : t('cashOutFormTitle')}
              </DialogTitle>
              <DialogDescription>
                {isReinvest ? t('reinvestFlowDesc') : t('cashOutFlowDesc')}
              </DialogDescription>
            </DialogHeader>

            <StepIndicator step={step} />

            {step === 'details' ? (
              <WalletRequestDetails
                form={form}
                inputId={inputId}
                isReinvest={isReinvest}
                onSubmit={goToReview}
              />
            ) : (
              <WalletRequestReview form={form} isReinvest={isReinvest} />
            )}

            {form.status ? (
              <p className="text-sm text-destructive" role="alert">{form.status}</p>
            ) : null}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={step === 'review' ? () => setStep('details') : form.close}>
                {step === 'review' ? t('back') : t('cancel')}
              </Button>
              {step === 'details' ? (
                <Button type="submit" form="wallet-request-details" disabled={!form.canSubmit}>
                  {t('reviewRequest')}
                </Button>
              ) : (
                <Button type="button" disabled={form.submitting} onClick={confirm}>
                  {form.submitting
                    ? t('submitting')
                    : isReinvest
                      ? t('confirmReinvest')
                      : t('confirmCashOut')}
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

const StepIndicator = ({ step }) => {
  const t = useTranslations('ActivityPage')
  return (
    <div className="grid grid-cols-2 overflow-hidden rounded-lg bg-muted/60 p-1 text-center text-xs font-medium">
      <span className={cn('rounded-md px-3 py-2', step === 'details' && 'bg-background text-primary shadow-sm')}>
        {t('stepDetails')}
      </span>
      <span className={cn('rounded-md px-3 py-2', step === 'review' && 'bg-background text-primary shadow-sm')}>
        {t('stepReview')}
      </span>
    </div>
  )
}
