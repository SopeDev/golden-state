'use client'

import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function FaqPageClient({ content, sections }) {
  return (
    <div className="flex-1 bg-background">
      <section className="relative overflow-hidden border-b border-border text-primary-foreground">
        <div className="absolute inset-0">
          <Image
            src="/images/skyline-3_1920.webp"
            alt={content.heroTitle}
            fill
            priority
            className="object-cover object-[center_35%]"
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/92 via-primary/82 to-secondary-blue/78" aria-hidden />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(212,175,55,0.22),transparent_45%)]" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 py-14 md:py-20">
          <div className="max-w-3xl">
            <h1 className="font-heading text-4xl font-semibold tracking-tight md:text-5xl">{content.heroTitle}</h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-primary-foreground/90 md:text-lg">
              {content.heroSubtitle}
            </p>
            {content.intro && (
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-primary-foreground/80 md:text-base">
                {content.intro}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12 md:py-14">
        <div className="mb-8 flex flex-wrap gap-2">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#faq-${section.id}`}
              className="rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:border-main-gold/50 hover:text-main-gold"
            >
              {section.title}
            </a>
          ))}
        </div>

        <div className="space-y-10">
          {sections.map((section) => (
            <section id={`faq-${section.id}`} key={section.id}>
              <h2 className="font-heading mb-4 text-2xl font-semibold text-primary md:text-3xl">{section.title}</h2>
              <ul className="space-y-6">
                {section.items.map((item, index) => (
                  <li key={`${section.id}-${index}`} className="rounded-xl border border-border/80 bg-card p-6 shadow-sm">
                    <h3 className="font-heading text-xl font-semibold text-primary">{item.question}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">{item.answer}</p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-12 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <h3 className="font-heading text-2xl font-semibold text-primary">{content.bottomCtaTitle}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
              {content.bottomCtaBody}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/contact" className={buttonVariants({ variant: 'gold', size: 'lg' })}>
              {content.bottomCtaPrimary}
            </Link>
            <Link
              href="/projects"
              className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'border-primary/30')}
            >
              {content.bottomCtaSecondary}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
