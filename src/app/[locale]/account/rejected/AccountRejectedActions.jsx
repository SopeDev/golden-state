'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { buttonVariants } from '@/components/ui/button'
import RequestReviewButton from '@/components/invest/RequestReviewButton'
import { cn } from '@/lib/utils'

export default function AccountRejectedActions() {
  const t = useTranslations('Account')

  return (
    <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <RequestReviewButton
        scope="account"
        label={t('requestReviewCta')}
        pendingLabel={t('requestReviewSubmitted')}
        needsDocumentsLabel={t('requestReviewNeedsDocuments')}
        errorLabel={t('requestReviewFailed')}
        variant="gold"
        size="cta"
        className="w-full sm:w-auto"
      />
      <Link
        href="/contact"
        className={cn(buttonVariants({ variant: 'outline', size: 'cta' }), 'w-full sm:w-auto')}
      >
        {t('rejectedContactCta')}
      </Link>
      <Link
        href="/projects"
        className={cn(buttonVariants({ variant: 'outline', size: 'cta' }), 'w-full sm:w-auto')}
      >
        {t('rejectedBrowseProjects')}
      </Link>
    </div>
  )
}
