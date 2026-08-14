'use client'

import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/navigation'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useMessaging } from '@/hooks/useMessaging'
import { resolveInvestNextStep } from '@/lib/auth/userStatus'
import { isPropertyOpenForInvestment } from '@/lib/propertyFunding'

const buttonClass =
  'w-full border-main-gold text-main-gold hover:border-main-gold hover:bg-main-gold/10 hover:text-main-gold'

export default function ViewProgressDocumentsButton({
  propertyId,
  investmentId,
  propertyStatus,
  canView = false,
}) {
  const t = useTranslations('PropertyDetails')
  const { alert } = useMessaging()
  const { data: session, status } = useSession()
  const router = useRouter()

  if (canView && propertyId) {
    return (
      <Link
        href={`/dashboard/portfolio/${propertyId}/documents`}
        className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), buttonClass)}
      >
        {t('viewProgressDocuments')}
      </Link>
    )
  }

  const handleBlockedClick = async () => {
    const user = status === 'authenticated' ? session?.user : null
    const step = resolveInvestNextStep(user, {
      investmentId,
      propertyOpen: isPropertyOpenForInvestment(propertyStatus),
    })
    const actionLabel = t(`investNextStep.${step.ctaKey}`)

    const result = await alert({
      title: t('progressDocumentsBlockedTitle'),
      message: t('progressDocumentsBlocked'),
      confirmLabel: t('close'),
      actionLabel,
    })

    if (result === 'action') {
      router.push(step.href)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className={buttonClass}
      onClick={handleBlockedClick}
    >
      {t('viewProgressDocuments')}
    </Button>
  )
}
