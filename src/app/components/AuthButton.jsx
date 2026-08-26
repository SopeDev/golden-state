'use client'

import { useSession } from 'next-auth/react'
import { Link } from '@/i18n/navigation'
import { buttonVariants } from '@/components/ui/button'

/** Signed-out auth actions. Signed-in users use AccountNavMenu instead. */
export default function AuthButton({ t, onNavigate }) {
  const { data: session } = useSession()

  if (session?.user) return null

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/login"
        onClick={onNavigate}
        className={buttonVariants({ variant: 'default', size: 'default' })}
      >
        {t('signIn')}
      </Link>
      <Link
        href="/register"
        onClick={onNavigate}
        className={buttonVariants({ variant: 'gold', size: 'default' })}
      >
        {t('register')}
      </Link>
    </div>
  )
}
