'use client'

import { MapPin, ArrowDown, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export default function OpenRoles({ content, roles, selectedRoleId, onApply }) {
  if (!roles.length) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-6 text-sm text-muted-foreground">
        {content.rolesEmpty}
      </p>
    )
  }

  return (
    <ul className="space-y-4">
      {roles.map((role) => {
        const isSelected = selectedRoleId === role.id
        return (
          <li key={role.id}>
            <Card
              className={cn(
                'border-border/80 shadow-sm transition-colors',
                isSelected && 'border-main-gold ring-1 ring-main-gold/40'
              )}
              data-role-id={role.id}
            >
              <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-start md:justify-between md:p-8">
                <div className="min-w-0 space-y-3">
                  <h3
                    className="font-heading text-xl font-semibold text-primary"
                    data-role-field="title"
                  >
                    {role.title}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {role.type ? (
                      <span
                        className="rounded-full border border-main-gold/40 bg-main-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-main-gold"
                        data-role-field="type"
                      >
                        {role.type}
                      </span>
                    ) : null}
                    {role.location ? (
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground"
                        data-role-field="location"
                      >
                        <MapPin className="size-3.5" aria-hidden />
                        {role.location}
                      </span>
                    ) : null}
                  </div>
                  {role.summary ? (
                    <p
                      className="text-sm leading-relaxed text-muted-foreground md:text-base"
                      data-role-field="summary"
                    >
                      {role.summary}
                    </p>
                  ) : null}
                  {role.body ? (
                    <p
                      className="text-sm leading-relaxed text-foreground/80"
                      data-role-field="body"
                    >
                      {role.body}
                    </p>
                  ) : null}
                </div>
                <Button
                  type="button"
                  variant={isSelected ? 'outline' : 'gold'}
                  className={cn(
                    'shrink-0 self-start',
                    isSelected && 'border-main-gold/50 text-main-gold hover:bg-main-gold/10 hover:text-main-gold'
                  )}
                  onClick={() => onApply?.(role.id)}
                >
                  {isSelected ? (
                    <Check className="size-4" aria-hidden />
                  ) : (
                    <ArrowDown className="size-4" aria-hidden />
                  )}
                  {isSelected ? content.roleApplySelected : content.roleApply}
                </Button>
              </CardContent>
            </Card>
          </li>
        )
      })}
    </ul>
  )
}
