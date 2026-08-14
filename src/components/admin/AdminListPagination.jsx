'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

export const ADMIN_PAGE_SIZE = 20

export function paginateItems(items, page, pageSize = ADMIN_PAGE_SIZE) {
  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const start = (safePage - 1) * pageSize
  return {
    page: safePage,
    totalPages,
    total,
    pageSize,
    items: items.slice(start, start + pageSize),
    from: total === 0 ? 0 : start + 1,
    to: Math.min(start + pageSize, total),
  }
}

export default function AdminListPagination({ page, totalPages, total, from, to, onPageChange }) {
  const t = useTranslations('Admin.common')

  if (total <= 0) return null

  return (
    <div className="flex flex-col gap-3 border-t border-border/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-muted-foreground">
        {t('paginationRange', { from, to, total })}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="gap-1"
        >
          <ChevronLeft className="size-4" aria-hidden />
          {t('paginationPrev')}
        </Button>
        <span className="min-w-[5.5rem] text-center text-xs font-medium text-muted-foreground">
          {t('paginationPage', { page, totalPages })}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="gap-1"
        >
          {t('paginationNext')}
          <ChevronRight className="size-4" aria-hidden />
        </Button>
      </div>
    </div>
  )
}
