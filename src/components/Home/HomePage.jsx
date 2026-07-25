'use client'

import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { useLocale, useTranslations } from 'next-intl'
import {
  ShieldCheck,
  Globe2,
  TrendingUp,
  CheckCircle2,
  Users,
  ScrollText,
  Sparkles,
  BarChart3,
  LayoutDashboard,
  HandshakeIcon,
  Building2,
  Hammer,
  ArrowRight,
} from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { getPropertyTypeBadgeClass, resolvePropertyTypeLabel } from '@/lib/propertyTypeUi'
import { getPropertyTypeDescription, getPropertyTypeLabel } from '@/lib/propertyTypes'

const STRATEGY_ICON_BY_SLUG = {
  'build-to-sell': Building2,
  'build-to-rent': LayoutDashboard,
  fliphouses: Hammer,
  'mex-to-us': Globe2,
  'us-to-mex': Globe2,
}

/** Optional Home content overrides keyed by slug for seeded types. */
const STRATEGY_CONTENT_KEY_BY_SLUG = {
  'build-to-sell': 'BuildToSell',
  'build-to-rent': 'BuildToRent',
  fliphouses: 'Fliphouse',
  'mex-to-us': 'MexToUs',
  'us-to-mex': 'UsToMex',
}

const REASON_ICONS = [TrendingUp, Sparkles, CheckCircle2, Users, ScrollText, LayoutDashboard, Globe2, HandshakeIcon, ShieldCheck, BarChart3]

/**
 * Stats band layout (change one value to try another):
 * - 'overlap'     — white card pulled up over hero bottom (current)
 * - 'solid'       — full-width navy band (original)
 * - 'light-strip' — light background strip, no overlap
 */
export const HOME_STATS_LAYOUT = 'overlap'

/**
 * Stats card pull-up over hero (px). Gradient fade uses matching h-*.
 * Edit only these values — margin and gradient stay in sync.
 */
const HOME_STATS_OVERLAP_SIZE = {
  base: 24,
  sm: 28,
  md: 32,
  lg: 44,
}

const buildOverlapSpacing = (size) => ({
  margin: `-mt-${size.base} sm:-mt-${size.sm} md:-mt-${size.md} lg:-mt-${size.lg}`,
  gradientHeight: `h-${size.base} sm:h-${size.sm} md:h-${size.md} lg:h-${size.lg}`,
})

const HOME_STATS_OVERLAP = buildOverlapSpacing(HOME_STATS_OVERLAP_SIZE)

// Ensures Tailwind generates h-* / -mt-* utilities used by buildOverlapSpacing
const _overlapTailwindSafelist =
  'h-24 sm:h-28 md:h-32 lg:h-44 -mt-24 sm:-mt-28 md:-mt-32 lg:-mt-44'
void _overlapTailwindSafelist

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(amount))

function Eyebrow({ children }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-main-gold">
      {children}
    </p>
  )
}

function getStatsCells(content) {
  return [
    { value: content.stat1Value, label: content.stat1Label },
    { value: content.stat2Value, label: content.stat2Label },
    { value: content.stat3Value, label: content.stat3Label },
    { value: content.stat4Value, label: content.stat4Label },
  ].filter((cell) => cell.value || cell.label)
}

function StatsIntro({ content, titleClassName = 'text-primary' }) {
  return (
    <>
      <Eyebrow>{content.statsKicker}</Eyebrow>
      <h2 className={cn('font-heading mt-3 max-w-3xl text-2xl font-semibold md:text-3xl', titleClassName)}>
        {content.statsTitle}
      </h2>
    </>
  )
}

function StatsGrid({ cells, variant = 'overlap' }) {
  const cellClass =
    variant === 'solid'
      ? 'rounded-xl border border-primary-foreground/15 bg-primary-foreground/5 px-4 py-5'
      : variant === 'light-strip'
        ? 'rounded-xl border border-border/80 bg-card px-4 py-5 shadow-sm'
        : 'rounded-xl border border-border/70 bg-muted/30 px-4 py-5'

  const valueClass = variant === 'solid' ? 'text-main-gold' : 'text-main-gold'
  const labelClass =
    variant === 'solid' ? 'text-primary-foreground/75' : 'text-muted-foreground'

  return (
    <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
      {cells.map((cell, index) => (
        <div key={index} className={cellClass}>
          <p className={cn('font-heading text-3xl font-semibold md:text-4xl', valueClass)}>{cell.value}</p>
          <p className={cn('mt-1 text-sm', labelClass)}>{cell.label}</p>
        </div>
      ))}
    </div>
  )
}

