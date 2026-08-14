'use client'

import { Suspense } from 'react'
import { usePathname } from '@/i18n/navigation'
import AdminSidebar from './AdminSidebar'

function SidebarFallback() {
  return (
    <aside className="sticky top-0 hidden h-[calc(100vh-76px)] w-56 shrink-0 border-r border-border/80 bg-background lg:block" />
  )
}

export default function AdminShell({ children }) {
  const pathname = usePathname()
  const isPreview = pathname.includes('/admin/content/preview')

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
