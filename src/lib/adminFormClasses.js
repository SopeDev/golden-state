import { cn } from '@/lib/utils'

/** Inline chevron-down icon for native selects (spaces URL-encoded for Tailwind arbitrary value) */
const CHEVRON_BG =
  "bg-[url('data:image/svg+xml;utf8,<svg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2216%22%20height=%2216%22%20viewBox=%220%200%2024%2024%22%20fill=%22none%22%20stroke=%22%23737373%22%20stroke-width=%222%22%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22><path%20d=%22m6%209%206%206%206-6%22/></svg>')]"

/** Native <select> styled to match shadcn Input */
export function adminSelectClassName(className) {
  return cn(
    'flex h-8 w-full min-w-0 appearance-none rounded-lg border border-input bg-background py-1 pl-2.5 pr-8 text-base text-foreground transition-colors outline-none',
    'cursor-pointer bg-no-repeat [background-position:right_0.5rem_center]',
    CHEVRON_BG,
    'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
    'disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 md:text-sm',
    'dark:bg-input/30 dark:disabled:bg-input/80',
    className
  )
}
