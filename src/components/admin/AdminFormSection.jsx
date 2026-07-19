import { cn } from '@/lib/utils'

export default function AdminFormSection({ title, description, children, className, contentClassName }) {
  return (
    <section
      className={cn(
        'overflow-hidden rounded-xl border border-border/70 bg-card/30 shadow-sm',
        className
      )}
    >
      <div className="border-b border-border/60 bg-muted/45 px-4 py-3.5 md:px-5">
        <h3 className="font-heading text-lg font-semibold tracking-tight text-primary md:text-xl">
          {title}
        </h3>
        {description ? (
          <p className="mt-1 max-w-3xl text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      <div className={cn('space-y-4 px-4 py-5 md:px-5', contentClassName)}>{children}</div>
    </section>
  )
}
