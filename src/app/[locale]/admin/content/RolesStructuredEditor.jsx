'use client'

import { useTranslations } from 'next-intl'
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useMessaging } from '@/hooks/useMessaging'
import { roleInputId } from '@/lib/careersEditor'

const labelClass = 'text-main-gold'

const ROLE_FIELDS = [
  { field: 'title', locale: 'en', long: false, labelKey: 'titleEn', placeholderKey: 'titlePlaceholderEn' },
  { field: 'title', locale: 'es', long: false, labelKey: 'titleEs', placeholderKey: 'titlePlaceholderEs' },
  { field: 'location', locale: 'en', long: false, labelKey: 'locationEn' },
  { field: 'location', locale: 'es', long: false, labelKey: 'locationEs' },
  { field: 'type', locale: 'en', long: false, labelKey: 'typeEn' },
  { field: 'type', locale: 'es', long: false, labelKey: 'typeEs' },
  { field: 'summary', locale: 'en', long: true, labelKey: 'summaryEn' },
  { field: 'summary', locale: 'es', long: true, labelKey: 'summaryEs' },
  { field: 'body', locale: 'en', long: true, labelKey: 'bodyEn' },
  { field: 'body', locale: 'es', long: true, labelKey: 'bodyEs' },
]

export default function RolesStructuredEditor({
  structure,
  highlightedFieldId,
  onAddRole,
  onRemoveRole,
  onMoveRole,
  onRoleFieldChange,
}) {
  const t = useTranslations('Admin.content.roles')
  const { confirm } = useMessaging()
  const highlightRing = (id) =>
    highlightedFieldId === id ? 'ring-2 ring-main-gold ring-offset-1' : ''
  const roles = structure?.roles || []

  const handleRemoveRole = async (roleId, previewLabel) => {
    const confirmed = await confirm({
      message: t('confirmRemoveRole', { name: previewLabel }),
      variant: 'destructive',
      confirmLabel: t('remove'),
    })
    if (confirmed) onRemoveRole(roleId)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-heading text-lg font-semibold text-primary">{t('heading')}</h3>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>
        <Button type="button" size="sm" onClick={onAddRole} className="gap-1.5">
          <Plus className="size-4" aria-hidden />
          {t('addRole')}
        </Button>
      </div>

      {roles.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-sm text-muted-foreground">{t('emptyRoles')}</CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {roles.map((role, index) => {
            const isFirst = index === 0
            const isLast = index === roles.length - 1
            const previewLabel = role.title?.en || role.title?.es || role.id

            return (
              <Card key={role.id} className="border-border/80 shadow-sm">
                <CardHeader className="flex flex-col gap-3 border-b border-border/60 pb-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base text-primary">
                      {t('roleNumber', { number: index + 1 })}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{previewLabel}</p>
                    <p className="font-mono text-xs text-muted-foreground">id: {role.id}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      disabled={isFirst}
                      onClick={() => onMoveRole(role.id, 'up')}
                      aria-label={t('moveRoleUp')}
                    >
                      <ChevronUp className="size-4" aria-hidden />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      disabled={isLast}
                      onClick={() => onMoveRole(role.id, 'down')}
                      aria-label={t('moveRoleDown')}
                    >
                      <ChevronDown className="size-4" aria-hidden />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleRemoveRole(role.id, previewLabel)}
                    >
                      <Trash2 className="size-4" aria-hidden />
                      {t('remove')}
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    {ROLE_FIELDS.map((cfg) => {
                      const id = roleInputId({
                        roleId: role.id,
                        field: cfg.field,
                        locale: cfg.locale,
                      })
                      const value = role[cfg.field]?.[cfg.locale] || ''
                      const Control = cfg.long ? Textarea : Input
                      return (
                        <div key={`${cfg.field}-${cfg.locale}`} className="space-y-2">
                          <Label className={labelClass} htmlFor={id}>
                            {t(cfg.labelKey)}
                          </Label>
                          <Control
                            id={id}
                            rows={cfg.long ? 3 : undefined}
                            value={value}
                            placeholder={cfg.placeholderKey ? t(cfg.placeholderKey) : undefined}
                            onChange={(event) =>
                              onRoleFieldChange(role.id, cfg.field, cfg.locale, event.target.value)
                            }
                            className={highlightRing(id)}
                          />
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
