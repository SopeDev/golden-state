'use client'

import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function InvestNowButton({ propertyId, className }) {
  const { data: session, status } = useSession()
  const t = useTranslations('PropertyDetails')
  const label = t('investNow')

  if (status === 'loading') {
    return (
      <span className={cn(buttonVariants({ variant: 'gold', size: 'cta' }), 'w-full opacity-60', className)}>
        …
      </span>
    )
  }

  if (!session?.user) {
    return (
      <Link
        href={`/login?callbackUrl=/properties/${propertyId}/invest`}
        className={cn(buttonVariants({ variant: 'gold', size: 'cta' }), 'w-full', className)}
      >
        {label}
      </Link>
    )
  }

  const user = session.user

  if (user.type !== 'ADMIN' && user.accountStatus !== 'ACTIVE') {
    return (
      <Link
        href="/dashboard"
        className={cn(buttonVariants({ variant: 'outline', size: 'cta' }), 'w-full', className)}
      >
        {label}
      </Link>
    )
  }

  if (user.type !== 'ADMIN' && user.accreditedStatus !== 'APPROVED') {
    return (
      <Link
        href={`/properties/${propertyId}/invest`}
        className={cn(buttonVariants({ variant: 'gold', size: 'cta' }), 'w-full', className)}
      >
        {label}
      </Link>
    )
  }

  return (
    <Link
      href={`/properties/${propertyId}/invest`}
      className={cn(buttonVariants({ variant: 'gold', size: 'cta' }), 'w-full', className)}
    >
      {label}
    </Link>
  )
}
