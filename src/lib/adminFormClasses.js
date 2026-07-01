import { cn } from '@/lib/utils'

/** Native <select> styled to match shadcn Input */
export function adminSelectClassName(className) {
  return cn(
    'flex h-8 w-full min-w-0 appearance-none rounded-lg border border-input bg-background px-2.5 py-1 text-base text-foreground transition-colors outline-none',
    'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
    'disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 md:text-sm',
    'dark:bg-input/30 dark:disabled:bg-input/80',
    className
  )
}
