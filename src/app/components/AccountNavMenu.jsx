'use client'

import { signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import {
  Briefcase,
  ChevronDown,
  Activity,
  Bell,
  LayoutDashboard,
  LogOut,
  Shield,
  UserRound,
} from 'lucide-react'
import { Link, useRouter } from '@/i18n/navigation'
import {
  resolveProtectedActivityHref,
  resolveProtectedPortfolioHref,
  resolveProtectedUpdatesHref,
} from '@/lib/auth/userStatus'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

function accountInitial(user) {
  const email = typeof user?.email === 'string' ? user.email.trim() : ''
  if (!email) return '?'
  return email.charAt(0).toUpperCase()
}

function accountPrimaryLabel(user) {
  const email = typeof user?.email === 'string' ? user.email.trim() : ''
  if (!email) return ''
  const local = email.split('@')[0] || email
  return local
}

export default function AccountNavMenu({ user, className }) {
  const t = useTranslations('Navbar')
  const router = useRouter()
  const dashboardHref = '/dashboard'
  const portfolioHref = resolveProtectedPortfolioHref(user)
  const activityHref = resolveProtectedActivityHref(user)
  const updatesHref = resolveProtectedUpdatesHref(user)
  const myAccountHref = '/dashboard/account'
  const email = typeof user?.email === 'string' ? user.email : ''
  const primary = accountPrimaryLabel(user) || t('account')

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/')
    router.refresh()
  }

  // Activity hosts investment requests + returns wallet.
  const links = [
    { href: dashboardHref, label: t('dashboard'), icon: LayoutDashboard },
    { href: portfolioHref, label: t('portfolio'), icon: Briefcase },
    { href: activityHref, label: t('activity'), icon: Activity },
    { href: updatesHref, label: t('updates'), icon: Bell },
    { href: myAccountHref, label: t('myAccount'), icon: UserRound },
    ...(user?.type === 'ADMIN'
      ? [{ href: '/admin', label: t('admin'), icon: Shield }]
      : []),
  ]

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        className={cn(
          'inline-flex h-10 max-w-[12.5rem] cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-2.5 text-sm text-primary outline-none transition-colors',
          'hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
          'data-popup-open:bg-muted',
          className
        )}
        aria-label={t('accountMenuAria')}
      >
        <span
          className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground"
          aria-hidden
        >
          {accountInitial(user)}
        </span>
        <span className="min-w-0 flex-1 truncate text-left font-medium">{primary}</span>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="min-w-56 w-64 p-1.5">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {t('account')}
            </p>
            {email ? (
              <p className="mt-1 truncate text-sm font-medium text-foreground">{email}</p>
            ) : null}
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          {links.map((item) => {
            const Icon = item.icon
            return (
              <DropdownMenuItem
                key={item.href}
                nativeButton={false}
                className="cursor-pointer gap-2.5 px-2 py-2"
                render={<Link href={item.href} />}
              >
                <Icon className="size-4 text-muted-foreground" aria-hidden />
                <span>{item.label}</span>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          className="cursor-pointer gap-2.5 px-2 py-2"
          onClick={handleSignOut}
        >
          <LogOut className="size-4" aria-hidden />
          <span>{t('signOut')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
