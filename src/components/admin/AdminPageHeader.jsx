import { cn } from '@/lib/utils'

export function AdminPageFrame({ children, className }) {
  return (
    <div className={cn('mx-auto w-full max-w-6xl px-4 py-8 md:px-6', className)}>
      {children}
    </div>
  )
}

export function AdminPageHeader({ eyebrow, title, description, actions, className }) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between',
        className
      )}
    >
      <div>
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-main-gold">
            {eyebrow}
          </p>
        ) : null}
        <h1
          className={cn(
            'font-heading text-3xl font-semibold text-primary',
            eyebrow ? 'mt-1' : null
          )}
        >
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  )
}
