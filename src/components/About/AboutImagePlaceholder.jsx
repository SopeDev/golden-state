import { cn } from '@/lib/utils'

export function AboutImagePlaceholder({ label, className, ratioClass = 'aspect-[4/3]' }) {
  return (
    <figure
      className={cn(
        'relative w-full overflow-hidden rounded-xl bg-gradient-to-br from-primary/15 via-muted/80 to-main-gold/20 ring-1 ring-border/60 shadow-sm',
        ratioClass,
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230d2642' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      <figcaption className="absolute inset-0 flex items-center justify-center p-6 text-center">
        <span className="max-w-[12rem] text-xs font-medium uppercase tracking-[0.2em] text-primary/70">
          {label}
        </span>
      </figcaption>
    </figure>
  )
}
