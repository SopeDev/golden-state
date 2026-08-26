
'use client'

import { Suspense, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { usePathname } from '@/i18n/navigation'
import { useRouter } from '@/i18n/navigation'
import {
  canAccessOperatorAdminPage,
  getAdminLandingPath,
} from '@/lib/operatorPermissions'
import AdminSidebar from './AdminSidebar'

function SidebarFallback() {
  return (
    <aside className="sticky top-0 hidden h-[calc(100vh-76px)] w-56 shrink-0 border-r border-border/80 bg-background lg:block" />
  )
}

export default function AdminShell({ children }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const isPreview = pathname.includes('/admin/content/preview')
  const canAccess = canAccessOperatorAdminPage(session?.user, pathname, {
    hasPropertyId: searchParams.has('id'),
  })

  useEffect(() => {
    if (status === 'loading' || canAccess) return
    router.replace(getAdminLandingPath(session?.user))
  }, [canAccess, router, session?.user, status])

  if (status !== 'loading' && !canAccess) {
    return null
  }

  if (isPreview) {
    return children
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-background lg:flex-row">
      <Suspense fallback={<SidebarFallback />}>
        <AdminSidebar />
      </Suspense>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
