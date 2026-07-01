import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export default function RequiredLabel({ children, className, ...props }) {
  return (
    <Label className={cn(className)} {...props}>
      <span>{children}</span>
      <span className="text-destructive" aria-hidden="true">
        *
      </span>
    </Label>
  )
}
