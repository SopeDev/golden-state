'use client'

import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import {
  adminPropertyPath,
  adminUserPath,
  formatAdminPropertyLabel,
} from '@/lib/adminLinks'

const linkClassName =
  'font-medium text-primary underline-offset-2 transition-colors hover:text-main-gold hover:underline'

export function AdminPropertyLink({ property, propertyId, children, className }) {
  const id = propertyId || property?.id
  if (!id) {
    return <span className={className}>{children ?? formatAdminPropertyLabel(property)}</span>
  }

  return (
    <Link
      href={adminPropertyPath(id)}
      className={cn(linkClassName, className)}
      onClick={(event) => event.stopPropagation()}
    >
      {children ?? formatAdminPropertyLabel(property)}
    </Link>
  )
}

export function AdminInvestorLink({ user, userId, children, className }) {
  const id = userId ?? user?.id
  const label = children ?? user?.email ?? (id != null ? `#${id}` : '—')
  if (id == null || id === '') {
    return <span className={className}>{label}</span>
  }

  return (
    <Link
      href={adminUserPath(id)}
      className={cn(linkClassName, className)}
      onClick={(event) => event.stopPropagation()}
    >
      {label}
    </Link>
  )
}
