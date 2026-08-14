'use client'

import { cn } from '@/lib/utils'
import { getPropertyCardHighlights } from '@/lib/propertyCardHighlights'

export default function PropertyCardHighlights({ property, locale = 'en', className }) {
  const highlights = getPropertyCardHighlights(property, locale)
  if (!highlights.length) return null

  return (
    <dl className={cn('grid grid-cols-2 gap-3', className)}>
      {highlights.map((item) => (
        <div key={item.key} className="min-w-0 text-center">
          <dt className="truncate text-[10px] uppercase tracking-wide text-muted-foreground">
            {item.label}
          </dt>
          <dd className="mt-1 truncate text-sm font-semibold text-primary">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
