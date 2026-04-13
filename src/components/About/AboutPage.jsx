import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

function AboutHeroCopy({ t }) {
  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-main-gold">
        {t('heroEyebrow')}
      </p>
      <h1 className="font-heading mt-4 text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl lg:text-6xl">
        {t('heroTitle')}
      </h1>
      <p className="mt-6 max-w-xl text-lg leading-relaxed text-primary-foreground/85 md:text-xl">
        {t('heroSubtitle')}
      </p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link href="/projects" className={buttonVariants({ variant: 'gold', size: 'cta' })}>
          {t('ctaProjects')}
        </Link>
        <Link
          href="/register"
          className={cn(
            buttonVariants({ variant: 'outline', size: 'lg' }),
            'border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10'
          )}
        >
          {t('ctaRegister')}
        </Link>
      </div>
    </>
  )
}

export default async function AboutPage() {
  const t = await getTranslations('About')

  return (
    <div className="bg-background text-foreground">
      {/* Hero — full-bleed skyline + overlay */}
      <section className="relative overflow-hidden border-b border-border text-primary-foreground">
        <div className="absolute inset-0">
          <Image
            src="/images/skyline-3_1920.webp"
            alt={t('heroImageAlt')}
            fill
            priority
            className="object-cover object-[center_35%]"
            sizes="100vw"
          />
        </div>
        <div
          className="absolute inset-0 bg-gradient-to-br from-primary/92 via-primary/75 to-secondary-blue/88"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-24 top-0 h-96 w-96 rounded-full bg-main-gold/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-white/10 blur-2xl"
          aria-hidden
        />
        <div className="relative z-10 mx-auto flex min-h-[min(88vh,52rem)] max-w-6xl items-center px-4 py-20 sm:py-24 lg:py-28">
          <div className="max-w-3xl">
            <AboutHeroCopy t={t} />
          </div>
        </div>
      </section>

      {/* Business model — narrative + horizontal “flight path” */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-main-gold">
          {t('modelKicker')}
        </p>
        <h2 className="font-heading mt-3 max-w-3xl text-3xl font-semibold text-primary md:text-4xl">
          {t('modelTitle')}
        </h2>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          {t('modelIntro')}
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <Card
              key={n}
              className="border-border/80 bg-card shadow-sm transition-shadow hover:shadow-md"
              size="sm"
            >
              <CardHeader className="flex flex-row gap-4 px-4 group-data-[size=sm]/card:px-3">
                <span
                  className="pointer-events-none shrink-0 pt-0.5 font-heading text-4xl font-semibold leading-none tabular-nums text-main-gold/35 md:text-5xl"
                  aria-hidden
                >
                  {String(n).padStart(2, '0')}
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                  <CardTitle className="font-heading text-lg text-primary">
                    {t(`modelStep${n}Title`)}
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                    {t(`modelStep${n}Body`)}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Mission — full-width band, not a Q&A */}
      <section className="border-y border-main-gold/25 bg-off-white py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-main-gold">
            {t('missionKicker')}
          </p>
          <h2 className="font-heading mt-4 text-3xl font-semibold text-primary md:text-4xl">
            {t('missionTitle')}
          </h2>
          <blockquote className="font-heading mx-auto mt-6 max-w-2xl border-none text-lg italic leading-relaxed text-primary/90 md:text-2xl">
            {t('missionQuote')}
          </blockquote>
          <p className="mx-auto mt-8 max-w-2xl text-muted-foreground leading-relaxed">
            {t('missionBody')}
          </p>
        </div>
      </section>

      {/* Governance — asymmetric split */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-main-gold">
              {t('governanceKicker')}
            </p>
            <h2 className="font-heading mt-3 text-3xl font-semibold text-primary md:text-4xl">
              {t('governanceTitle')}
            </h2>
            <p className="mt-6 leading-relaxed text-muted-foreground">{t('governanceBody')}</p>
            <p className="mt-4 leading-relaxed text-muted-foreground">{t('governanceBody2')}</p>
          </div>
          <div className="w-full min-w-0 max-w-md lg:justify-self-end">
            <div className="relative aspect-square w-full overflow-hidden rounded-xl border-2 border-main-gold/35 shadow-lg">
              <Image
                src="/images/governance_1920.webp"
                alt={t('imageGovernance')}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 448px"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Differentiators — bento */}
      <section className="bg-muted/40 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-main-gold">
            {t('diffKicker')}
          </p>
          <h2 className="font-heading mt-3 max-w-2xl text-3xl font-semibold text-primary md:text-4xl">
            {t('diffTitle')}
          </h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">{t('diffIntro')}</p>

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="h-full border-border/80 bg-card shadow-sm">
              <CardHeader>
                <CardTitle className="font-heading text-lg text-primary md:text-xl">
                  {t('diff1Title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-relaxed text-muted-foreground">
                {t('diff1Body')}
              </CardContent>
            </Card>
            <Card className="h-full border-border/80 bg-gradient-to-br from-card to-main-gold/5 shadow-sm">
              <CardHeader>
                <CardTitle className="font-heading text-lg text-primary md:text-xl">
                  {t('diff2Title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-relaxed text-muted-foreground">
                {t('diff2Body')}
              </CardContent>
            </Card>
            <Card className="h-full border-border/80 bg-card shadow-sm md:col-span-2 lg:col-span-1">
              <CardHeader>
                <CardTitle className="font-heading text-lg text-primary md:text-xl">
                  {t('diff3Title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-relaxed text-muted-foreground">
                {t('diff3Body')}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Who can invest — warm panel + image */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="relative mx-auto w-full max-w-lg lg:order-2 lg:mx-0 lg:max-w-none">
            <div className="relative aspect-[16/10] overflow-hidden rounded-xl border-2 border-main-gold/35 shadow-lg">
              <Image
                src="/images/investors.webp"
                alt={t('investImageAlt')}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 480px"
              />
            </div>
          </div>
          <div className="lg:order-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-main-gold">
              {t('investKicker')}
            </p>
            <h2 className="font-heading mt-3 text-3xl font-semibold text-primary md:text-4xl">
              {t('investTitle')}
            </h2>
            <p className="mt-6 leading-relaxed text-muted-foreground">{t('investBody')}</p>
            <ul className="mt-8 space-y-3">
              {[1, 2, 3].map((n) => (
                <li key={n} className="flex gap-3 text-sm leading-relaxed text-foreground">
                  <span
                    className="mt-1.5 size-2 shrink-0 rounded-full bg-main-gold"
                    aria-hidden
                  />
                  {t(`investPoint${n}`)}
                </li>
              ))}
            </ul>
            <p className="mt-8 rounded-lg border border-main-gold/30 bg-main-gold/5 px-4 py-3 text-sm text-primary">
              {t('investNote')}
            </p>
          </div>
        </div>
      </section>

      {/* Safety — dark strip + compact cards */}
      <section className="bg-primary py-20 text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-main-gold">
            {t('safetyKicker')}
          </p>
          <h2 className="font-heading mt-3 max-w-3xl text-3xl font-semibold md:text-4xl">
            {t('safetyTitle')}
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="rounded-xl border border-primary-foreground/15 bg-primary-foreground/5 p-6 backdrop-blur-sm"
              >
                <h3 className="font-heading text-lg text-main-gold">{t(`safety${n}Title`)}</h3>
                <p className="mt-3 text-sm leading-relaxed text-primary-foreground/80">
                  {t(`safety${n}Body`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reporting — timeline feel */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="grid items-start gap-12 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-main-gold">
              {t('reportingKicker')}
            </p>
            <h2 className="font-heading mt-3 text-3xl font-semibold text-primary md:text-4xl">
              {t('reportingTitle')}
            </h2>
            <p className="mt-6 leading-relaxed text-muted-foreground">{t('reportingBody')}</p>
            <ol className="relative mt-10 space-y-6 border-l-2 border-main-gold/40 pl-8">
              {[1, 2, 3].map((n) => (
                <li key={n} className="relative">
                  <span className="absolute -left-[calc(48px+0.125rem)] top-1.5 size-3 rounded-full border-2 border-main-gold bg-background" />
                  <p className="font-medium text-primary">{t(`reportingStep${n}Title`)}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{t(`reportingStep${n}Body`)}</p>
                </li>
              ))}
            </ol>
          </div>
          <div className="w-full min-w-0">
            <div className="relative aspect-square w-full overflow-hidden rounded-xl border-2 border-main-gold/35 shadow-lg lg:sticky lg:top-28">
              <Image
                src="/images/dashboard_1920.webp"
                alt={t('imageReporting')}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 480px"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Family wealth — closing */}
      <section className="border-t border-border bg-gradient-to-b from-off-white to-background py-24">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-main-gold">
            {t('familyKicker')}
          </p>
          <h2 className="font-heading mt-4 text-3xl font-semibold text-primary md:text-4xl">
            {t('familyTitle')}
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">{t('familyBody')}</p>
          <div className="mt-12 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/projects" className={cn(buttonVariants({ variant: 'default', size: 'lg' }))}>
              {t('ctaProjects')}
            </Link>
            <Link href="/register" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}>
              {t('ctaRegister')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
