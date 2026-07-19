import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export default function AdminFormField({
  label,
  htmlFor,
  emphasis = false,
  hint,
  children,
  className,
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {label ? (
        <Label
          htmlFor={htmlFor}
          className={cn(
            'text-xs font-semibold uppercase tracking-wide',
            emphasis ? 'text-main-gold' : 'text-muted-foreground'
          )}
        >
          {label}
        </Label>
      ) : null}
      {children}
      {hint ? <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p> : null}
    </div>
  )
}
