'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { ArrowRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function ActivityNextAction({ action }) {
  const t = useTranslations('ActivityPage')
  if (!action) return null

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-main-gold/40 bg-main-gold/10 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-6">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-main-gold">
          {t('nextActionEyebrow')}
        </p>
        <p className="mt-2 font-heading text-xl font-semibold text-primary md:text-2xl">
          {t('nextActionDepositBody', {
            property: action.propertyName || t('nextActionThisProject'),
          })}
        </p>
      </div>

      <Link
        href={action.href}
        className={cn(buttonVariants({ variant: 'gold', size: 'default' }), 'shrink-0 gap-1.5')}
      >
        {t('nextActionDepositCta')}
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </section>
  )
}
