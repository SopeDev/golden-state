'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ChevronDown, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import RolesStructuredEditor from '@/app/[locale]/admin/content/RolesStructuredEditor'
import {
  addRole,
  composeCareersFlat,
  moveRole,
  parseCareersRoles,
  removeRole,
  updateRoleField,
} from '@/lib/careersEditor'

export default function WorkWithUsRolesManager({ initialContentByLocale }) {
  const t = useTranslations('Admin.content.roles')
  const router = useRouter()
  const [contentByLocale, setContentByLocale] = useState(initialContentByLocale)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const structure = useMemo(() => parseCareersRoles(contentByLocale), [contentByLocale])

  const update = (producer) => {
    setContentByLocale((current) =>
      composeCareersFlat(producer(parseCareersRoles(current)), current)
    )
    setStatus('')
  }

  const save = async () => {
    setSaving(true)
    setStatus('')
    try {
      for (const locale of ['en', 'es']) {
        const response = await fetch('/api/admin/content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pageKey: 'WORK_WITH_US',
            locale,
            content: contentByLocale[locale] || {},
            manageRoles: true,
          }),
        })
        if (!response.ok) throw new Error((await response.json()).message || 'Save failed')
      }
      setStatus(t('saved'))
      router.refresh()
    } catch (error) {
      console.error('Error saving job postings:', error)
      setStatus(t('saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-4 pt-10">
      <Card className="border-main-gold/35 bg-card shadow-sm">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-main-gold/35 bg-main-gold/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-main-gold">
              <ShieldCheck className="size-3.5" aria-hidden />
              {t('adminOnly')}
            </div>
            <CardTitle className="font-heading text-2xl text-primary">{t('managerTitle')}</CardTitle>
            <CardDescription>{t('managerDescription')}</CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen((current) => !current)}
            aria-expanded={isOpen}
            aria-controls="work-with-us-roles-editor"
            className="shrink-0 gap-2"
          >
            {isOpen ? t('hideEditor') : t('showEditor')}
            <ChevronDown
              className={`size-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              aria-hidden
            />
          </Button>
        </CardHeader>
        {isOpen ? (
          <CardContent id="work-with-us-roles-editor" className="space-y-6 border-t border-border pt-6">
            <RolesStructuredEditor
              structure={structure}
              highlightedFieldId=""
              onAddRole={() => update(addRole)}
              onRemoveRole={(roleId) => update((current) => removeRole(current, roleId))}
              onMoveRole={(roleId, direction) =>
                update((current) => moveRole(current, roleId, direction))
              }
              onRoleFieldChange={(roleId, field, locale, value) =>
                update((current) => updateRoleField(current, roleId, field, locale, value))
              }
            />
            <div className="flex flex-wrap items-center gap-4 border-t border-border pt-5">
              <Button type="button" onClick={save} disabled={saving}>
                {saving ? t('saving') : t('save')}
              </Button>
              {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
            </div>
          </CardContent>
        ) : null}
      </Card>
    </section>
  )
}
