'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from '@/i18n/navigation'
import { resolveInvestorOnboardingPath } from '@/lib/auth/userStatus'

export default function AccountOnboardingRedirect({ allowedPath }) {
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    const user = session?.user
    if (!user) return

    if (user.type === 'ADMIN' || user.accountStatus === 'ACTIVE') {
      router.replace('/dashboard')
      return
    }

    const nextPath = resolveInvestorOnboardingPath(user)
    if (nextPath && nextPath !== allowedPath) {
      router.replace(nextPath)
    }
  }, [session, allowedPath, router])

  return null
}
