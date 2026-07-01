import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { ArrowRight, CheckCircle2, Circle, Clock, Mail } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default async function AccountPendingContent({ email }) {
  const t = await getTranslations('Account')

  const steps = [
    { label: t('pendingStep1'), detail: t('pendingStep1Detail'), state: 'done' },
    { label: t('pendingStep2'), detail: t('pendingStep2Detail'), state: 'current' },
    { label: t('pendingStep3'), detail: t('pendingStep3Detail'), state: 'upcoming' },
  ]

  return (
    <div className="flex-1 bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16 lg:py-20">
        {/* Intro — full width */}
        <header className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-main-gold">
            {t('pendingEyebrow')}
          </p>
          <h1 className="mt-4 font-heading text-3xl leading-tight text-primary md:text-4xl lg:text-[2.75rem]">
            {t('pendingTitle')}
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
            {t('pendingLead')}
          </p>
          <div className="mt-8 flex gap-3 border-l-2 border-main-gold bg-muted/40 py-4 pl-5 pr-4">
            <Clock className="mt-0.5 size-5 shrink-0 text-main-gold" aria-hidden />
            <p className="text-sm leading-relaxed text-foreground md:text-base">{t('pendingSla')}</p>
          </div>
        </header>

        {/* Timeline + explore — side by side */}
        <div className="mt-12 grid grid-cols-1 items-start gap-10 border-t border-border pt-12 lg:grid-cols-12 lg:gap-12 xl:gap-16">
          <section className="lg:col-span-7">
            <h2 className="font-heading text-xl text-primary md:text-2xl">{t('pendingTimelineTitle')}</h2>
            <ol className="mt-6 space-y-0">
              {steps.map((step, index) => (
                <li key={step.label} className="relative flex gap-4 pb-8 last:pb-0">
                  {index < steps.length - 1 ? (
                    <span
                      className="absolute left-[11px] top-7 h-[calc(100%-1.25rem)] w-px bg-border"
                      aria-hidden
                    />
                  ) : null}
                  <span className="relative z-10 mt-0.5 shrink-0">
                    {step.state === 'done' ? (
                      <CheckCircle2 className="size-6 text-main-gold" aria-hidden />
                    ) : step.state === 'current' ? (
                      <span className="flex size-6 items-center justify-center rounded-full border-2 border-primary bg-primary">
                        <span className="size-2 rounded-full bg-primary-foreground" />
                      </span>
                    ) : (
                      <Circle className="size-6 text-border" aria-hidden />
                    )}
                  </span>
                  <div className="min-w-0 pt-0.5">
                    <p
                      className={cn(
                        'font-medium',
                        step.state === 'upcoming' ? 'text-muted-foreground' : 'text-primary'
                      )}
                    >
                      {step.label}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground md:text-base">
                      {step.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            {email ? (
              <p className="mt-8 flex items-start gap-2.5 text-sm text-muted-foreground md:text-base">
                <Mail className="mt-0.5 size-4 shrink-0 text-main-gold" aria-hidden />
                <span>{t('pendingEmailNote', { email })}</span>
              </p>
            ) : null}
          </section>

          <aside className="lg:col-span-5 lg:border-l lg:border-border lg:pl-12 xl:pl-16">
            <h2 className="font-heading text-2xl leading-snug text-primary">
              {t('pendingExploreHeading')}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
              {t('pendingExploreCopy')}
            </p>

            <nav className="mt-8 flex flex-col items-center gap-3" aria-label={t('pendingExploreHeading')}>
              <Link
                href="/projects"
                className={cn(
                  buttonVariants({ variant: 'gold', size: 'cta' }),
                  'group w-full justify-center gap-2 sm:w-auto'
                )}
              >
                {t('pendingBrowseProjects')}
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
              <Link
                href="/contact"
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'cta' }),
                  'justify-center px-0 hover:bg-transparent'
                )}
              >
                {t('pendingContact')}
                <ArrowRight className="size-4 opacity-60" aria-hidden />
              </Link>
            </nav>
          </aside>
        </div>
      </div>
    </div>
  )
}