function HomeHero({ content, statsLayout = HOME_STATS_LAYOUT }) {
  const isOverlap = statsLayout === 'overlap'
  const bullets = [
    content.heroBullet1,
    content.heroBullet2,
    content.heroBullet3,
    content.heroBullet4,
    content.heroBullet5,
  ].filter(Boolean)

  return (
    <section
      className={cn(
        'relative overflow-hidden text-primary-foreground',
        !isOverlap && 'border-b border-border'
      )}
    >
      <div className="absolute inset-0">
        <Image
          src="/images/cal-skyline_1920.webp"
          alt={content.heroImageAlt || ''}
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/92 via-primary/82 to-secondary-blue/82" aria-hidden />
      <div className="pointer-events-none absolute -right-24 top-0 h-96 w-96 rounded-full bg-main-gold/25 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-white/10 blur-2xl" aria-hidden />

      {isOverlap ? (
        <div
          className={cn(
            'pointer-events-none absolute inset-x-0 bottom-0 z-[1] bg-gradient-to-t from-background via-background/40 to-transparent',
            HOME_STATS_OVERLAP.gradientHeight
          )}
          aria-hidden
        />
      ) : null}

      <div
        className={cn(
          'relative z-10 mx-auto flex min-h-[min(88vh,52rem)] max-w-6xl items-center px-4 py-20 sm:py-24 lg:py-28',
          isOverlap && 'pb-40 sm:pb-48 md:pb-54 lg:pb-60'
        )}
      >
        <div className="max-w-3xl">
          <Eyebrow>{content.heroEyebrow}</Eyebrow>
          <h1 className="font-heading mt-4 text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl lg:text-6xl">
            {content.heroTitle}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-primary-foreground/85 md:text-xl">
            {content.heroSubtitle}
          </p>

          {bullets.length > 0 ? (
            <ul className="mt-8 space-y-2">
              {bullets.map((bullet, index) => (
                <li key={index} className="flex items-start gap-3 text-sm text-primary-foreground/90 md:text-base">
                  <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-main-gold/20 text-main-gold">
                    <CheckCircle2 className="size-3.5" aria-hidden />
                  </span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/projects" className={buttonVariants({ variant: 'gold', size: 'cta' })}>
              {content.heroPrimaryCta}
            </Link>
            <a
              href="#how-it-works"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'lg' }),
                'border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10'
              )}
            >
              {content.heroSecondaryCta}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

function HomeStats({ content, layout = HOME_STATS_LAYOUT }) {
  const cells = getStatsCells(content)
  if (cells.length === 0) return null

  if (layout === 'solid') {
    return (
      <section className="border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <StatsIntro content={content} titleClassName="text-primary-foreground" />
          <StatsGrid cells={cells} variant="solid" />
        </div>
      </section>
    )
  }

  if (layout === 'light-strip') {
    return (
      <section className="border-b border-border bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-14">
          <StatsIntro content={content} />
          <StatsGrid cells={cells} variant="light-strip" />
        </div>
      </section>
    )
  }

  // overlap (default)
  return (
    <section className={cn('relative z-20', HOME_STATS_OVERLAP.margin)}>
      <div className="mx-auto max-w-6xl px-4 pb-6 md:pb-8">
        <div className="rounded-2xl border border-border/80 bg-card px-5 py-8 shadow-xl sm:px-8 md:px-10 md:py-10">
          <StatsIntro content={content} />
          <StatsGrid cells={cells} variant="overlap" />
        </div>
      </div>
    </section>
  )
}

function HomeWhatIs({ content }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <Eyebrow>{content.whatIsKicker}</Eyebrow>
      <h2 className="font-heading mt-3 max-w-3xl text-3xl font-semibold text-primary md:text-4xl">
        {content.whatIsTitle}
      </h2>
      <div className="mt-6 space-y-5 text-base leading-relaxed text-muted-foreground md:text-lg">
        {content.whatIsBody1 ? <p>{content.whatIsBody1}</p> : null}
        {content.whatIsBody2 ? <p>{content.whatIsBody2}</p> : null}
        {content.whatIsBody3 ? <p className="font-medium text-primary">{content.whatIsBody3}</p> : null}
      </div>
    </section>
  )
}

function HomeWhyUs({ content }) {
  const hasVideo = Boolean(content.whyUsVideoUrl)

  return (
    <section className="border-y border-main-gold/25 bg-off-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 lg:grid-cols-2 lg:items-center">
        <div>
          <Eyebrow>{content.whyUsKicker}</Eyebrow>
          <h2 className="font-heading mt-3 max-w-2xl text-3xl font-semibold text-primary md:text-4xl">
            {content.whyUsTitle}
          </h2>
          <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground md:text-lg">
            {content.whyUsBody1 ? <p>{content.whyUsBody1}</p> : null}
            {content.whyUsBody2 ? <p>{content.whyUsBody2}</p> : null}
          </div>
        </div>
        <div>
          {hasVideo ? (
            <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-lg">
              <div className="aspect-video bg-black">
                <iframe
                  src={content.whyUsVideoUrl}
                  title="Golden State explainer"
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              {content.whyUsVideoCaption ? (
                <p className="px-5 py-3 text-sm text-muted-foreground">{content.whyUsVideoCaption}</p>
              ) : null}
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-xl border border-border/80 bg-card shadow-lg">
              <div className="aspect-video">
                <Image
                  src="/images/skyline-3_1920.webp"
                  alt=""
                  fill
                  className="object-cover object-[center_35%]"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/85 to-secondary-blue/65" aria-hidden />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="rounded-full border border-main-gold/40 bg-primary/40 px-5 py-2 text-sm font-semibold text-main-gold backdrop-blur-sm">
                    {content.whyUsVideoCaption || 'Video coming soon'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function HomeStrategies({ content, propertyTypes = [] }) {
  const tProjects = useTranslations('Projects')
  const locale = useLocale()

  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <div className="max-w-3xl">
        <Eyebrow>{content.strategiesKicker}</Eyebrow>
        <h2 className="font-heading mt-3 text-3xl font-semibold text-primary md:text-4xl">
          {content.strategiesTitle}
        </h2>
        {content.strategiesSubtitle ? (
          <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
            {content.strategiesSubtitle}
          </p>
        ) : null}
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {propertyTypes.map((type) => {
          const contentKey = STRATEGY_CONTENT_KEY_BY_SLUG[type.slug]
          const title =
            (contentKey && content[`strategy${contentKey}Title`]) ||
            getPropertyTypeLabel(type, locale)
          const timeline = contentKey ? content[`strategy${contentKey}Timeline`] : null
          const body =
            (contentKey && content[`strategy${contentKey}Body`]) ||
            getPropertyTypeDescription(type, locale)
          const Icon = STRATEGY_ICON_BY_SLUG[type.slug] || Building2

          return (
            <Card
              key={type.id}
              className="group flex h-full flex-col gap-4 border-border/80 bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="flex size-10 items-center justify-center rounded-lg bg-main-gold/15 text-main-gold">
                  <Icon className="size-5" aria-hidden />
                </span>
                {timeline ? (
                  <span className="rounded-full border border-border bg-background px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {timeline}
                  </span>
                ) : null}
              </div>
              <h3 className="font-heading text-xl font-semibold text-primary">{title}</h3>
              {body ? <p className="text-sm leading-relaxed text-muted-foreground">{body}</p> : null}
              <Link
                href={`/projects/${type.slug}`}
                className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-secondary-blue transition-colors hover:text-main-gold"
              >
                {tProjects('browseProjects')}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Card>
          )
        })}
        {content.strategyAllProjectsTitle ? (
          <Link
            href="/projects"
            className="flex h-full min-h-[17.5rem] flex-col items-center justify-center rounded-xl border border-border/80 bg-off-white px-6 py-10 text-center shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <h3 className="font-heading text-xl font-semibold text-primary md:text-2xl">
              {content.strategyAllProjectsTitle}
            </h3>
            {content.strategyAllProjectsBody ? (
              <p className="mt-3 max-w-[26ch] text-sm leading-relaxed text-muted-foreground">
                {content.strategyAllProjectsBody}
              </p>
            ) : null}
            <span className={cn(buttonVariants({ variant: 'outline', size: 'default' }), 'mt-7')}>
              {content.strategyAllProjectsCta}
            </span>
          </Link>
        ) : null}
      </div>
    </section>
  )
}

function HomeLiveOpportunities({ content, liveOpportunities }) {
  const tProjects = useTranslations('Projects')
  const locale = useLocale()

  return (
    <section className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-20">
        <div className="max-w-3xl">
          <Eyebrow>{content.liveKicker}</Eyebrow>
          <h2 className="font-heading mt-3 text-3xl font-semibold text-primary md:text-4xl">
            {content.liveTitle}
          </h2>
          {content.liveSubtitle ? (
            <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
              {content.liveSubtitle}
            </p>
          ) : null}
        </div>

        {liveOpportunities.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed border-border bg-card px-6 py-10 text-center text-sm text-muted-foreground">
            {content.liveEmpty}
          </div>
        ) : (
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {liveOpportunities.map((property) => {
              const typeLabel = resolvePropertyTypeLabel(property, locale)
              return (
                <Card
                  key={property.id}
                  className="flex h-full flex-col overflow-hidden border-border/80 py-0 shadow-sm transition-shadow hover:shadow-md gap-0"
                >
                  <Link
                    href={`/properties/${property.investmentId}`}
                    className="relative block aspect-[4/3] overflow-hidden bg-muted"
                  >
                    {property.images?.[0] ? (
                      <img
                        src={property.images[0]}
                        alt={property.name}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    ) : null}
                    <span
                      className={cn(
                        'absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                        getPropertyTypeBadgeClass(property.type)
                      )}
                    >
                      {typeLabel}
                    </span>
                  </Link>
                  <CardContent className="flex flex-1 flex-col gap-4 p-5">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        #{property.investmentId} · {property.city}, {property.state}
                      </p>
                      <Link href={`/properties/${property.investmentId}`}>
                        <h3 className="font-heading mt-1 text-lg font-semibold text-primary transition-colors hover:text-secondary-blue">
                          {property.name}
                        </h3>
                      </Link>
                    </div>

                    <dl className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">
                          {content.liveCardOpens}
                        </dt>
                        <dd className="mt-1 text-sm font-semibold text-primary">
                          {formatCurrency(property.minInvestment)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">
                          {content.liveCardRoi}
                        </dt>
                        <dd className="mt-1 text-sm font-semibold text-main-gold">{property.estimatedROI}%</dd>
                      </div>
                      <div>
                        <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">
                          {content.liveCardTimeline}
                        </dt>
                        <dd className="mt-1 text-sm font-semibold text-primary">{property.estimatedMonths} mo</dd>
                      </div>
                    </dl>

                    <Link
                      href={`/properties/${property.investmentId}`}
                      className={cn(buttonVariants({ variant: 'gold', size: 'sm' }), 'mt-auto w-full')}
                    >
                      {tProjects('viewDetails')}
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <Link
            href="/projects"
            className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'border-primary/30')}
          >
            {content.liveCta}
            <ArrowRight className="ml-1.5 size-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  )
}

function HowItWorksCta({ content, borderless = false }) {
  if (!content.howCta) return null

  return (
    <div
      className={cn(
        'relative',
        borderless ? 'mt-10' : 'border-l-2 border-main-gold/30 pl-8 md:pl-10'
      )}
    >
      <span
        className="absolute top-5 -left-[calc(2rem+1px)] flex size-8 -translate-x-1/2 items-center justify-center rounded-full border-2 border-main-gold bg-background text-main-gold md:-left-[calc(2.5rem+1px)]"
        aria-hidden
      >
        <ArrowRight className="size-4" />
      </span>
      <div className="rounded-xl border border-main-gold/25 bg-off-white p-6 shadow-sm">
        {content.howCtaLead ? (
          <p className="font-heading text-lg font-semibold text-primary md:text-xl">{content.howCtaLead}</p>
        ) : null}
        {content.howCtaBody ? (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
            {content.howCtaBody}
          </p>
        ) : null}
        <Link
          href="/register"
          className={cn(buttonVariants({ variant: 'gold', size: 'cta' }), 'mt-5 w-full sm:w-auto')}
        >
          {content.howCta}
        </Link>
      </div>
    </div>
  )
}

function HowItWorksStepList({ steps, startIndex = 0, borderless = false }) {
  if (steps.length === 0) return null

  return (
    <ol
      className={cn(
        'list-none space-y-10',
        !borderless && 'border-l-2 border-main-gold/30 pl-8 md:pl-10'
      )}
    >
      {steps.map((step, index) => {
        const stepNumber = startIndex + index + 1
        return (
          <li key={stepNumber} className="relative">
            <span
              className="absolute -left-[calc(2rem+1px)] flex size-8 -translate-x-1/2 items-center justify-center rounded-full border-2 border-main-gold/40 bg-background font-heading text-sm font-semibold text-main-gold md:-left-[calc(2.5rem+1px)]"
              aria-hidden
            >
              {stepNumber}
            </span>
            <h3 className="font-heading text-xl font-semibold text-primary">{step.title}</h3>
            {step.body ? (
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">{step.body}</p>
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}

function HomeHowItWorks({ content }) {
  const steps = Array.from({ length: 7 }, (_, i) => ({
    title: content[`how${i + 1}Title`],
    body: content[`how${i + 1}Body`],
  })).filter((step) => step.title || step.body)

  const leftSteps = steps.slice(0, 4)
  const rightSteps = steps.slice(4)

  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-20">
      <div className="max-w-3xl">
        <Eyebrow>{content.howKicker}</Eyebrow>
        <h2 className="font-heading mt-3 text-3xl font-semibold text-primary md:text-4xl">
          {content.howTitle}
        </h2>
        {content.howSubtitle ? (
          <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
            {content.howSubtitle}
          </p>
        ) : null}
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-2 lg:gap-16">
        <HowItWorksStepList steps={leftSteps} startIndex={0} />
        <div className="border-l-2 border-main-gold/30 pl-8 md:pl-10">
          <HowItWorksStepList steps={rightSteps} startIndex={4} borderless />
          <HowItWorksCta content={content} borderless />
        </div>
      </div>
    </section>
  )
}

function HomeReasons({ content }) {
  const reasons = Array.from({ length: 10 }, (_, i) => ({
    title: content[`reason${i + 1}Title`],
    body: content[`reason${i + 1}Body`],
    Icon: REASON_ICONS[i % REASON_ICONS.length],
  })).filter((reason) => reason.title)

  if (reasons.length === 0) return null

  return (
    <section className="border-y border-border bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-20">
        <div className="max-w-3xl">
          <Eyebrow>{content.reasonsKicker}</Eyebrow>
          <h2 className="font-heading mt-3 text-3xl font-semibold text-primary md:text-4xl">
            {content.reasonsTitle}
          </h2>
        </div>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {reasons.map((reason, index) => (
            <li
              key={index}
              className="flex flex-col gap-3 rounded-xl border border-border/70 bg-card p-5 shadow-sm"
            >
              <span className="flex size-9 items-center justify-center rounded-lg bg-main-gold/15 text-main-gold">
                <reason.Icon className="size-4" aria-hidden />
              </span>
              <div>
                <p className="font-heading text-sm font-semibold text-primary">{reason.title}</p>
                {reason.body ? (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{reason.body}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function HomeTrackRecord({ content, completedDeals }) {
  const tProjects = useTranslations('Projects')
  const locale = useLocale()

  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <Eyebrow>{content.trackKicker}</Eyebrow>
          <h2 className="font-heading mt-3 text-3xl font-semibold text-primary md:text-4xl">
            {content.trackTitle}
          </h2>
          {content.trackSubtitle ? (
            <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
              {content.trackSubtitle}
            </p>
          ) : null}
        </div>
      </div>

      {completedDeals.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-border bg-card px-6 py-10 text-center text-sm text-muted-foreground">
          {content.trackEmpty}
        </div>
      ) : (
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {completedDeals.map((property) => {
            const typeLabel = resolvePropertyTypeLabel(property, locale)
            return (
              <Card
                key={property.id}
                className="overflow-hidden border-border/80 py-0 shadow-sm transition-shadow hover:shadow-md gap-0"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  {property.images?.[0] ? (
                    <img
                      src={property.images[0]}
                      alt={property.name}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                  <span
                    className={cn(
                      'absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                      getPropertyTypeBadgeClass(property.type)
                    )}
                  >
                    {typeLabel}
                  </span>
                </div>
                <CardContent className="space-y-4 p-5">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {property.city}, {property.state}
                    </p>
                    <h3 className="font-heading mt-1 text-lg font-semibold text-primary">
                      {property.name}
                    </h3>
                  </div>

                  <dl className="grid grid-cols-2 gap-3">
                    <div>
                      <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        {content.trackCardReturn}
                      </dt>
                      <dd className="mt-1 text-base font-semibold text-main-gold">
                        {property.estimatedROI}%
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        {content.trackCardTimeline}
                      </dt>
                      <dd className="mt-1 text-base font-semibold text-primary">
                        {property.estimatedMonths} mo
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {content.trackCta ? (
        <div className="mt-10 flex justify-center">
          <Link
            href="/projects/completed"
            className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'border-primary/30')}
          >
            {content.trackCta}
          </Link>
        </div>
      ) : null}
    </section>
  )
}

function HomePortfolioBenefit({ content }) {
  const buildColumn = (n) => {
    const title = content[`portfolioColumn${n}Title`]
    if (!title) return null
    const stats = Array.from({ length: 3 }, (_, i) => ({
      label: content[`portfolioColumn${n}Stat${i + 1}Label`],
      value: content[`portfolioColumn${n}Stat${i + 1}Value`],
    })).filter((s) => s.label || s.value)
    return { title, stats }
  }

  const columns = [buildColumn(1), buildColumn(2)].filter(Boolean)

  return (
    <section className="border-y border-border bg-primary/95 text-primary-foreground">
      <div className="mx-auto max-w-6xl px-4 py-20">
        <div className="max-w-3xl">
          <Eyebrow>{content.portfolioKicker}</Eyebrow>
          <h2 className="font-heading mt-3 text-3xl font-semibold md:text-4xl">{content.portfolioTitle}</h2>
          {content.portfolioSubtitle ? (
            <p className="mt-4 text-base leading-relaxed text-primary-foreground/80 md:text-lg">
              {content.portfolioSubtitle}
            </p>
          ) : null}
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {columns.map((col, idx) => (
            <div
              key={idx}
              className={cn(
                'rounded-xl border p-6',
                idx === 1
                  ? 'border-main-gold/50 bg-main-gold/10'
                  : 'border-primary-foreground/15 bg-primary-foreground/5'
              )}
            >
              <p className="font-heading text-xl font-semibold">{col.title}</p>
              <dl className="mt-5 space-y-4">
                {col.stats.map((stat, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 border-b border-primary-foreground/15 pb-3 last:border-b-0 last:pb-0">
                    <dt className="text-sm text-primary-foreground/75">{stat.label}</dt>
                    <dd
                      className={cn(
                        'text-sm font-semibold',
                        idx === 1 ? 'text-main-gold' : 'text-primary-foreground'
                      )}
                    >
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>

        {content.portfolioDisclaimer ? (
          <p className="mt-6 max-w-3xl text-xs leading-relaxed text-primary-foreground/60">
            {content.portfolioDisclaimer}
          </p>
        ) : null}
      </div>
    </section>
  )
}

function HomeFinalCta({ content }) {
  return (
    <section className="border-t border-border bg-gradient-to-b from-off-white to-background py-24">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <Eyebrow>{content.finalCtaKicker}</Eyebrow>
        <h2 className="font-heading mt-4 text-3xl font-semibold text-primary md:text-4xl">
          {content.finalCtaTitle}
        </h2>
        {content.finalCtaBody ? (
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">{content.finalCtaBody}</p>
        ) : null}
        <div className="mt-12 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/register" className={buttonVariants({ variant: 'default', size: 'lg' })}>
            {content.finalCtaPrimary}
          </Link>
          <Link
            href="/contact"
            className={cn(
              buttonVariants({ variant: 'outline', size: 'lg' }),
              'border-primary/25 bg-card shadow-sm hover:border-primary/40 hover:bg-card'
            )}
          >
            {content.finalCtaSecondary}
          </Link>
        </div>
        </div>
    </section>
  )
}

export default function HomePage({
  content,
  liveOpportunities = [],
  completedDeals = [],
  propertyTypes = [],
}) {
  return (
    <div className="flex-1 bg-background text-foreground">
      <HomeHero content={content} statsLayout={HOME_STATS_LAYOUT} />
      <HomeStats content={content} layout={HOME_STATS_LAYOUT} />
      <HomeWhatIs content={content} />
      <HomeWhyUs content={content} />
      <HomeStrategies content={content} propertyTypes={propertyTypes} />
      <HomeLiveOpportunities content={content} liveOpportunities={liveOpportunities} />
      <HomeHowItWorks content={content} />
      <HomeReasons content={content} />
      <HomeTrackRecord content={content} completedDeals={completedDeals} />
      <HomePortfolioBenefit content={content} />
      <HomeFinalCta content={content} />
    </div>
  )
}
