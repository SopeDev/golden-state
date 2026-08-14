'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Archive, ArrowLeft, Plus, RotateCcw, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { adminSelectClassName } from '@/lib/adminFormClasses'
import { matchesAdminQuery } from '@/lib/adminSearch'
import { slugifyPropertyType } from '@/lib/propertyTypes'
import AdminListPagination, { paginateItems } from '@/components/admin/AdminListPagination'
import { AdminPageFrame, AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPropertyLink } from '@/components/admin/AdminEntityLinks'

const emptyForm = {
  labelEn: '',
  labelEs: '',
  slug: '',
  descriptionEn: '',
  descriptionEs: '',
  sortOrder: '',
}

export default function PropertyTypesAdminClient({ initialTypes }) {
  const t = useTranslations('Admin.propertyTypes')
  const tc = useTranslations('Admin.common')

  const [types, setTypes] = useState(initialTypes || [])
  const [selectedId, setSelectedId] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [removeMode, setRemoveMode] = useState(null)
  const [propertyDecisions, setPropertyDecisions] = useState({})
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState('')
  const [visibilityFilter, setVisibilityFilter] = useState('')

  const selected = useMemo(
    () => types.find((type) => type.id === selectedId) || null,
    [types, selectedId]
  )

  const activeTypes = useMemo(
    () => types.filter((type) => !type.deletedAt),
    [types]
  )

  const filteredTypes = useMemo(() => {
    let list = types
    if (visibilityFilter === 'LIVE') list = list.filter((type) => !type.deletedAt)
    if (visibilityFilter === 'ARCHIVED') list = list.filter((type) => Boolean(type.deletedAt))
    return list.filter((type) =>
      matchesAdminQuery(
        query,
        type.labelEn,
        type.labelEs,
        type.slug,
        type.descriptionEn,
        type.descriptionEs
      )
    )
  }, [types, query, visibilityFilter])

  useEffect(() => {
    setPage(1)
  }, [query, visibilityFilter])

  const reassignOptions = useMemo(
    () => activeTypes.filter((type) => type.id !== selectedId),
    [activeTypes, selectedId]
  )

  const decisionsComplete = useMemo(() => {
    if (!removeMode?.properties?.length) return false
    return removeMode.properties.every((property) => {
      const decision = propertyDecisions[property.id]
      if (!decision?.action) return false
      if (decision.action === 'archive') return true
      return Boolean(decision.reassignTypeId)
    })
  }, [removeMode, propertyDecisions])

  const startCreate = () => {
    setIsCreating(true)
    setSelectedId(null)
    setForm(emptyForm)
    setRemoveMode(null)
    setPropertyDecisions({})
    setStatus('')
  }

  const selectType = (type) => {
    setIsCreating(false)
    setSelectedId(type.id)
    setRemoveMode(null)
    setPropertyDecisions({})
    setStatus('')
    setForm({
      labelEn: type.labelEn || '',
      labelEs: type.labelEs || '',
      slug: type.slug || '',
      descriptionEn: type.descriptionEn || '',
      descriptionEs: type.descriptionEs || '',
      sortOrder: String(type.sortOrder ?? ''),
    })
  }

  const updateField = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value }
      if (key === 'labelEn' && isCreating && !prev.slugManual) {
        next.slug = slugifyPropertyType(value)
      }
      return next
    })
  }

  const setPropertyDecision = (propertyId, patch) => {
    setPropertyDecisions((prev) => ({
      ...prev,
      [propertyId]: {
        action: 'archive',
        reassignTypeId: '',
        ...prev[propertyId],
        ...patch,
      },
    }))
  }

  const refreshFromServer = async () => {
    const res = await fetch('/api/admin/property-types', { credentials: 'include' })
    if (!res.ok) return
    const data = await res.json()
    setTypes(data.types || [])
  }

  const handleSave = async () => {
    setIsLoading(true)
    setStatus('')
    try {
      const payload = {
        labelEn: form.labelEn,
        labelEs: form.labelEs,
        slug: form.slug,
        descriptionEn: form.descriptionEn,
        descriptionEs: form.descriptionEs,
        sortOrder: form.sortOrder,
      }

      const res = await fetch(
        isCreating ? '/api/admin/property-types' : `/api/admin/property-types/${selectedId}`,
        {
          method: isCreating ? 'POST' : 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )
      const data = await res.json()
      if (!res.ok) {
        setStatus(data.message || t('saveFailed'))
        return
      }

      await refreshFromServer()
      if (isCreating && data.type?.id) {
        setIsCreating(false)
        setSelectedId(data.type.id)
      }
      setStatus(t('saved'))
    } catch (error) {
      console.error(error)
      setStatus(t('saveFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleArchive = async ({ withDecisions = false } = {}) => {
    if (!selectedId) return
    setIsLoading(true)
    setStatus('')
    try {
      const body = {}
      if (withDecisions && removeMode?.properties?.length) {
        body.propertyActions = removeMode.properties.map((property) => {
          const decision = propertyDecisions[property.id] || {}
          if (decision.action === 'reassign') {
            return {
              propertyId: property.id,
              action: 'reassign',
              reassignTypeId: decision.reassignTypeId,
            }
          }
          return { propertyId: property.id, action: 'archive' }
        })
      }

      const res = await fetch(`/api/admin/property-types/${selectedId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()

      if (res.status === 409 && data.code === 'HAS_LIVE_PROPERTIES') {
        const properties = data.properties || []
        const initial = {}
        for (const property of properties) {
          initial[property.id] = { action: 'archive', reassignTypeId: '' }
        }
        setPropertyDecisions(initial)
        setRemoveMode({ properties })
        setStatus(data.message)
        return
      }

      if (!res.ok) {
        setStatus(data.message || t('archiveFailed'))
        return
      }

      await refreshFromServer()
      setRemoveMode(null)
      setPropertyDecisions({})
      setStatus(t('archived'))
    } catch (error) {
      console.error(error)
      setStatus(t('archiveFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleRestore = async () => {
    if (!selectedId) return
    setIsLoading(true)
    setStatus('')
    try {
      const res = await fetch(`/api/admin/property-types/${selectedId}/restore`, {
        method: 'POST',
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) {
        setStatus(data.message || t('restoreFailed'))
        return
      }
      await refreshFromServer()
      setStatus(t('restored'))
    } catch (error) {
      console.error(error)
      setStatus(t('restoreFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  const editorOpen = isCreating || selected

  const pagination = useMemo(() => paginateItems(filteredTypes, page), [filteredTypes, page])

  const backToList = () => {
    setIsCreating(false)
    setSelectedId(null)
    setRemoveMode(null)
    setPropertyDecisions({})
    setStatus('')
  }

  if (!editorOpen) {
    return (
      <AdminPageFrame>
        <AdminPageHeader
          className="mb-6"
          eyebrow={t('eyebrow')}
          title={t('title')}
          description={t('subtitle')}
          actions={
            <Button type="button" onClick={startCreate} className="gap-1.5">
              <Plus className="size-4" aria-hidden />
              {t('create')}
            </Button>
          }
        />

        <Card className="border-border/80 shadow-sm">
          <CardHeader className="space-y-3 border-b border-border/70 pb-4">
            <CardTitle className="text-base text-primary">
              {t('listTitle', { count: filteredTypes.length })}
            </CardTitle>
            <div className="flex flex-row flex-wrap items-center gap-2 sm:flex-nowrap">
              <div className="relative min-w-0 flex-1">
                <Search
                  className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className="pl-8"
                />
              </div>
              <select
                className={adminSelectClassName('w-auto min-w-[10rem] shrink-0')}
                value={visibilityFilter}
                onChange={(e) => setVisibilityFilter(e.target.value)}
                aria-label={t('visibilityFilter')}
              >
                <option value="">{t('allStatuses')}</option>
                <option value="LIVE">{t('filterLive')}</option>
                <option value="ARCHIVED">{t('filterArchived')}</option>
              </select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredTypes.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-muted-foreground">{t('emptyDesc')}</p>
            ) : (
              <ul className="divide-y divide-border/60">
                {pagination.items.map((type) => (
                  <li key={type.id}>
                    <button
                      type="button"
                      onClick={() => selectType(type)}
                      className="flex w-full cursor-pointer items-start justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-primary">{type.labelEn}</p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          /{type.slug} · {type.propertyCount} live
                        </p>
                      </div>
                      {type.deletedAt ? (
                        <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                          {t('archivedBadge')}
                        </span>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <AdminListPagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              from={pagination.from}
              to={pagination.to}
              onPageChange={setPage}
            />
          </CardContent>
        </Card>
      </AdminPageFrame>
    )
  }

  return (
    <AdminPageFrame>
      <Button type="button" variant="ghost" size="sm" onClick={backToList} className="mb-4 gap-1.5">
        <ArrowLeft className="size-4" aria-hidden />
        {t('backToList')}
      </Button>
            <Card className="border-border/80 shadow-sm">
              <CardHeader className="border-b border-border/70">
                <CardTitle>
                  {isCreating ? t('createTitle') : t('editTitle')}
                </CardTitle>
                {selected?.deletedAt ? (
                  <CardDescription>{t('archivedNotice')}</CardDescription>
                ) : null}
              </CardHeader>
              <CardContent className="space-y-5 pt-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="pt-label-en">{t('labelEn')}</Label>
                    <Input
                      id="pt-label-en"
                      value={form.labelEn}
                      onChange={(e) => updateField('labelEn', e.target.value)}
                      disabled={Boolean(selected?.deletedAt) || isLoading}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="pt-label-es">{t('labelEs')}</Label>
                    <Input
                      id="pt-label-es"
                      value={form.labelEs}
                      onChange={(e) => updateField('labelEs', e.target.value)}
                      disabled={Boolean(selected?.deletedAt) || isLoading}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="pt-slug">{t('slug')}</Label>
                    <Input
                      id="pt-slug"
                      value={form.slug}
                      onChange={(e) => {
                        setForm((prev) => ({
                          ...prev,
                          slug: slugifyPropertyType(e.target.value),
                          slugManual: true,
                        }))
                      }}
                      disabled={Boolean(selected?.deletedAt) || isLoading}
                    />
                    <p className="text-xs text-muted-foreground">{t('slugHint')}</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="pt-sort">{t('sortOrder')}</Label>
                    <Input
                      id="pt-sort"
                      type="number"
                      value={form.sortOrder}
                      onChange={(e) => updateField('sortOrder', e.target.value)}
                      disabled={Boolean(selected?.deletedAt) || isLoading}
                    />
                  </div>
                </div>

                {!isCreating && selected ? (
                  <p className="text-xs text-muted-foreground">
                    {t('codeLabel')}: <span className="font-mono">{selected.code}</span>
                  </p>
                ) : null}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="pt-desc-en">{t('descriptionEn')}</Label>
                    <Textarea
                      id="pt-desc-en"
                      rows={3}
                      value={form.descriptionEn}
                      onChange={(e) => updateField('descriptionEn', e.target.value)}
                      disabled={Boolean(selected?.deletedAt) || isLoading}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="pt-desc-es">{t('descriptionEs')}</Label>
                    <Textarea
                      id="pt-desc-es"
                      rows={3}
                      value={form.descriptionEs}
                      onChange={(e) => updateField('descriptionEs', e.target.value)}
                      disabled={Boolean(selected?.deletedAt) || isLoading}
                    />
                  </div>
                </div>

                {removeMode ? (
                  <div className="space-y-3 rounded-lg border border-amber-500/40 bg-amber-500/5 p-4">
                    <p className="text-sm font-medium text-primary">{t('removeBlockedTitle')}</p>
                    <p className="text-sm text-muted-foreground">{t('removeBlockedDesc')}</p>
                    <ul className="max-h-72 space-y-3 overflow-y-auto">
                      {removeMode.properties.map((property) => {
                        const decision = propertyDecisions[property.id] || {
                          action: 'archive',
                          reassignTypeId: '',
                        }
                        return (
                          <li
                            key={property.id}
                            className="rounded-md border border-border/70 bg-background p-3"
                          >
                            <p className="text-sm font-medium text-primary">
                              <AdminPropertyLink property={property} />
                            </p>
                            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                              <select
                                value={decision.action}
                                onChange={(e) =>
                                  setPropertyDecision(property.id, {
                                    action: e.target.value,
                                    reassignTypeId:
                                      e.target.value === 'reassign' ? decision.reassignTypeId : '',
                                  })
                                }
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm sm:max-w-[11rem]"
                                aria-label={t('propertyActionLabel', { name: property.name })}
                              >
                                <option value="archive">{t('actionArchiveProperty')}</option>
                                <option value="reassign">{t('actionReassignProperty')}</option>
                              </select>
                              {decision.action === 'reassign' ? (
                                <select
                                  value={decision.reassignTypeId || ''}
                                  onChange={(e) =>
                                    setPropertyDecision(property.id, {
                                      action: 'reassign',
                                      reassignTypeId: e.target.value,
                                    })
                                  }
                                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                                  aria-label={t('reassignLabel')}
                                >
                                  <option value="">{t('reassignPlaceholder')}</option>
                                  {reassignOptions.map((type) => (
                                    <option key={type.id} value={type.id}>
                                      {type.labelEn}
                                    </option>
                                  ))}
                                </select>
                              ) : null}
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        disabled={isLoading || !decisionsComplete}
                        onClick={() => handleArchive({ withDecisions: true })}
                      >
                        {t('confirmArchiveType')}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={isLoading}
                        onClick={() => {
                          setRemoveMode(null)
                          setPropertyDecisions({})
                          setStatus('')
                        }}
                      >
                        {tc('cancel')}
                      </Button>
                    </div>
                    {reassignOptions.length === 0 ? (
                      <p className="text-xs text-muted-foreground">{t('noOtherTypesHint')}</p>
                    ) : null}
                  </div>
                ) : null}

                {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}

                <div className="flex flex-wrap gap-2 border-t border-border/70 pt-4">
                  {!selected?.deletedAt ? (
                    <Button type="button" disabled={isLoading} onClick={handleSave}>
                      {isLoading ? tc('saving') : isCreating ? t('create') : tc('saveChanges')}
                    </Button>
                  ) : null}

                  {!isCreating && selected && !selected.deletedAt ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="gap-1.5"
                      disabled={isLoading}
                      onClick={() => handleArchive()}
                    >
                      <Archive className="size-4" aria-hidden />
                      {t('archive')}
                    </Button>
                  ) : null}

                  {!isCreating && selected?.deletedAt ? (
                    <Button
                      type="button"
                      variant="secondary"
                      className="gap-1.5"
                      disabled={isLoading}
                      onClick={handleRestore}
                    >
                      <RotateCcw className="size-4" aria-hidden />
                      {t('restore')}
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
    </AdminPageFrame>
  )
}
