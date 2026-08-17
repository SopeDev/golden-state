'use client'

import { useEffect } from 'react'
import { cn } from '@/lib/utils'
import { ADMIN_PAGE_SIZE } from '@/components/admin/AdminListPagination'

export function pageForRecord(items, recordId, pageSize = ADMIN_PAGE_SIZE) {
  if (!recordId) return 1
  const index = items.findIndex((row) => String(row.id) === String(recordId))
  if (index < 0) return 1
  return Math.floor(index / pageSize) + 1
}

export function useScrollToAdminRecord(recordId) {
  useEffect(() => {
    if (!recordId) return undefined
    const timer = window.setTimeout(() => {
      document.getElementById(`admin-record-${recordId}`)?.scrollIntoView({
        block: 'center',
        behavior: 'smooth',
      })
    }, 80)
    return () => window.clearTimeout(timer)
  }, [recordId])
}

export function adminRecordRowClass(recordId, rowId) {
  return cn(
    String(recordId || '') === String(rowId) && 'bg-main-gold/15 ring-2 ring-inset ring-main-gold/40'
  )
}
