'use client'

import { usePathname } from '@/i18n/navigation'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin/properties', label: 'Property Management' },
  { href: '/admin/users', label: 'User Management' },
  { href: '/admin/content', label: 'Content Management' },
]

const navItemsDatabase = [
  { href: '/admin/data', label: 'Database Records' },
  { href: '/admin/schema', label: 'Database Schema' },
]

export default function AdminNav() {
  const pathname = usePathname()

  const linkClass = (href) =>
    cn(
      'rounded-md px-3 py-2 text-sm font-medium transition-colors',
      pathname.endsWith(href)
        ? 'bg-primary text-primary-foreground'
        : 'text-foreground hover:bg-muted hover:text-primary'
    )

  return (
    <div className="mb-8 border-b border-border bg-card shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-8">
            <h2 className="font-heading text-xl font-semibold text-primary">Admin Panel</h2>
            <nav className="flex flex-wrap gap-2 lg:gap-4">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className={linkClass(item.href)}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <nav className="flex flex-wrap gap-2 border-t border-border pt-4 lg:border-0 lg:pt-0 lg:gap-4">
            {navItemsDatabase.map((item) => (
              <Link key={item.href} href={item.href} className={linkClass(item.href)}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}
