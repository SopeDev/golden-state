import Image from 'next/image'

export default function LegalHero({ eyebrow, title, subtitle, lastUpdatedLabel, lastUpdated }) {
  return (
    <section className="relative overflow-hidden border-b border-border text-primary-foreground">
      <div className="absolute inset-0">
        <Image
          src="/images/skyline-3_1920.webp"
          alt=""
          fill
          priority
          className="object-cover object-[center_35%]"
          sizes="100vw"
        />
      </div>
      <div
        className="absolute inset-0 bg-gradient-to-br from-primary/92 via-primary/82 to-secondary-blue/78"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(212,175,55,0.22),transparent_45%)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl px-4 py-14 md:py-20">
        <div className="max-w-3xl">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-main-gold">{eyebrow}</p>
          ) : null}
          <h1 className="mt-3 font-heading text-4xl font-semibold tracking-tight md:text-5xl">{title}</h1>
          {subtitle ? (
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-primary-foreground/90 md:text-lg">
              {subtitle}
            </p>
          ) : null}
          {lastUpdated ? (
            <p className="mt-6 text-sm text-primary-foreground/70">
              {lastUpdatedLabel}: {lastUpdated}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
}
