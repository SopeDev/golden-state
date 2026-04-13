import { cn } from '@/lib/utils'

/** Native <select> styled to match shadcn Input */
export function adminSelectClassName(className) {
  return cn(
    'flex h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm text-foreground transition-colors outline-none',
    'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
    'disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
    className
  )
}
