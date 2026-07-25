'use client'

import { useMemo, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { ArrowLeft, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { getPropertyTypeLabel } from '@/lib/propertyTypes'
import {
  getPropertyStatusBadgeClass,
  getPropertyStatusLabelKey,
} from '@/lib/propertyStatusUi'
import PropertyEditor from './PropertyEditor'

const filterChipClass = (active) =>
  cn(
    'cursor-pointer rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide transition-colors',
    active
      ? 'border-main-gold bg-main-gold/15 text-main-gold'
      : 'border-border text-muted-foreground hover:text-primary'
  )

export default function PropertiesAdminClient({ properties, propertyTypes = [] }) {
  const t = useTranslations('Admin')
  const locale = useLocale()

  const activePropertyTypes = useMemo(
    () => propertyTypes.filter((type) => !type.deletedAt),
    [propertyTypes]
  )

  const STATUS_FILTERS = [
    { id: 'ALL', label: t('common.all') },
    { id: 'FUNDING', label: t('filter.funding') },
    { id: 'FUNDED', label: t('filter.funded') },
    { id: 'PLANNING', label: t('filter.planning') },
    { id: 'IN_PROGRESS', label: t('filter.inProgress') },
    { id: 'COMPLETED', label: t('filter.completed') },
  ]

  const TYPE_FILTERS = [
    { id: 'ALL', label: t('common.all') },
    ...activePropertyTypes.map((type) => ({
      id: type.id,
      label: getPropertyTypeLabel(type, locale),
    })),
  ]

  const [propertiesList, setPropertiesList] = useState(properties)
  const [selectedId, setSelectedId] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [typeFilter, setTypeFilter] = useState('ALL')

  const selectedProperty = useMemo(
    () => propertiesList.find((p) => p.id === selectedId) || null,
    [propertiesList, selectedId]
  )

  const filteredProperties = useMemo(() => {
    let list = propertiesList
    if (statusFilter !== 'ALL') {
      list = list.filter((property) => (property.status || 'FUNDING') === statusFilter)
    }
    if (typeFilter !== 'ALL') {
      list = list.filter((property) => property.typeId === typeFilter)
    }
    if (!query.trim()) return list
    const q = query.trim().toLowerCase()
    return list.filter(
      (property) =>
        property.name?.toLowerCase().includes(q) ||
        property.slug?.toLowerCase().includes(q) ||
        property.city?.toLowerCase().includes(q) ||
        property.state?.toLowerCase().includes(q) ||
        String(property.investmentId).includes(q) ||
        getPropertyTypeLabel(property.propertyType, locale)?.toLowerCase().includes(q)
    )
  }, [propertiesList, query, statusFilter, typeFilter, locale])

  const editorVisible = isCreating || selectedProperty

  const handleNewProperty = () => {
    setSelectedId(null)
    setIsCreating(true)
  }

  const handleSelectProperty = (propertyId) => {
    setSelectedId(propertyId)
    setIsCreating(false)
  }

  const handleCancel = () => {
    setIsCreating(false)
    if (!selectedProperty) {
      setSelectedId(null)
    }
  }

  const handleBackToList = () => {
    setIsCreating(false)
    setSelectedId(null)
  }

  const handleDeleteProperty = async (propertyId) => {
    if (!confirm(t('common.confirmDeleteProperty'))) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/properties/${propertyId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        setPropertiesList((prev) => prev.filter((p) => p.id !== propertyId))
        if (selectedId === propertyId) {
          setSelectedId(null)
          setIsCreating(false)
        }
      } else {
        const error = await response.json()
        alert(`Failed to delete property: ${error.message}`)
      }
    } catch (error) {
      console.error('Error deleting property:', error)
      alert(t('common.errorDeleteProperty'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleFormSubmit = async (formData) => {
    setIsLoading(true)
    try {
      const isEdit = !isCreating && selectedProperty
      const url = isEdit
        ? `/api/admin/properties/${selectedProperty.id}`
        : '/api/admin/properties'
      const method = isEdit ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const updatedProperty = await response.json()
        if (isEdit) {
          setPropertiesList((prev) =>
            prev.map((p) => (p.id === selectedProperty.id ? updatedProperty : p))
          )
        } else {
          setPropertiesList((prev) => [updatedProperty, ...prev])
          setSelectedId(updatedProperty.id)
          setIsCreating(false)
        }
      } else {
        const error = await response.json()
        alert(`Failed to ${isEdit ? 'update' : 'create'} property: ${error.message}`)
      }
    } catch (error) {
      console.error('Error saving property:', error)
      alert(t('common.errorSaveProperty'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-heading text-4xl font-semibold text-primary">{t('properties.title')}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{t('properties.subtitle')}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)] xl:grid-cols-[380px_minmax(0,1fr)]">
        <Card
          className={cn(
            'border-border/80 shadow-sm lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:overflow-hidden',
            editorVisible ? 'hidden lg:flex lg:flex-col' : 'flex flex-col'
          )}
        >
          <CardHeader className="space-y-3 border-b border-border/60 pb-4">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base text-primary">
                {t('properties.listTitle', { count: propertiesList.length })}
              </CardTitle>
              <Button type="button" size="sm" onClick={handleNewProperty} className="gap-1.5">
                <Plus className="size-4" aria-hidden />
                {t('common.new')}
              </Button>
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t('common.searchProperties')}
                className="pl-8"
              />
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('filter.status')}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {STATUS_FILTERS.map((option) => (
                    <button
                      key={`status-${option.id}`}
                      type="button"
                      onClick={() => setStatusFilter(option.id)}
                      className={filterChipClass(statusFilter === option.id)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5 border-t border-border/60 pt-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('filter.type')}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {TYPE_FILTERS.map((option) => (
                    <button
                      key={`type-${option.id}`}
                      type="button"
                      onClick={() => setTypeFilter(option.id)}
                      className={filterChipClass(typeFilter === option.id)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0">
            {filteredProperties.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                {query ? t('common.noPropertiesSearch') : t('common.noPropertiesYet')}
              </p>
            ) : (
              <ul>
                {filteredProperties.map((property) => {
                  const isActive = !isCreating && property.id === selectedId
                  const status = property.status || 'FUNDING'
                  return (
                    <li key={property.id}>
                      <button
                        type="button"
                        onClick={() => handleSelectProperty(property.id)}
                        className={cn(
                          'flex w-full cursor-pointer items-start justify-between gap-3 border-l-2 border-transparent px-4 py-3 text-left transition-colors hover:bg-muted/50',
                          isActive && 'border-l-main-gold bg-main-gold/10'
                        )}
                      >
                        <div className="min-w-0 space-y-1">
                          <span className="block truncate text-sm font-medium text-primary">
                            {property.name}
                          </span>
                          <span className="block truncate text-[11px] text-muted-foreground">
                            #{property.investmentId} · {property.city}, {property.state}
                          </span>
                        </div>
                        <span
                          className={cn(
                            'shrink-0 self-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide',
                            getPropertyStatusBadgeClass(status)
                          )}
                        >
                          {t(`filter.${getPropertyStatusLabelKey(status)}`)}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className={cn(editorVisible ? 'block' : 'hidden lg:block')}>
          <div className="mb-3 flex items-center lg:hidden">
            <Button type="button" variant="ghost" size="sm" onClick={handleBackToList} className="gap-1.5">
              <ArrowLeft className="size-4" aria-hidden />
              {t('common.backToProperties')}
            </Button>
          </div>

          {editorVisible ? (
            <PropertyEditor
              key={isCreating ? '__new__' : selectedProperty?.id}
              property={selectedProperty}
              propertyTypes={activePropertyTypes}
              isCreating={isCreating}
              isLoading={isLoading}
              onSubmit={handleFormSubmit}
              onCancel={handleCancel}
              onDelete={handleDeleteProperty}
            />
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex min-h-[40vh] flex-col items-center justify-center gap-3 px-6 py-10 text-center text-sm text-muted-foreground">
                <p>{t('common.selectPropertyHint')}</p>
                <Button type="button" size="sm" onClick={handleNewProperty} className="gap-1.5">
                  <Plus className="size-4" aria-hidden />
                  {t('common.createNewProperty')}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
