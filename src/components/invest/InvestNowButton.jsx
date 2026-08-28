'use client'

import { useSession } from 'next-auth/react'
import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { resolveInvestNextStep } from '@/lib/auth/userStatus'
import { isPropertyOpenForInvestment } from '@/lib/propertyFunding'
import { trackGaEvent } from '@/lib/analytics'

function closedLabel(t, propertyStatus, executionStatus) {
  if (executionStatus === 'COMPLETED') return t('investCompleted')
  if (propertyStatus === 'FUNDED') return t('investFullyFunded')
  return t('investClosed')
}

export default function InvestNowButton({
  propertyId,
  propertyStatus,
  executionStatus,
  className,
}) {
  const { data: session, status } = useSession()
  const t = useTranslations('PropertyDetails')
  const locale = useLocale()
  const open = isPropertyOpenForInvestment(propertyStatus)

  if (!open) {
    return (
      <span
        className={cn(
          buttonVariants({ variant: 'outline', size: 'cta' }),
          'w-full cursor-not-allowed opacity-70',
          className
        )}
        aria-disabled
      >
        {closedLabel(t, propertyStatus, executionStatus)}
      </span>
    )
  }

  if (status === 'loading') {
    return (
      <span
        className={cn(
          buttonVariants({ variant: 'gold', size: 'cta' }),
          'w-full opacity-60',
          className
        )}
      >
        …
      </span>
    )
  }

  const step = resolveInvestNextStep(status === 'authenticated' ? session?.user : null, {
    investmentId: propertyId,
    propertyOpen: true,
  })

  return (
    <Link
      href={step.href}
      onClick={() => trackGaEvent('invest_intent', {
        property_id: String(propertyId),
        property_status: propertyStatus,
        user_state: status === 'authenticated' ? 'authenticated' : 'anonymous',
        destination: step.href,
        cta_location: 'property_sidebar',
        locale,
      })}
      className={cn(buttonVariants({ variant: 'gold', size: 'cta' }), 'w-full', className)}
    >
      {t('investNow')}
    </Link>
  )
}
