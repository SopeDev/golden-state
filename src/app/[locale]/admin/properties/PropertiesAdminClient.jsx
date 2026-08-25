'use client'

import { useEffect, useMemo, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { getPropertyTypeLabel } from '@/lib/propertyTypes'
import {
  getPropertyStatusBadgeClass,
  getPropertyStatusLabelKey,
  normalizePropertyLifecycle,
} from '@/lib/propertyStatusUi'
import { adminPropertyPath } from '@/lib/adminLinks'
import { useRouter } from '@/i18n/navigation'
import { useMessaging } from '@/hooks/useMessaging'
import AdminFilterCheckboxMenu from '@/components/admin/AdminFilterCheckboxMenu'
import AdminListPagination, { paginateItems } from '@/components/admin/AdminListPagination'
import { AdminPageFrame, AdminPageHeader } from '@/components/admin/AdminPageHeader'
import PropertyEditor from './PropertyEditor'
import { hasOperatorPermission, OPERATOR_PERMISSIONS as P } from '@/lib/operatorPermissions'

const STATUS_OPTION_IDS = [
  'FUNDING',
  'FUNDED',
  'NONE',
  'PLANNING',
  'IN_PROGRESS',
  'COMPLETED',
]

export default function PropertiesAdminClient({
  properties,
  propertyTypes = [],
  initialSelectedId = '',
  canViewPropertyDetails = true,
}) {
  const t = useTranslations('Admin')
  const locale = useLocale()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { alert, confirm } = useMessaging()
  const { data: session } = useSession()
  const canCreateProperties =
    canViewPropertyDetails && hasOperatorPermission(session?.user, P.CREATE_PROPERTIES)

  const activePropertyTypes = useMemo(
    () => propertyTypes.filter((type) => !type.deletedAt),
    [propertyTypes]
  )

  const statusOptions = useMemo(
    () =>
      STATUS_OPTION_IDS.map((id) => ({
        id,
        label: t(`filter.${getPropertyStatusLabelKey(id)}`),
      })),
    [t]
  )

  const typeOptions = useMemo(
    () =>
      activePropertyTypes.map((type) => ({
        id: type.id,
        label: getPropertyTypeLabel(type, locale),
      })),
    [activePropertyTypes, locale]
  )

  const [propertiesList, setPropertiesList] = useState(properties)
  const [selectedId, setSelectedId] = useState(() => {
    if (!initialSelectedId) return null
    return properties.some((property) => property.id === initialSelectedId)
      ? initialSelectedId
      : null
  })
  const [isCreating, setIsCreating] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [statusFilters, setStatusFilters] = useState([])
  const [typeFilters, setTypeFilters] = useState([])
  const [page, setPage] = useState(1)

  const idFromUrl = searchParams.get('id') || ''

  const selectedProperty = useMemo(
    () => propertiesList.find((p) => p.id === selectedId) || null,
    [propertiesList, selectedId]
  )

  const syncPropertyUrl = (propertyId) => {
    router.replace(propertyId ? adminPropertyPath(propertyId) : '/admin/properties', {
      scroll: false,
    })
  }

  useEffect(() => {
    if (isCreating) return
    if (
      canViewPropertyDetails &&
      idFromUrl &&
      propertiesList.some((property) => property.id === idFromUrl)
    ) {
      setSelectedId(idFromUrl)
      return
    }
    if (idFromUrl && !canViewPropertyDetails) {
      setSelectedId(null)
      router.replace('/admin/properties', { scroll: false })
      return
    }
    if (!idFromUrl) {
      setSelectedId(null)
    }
  }, [idFromUrl, propertiesList, isCreating, canViewPropertyDetails, router])

  const filteredProperties = useMemo(() => {
    let list = propertiesList
    if (statusFilters.length > 0) {
      list = list.filter((property) => {
        const lifecycle = normalizePropertyLifecycle(property)
        return statusFilters.some((id) => {
          if (id === 'FUNDING' || id === 'FUNDED') return lifecycle.fundingStatus === id
          return lifecycle.executionStatus === id
        })
      })
    }
    if (typeFilters.length > 0) {
      list = list.filter((property) => typeFilters.includes(property.typeId))
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
  }, [propertiesList, query, statusFilters, typeFilters, locale])

  useEffect(() => {
    setPage(1)
  }, [query, statusFilters, typeFilters])

  const pagination = useMemo(
    () => paginateItems(filteredProperties, page),
    [filteredProperties, page]
  )

  const editorVisible = isCreating || selectedProperty

  const handleNewProperty = () => {
    setSelectedId(null)
    setIsCreating(true)
    syncPropertyUrl(null)
  }

  const handleSelectProperty = (propertyId) => {
    if (!canViewPropertyDetails) return
    setSelectedId(propertyId)
    setIsCreating(false)
    syncPropertyUrl(propertyId)
  }

  const handleCancel = () => {
    setIsCreating(false)
    if (!selectedProperty) {
      setSelectedId(null)
      syncPropertyUrl(null)
    }
  }

  const handleBackToList = () => {
    setIsCreating(false)
    setSelectedId(null)
    syncPropertyUrl(null)
  }

  const handleDeleteProperty = async (propertyId) => {
    const confirmed = await confirm({
      message: t('common.confirmDeleteProperty'),
      variant: 'destructive',
    })
    if (!confirmed) return

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
          syncPropertyUrl(null)
        }
      } else {
        const error = await response.json().catch(() => ({}))
        await alert(error.error || error.message || t('common.errorDeleteProperty'))
      }
    } catch (error) {
      console.error('Error deleting property:', error)
      await alert(t('common.errorDeleteProperty'))
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
          syncPropertyUrl(updatedProperty.id)
        }
      } else {
        const error = await response.json().catch(() => ({}))
        const message = error.error || error.message || t('common.actionFailed')
        await alert(
          isEdit
            ? t('common.failedUpdateProperty', { message })
            : t('common.failedCreateProperty', { message })
        )
      }
    } catch (error) {
      console.error('Error saving property:', error)
      await alert(t('common.errorSaveProperty'))
    } finally {
      setIsLoading(false)
    }
  }

  if (editorVisible) {
    return (
      <AdminPageFrame>
        <div className="mb-4">
          <Button type="button" variant="ghost" size="sm" onClick={handleBackToList} className="gap-1.5">
            <ArrowLeft className="size-4" aria-hidden />
            {t('common.backToProperties')}
          </Button>
        </div>
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
      </AdminPageFrame>
    )
  }

  return (
    <AdminPageFrame>
      <AdminPageHeader
        className="mb-6"
        eyebrow={t('properties.eyebrow')}
        title={t('properties.title')}
        description={t('properties.subtitle')}
        actions={
          canCreateProperties ? <Button type="button" onClick={handleNewProperty} className="gap-1.5">
            <Plus className="size-4" aria-hidden />
            {t('common.new')}
          </Button> : null
        }
      />

      <Card className="border-border/80 shadow-sm">
        <CardHeader className="space-y-3 border-b border-border/60 pb-4">
          <CardTitle className="text-base text-primary">
            {t('properties.listTitle', { count: filteredProperties.length })}
          </CardTitle>
          <div className="flex flex-row flex-wrap items-center gap-2 sm:flex-nowrap">
            <div className="relative min-w-0 flex-1">
              <Search
                className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t('common.searchProperties')}
                className="pl-8"
              />
            </div>
            <div className="flex shrink-0 flex-row flex-wrap items-center gap-2">
              <AdminFilterCheckboxMenu
                label={t('filter.status')}
                allLabel={t('common.all')}
                options={statusOptions}
                selectedIds={statusFilters}
                onChange={setStatusFilters}
              />
              <AdminFilterCheckboxMenu
                label={t('filter.type')}
                allLabel={t('common.all')}
                options={typeOptions}
                selectedIds={typeFilters}
                onChange={setTypeFilters}
              />
              {(query.trim() || statusFilters.length > 0 || typeFilters.length > 0) ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-9 px-2.5 text-muted-foreground"
                  onClick={() => {
                    setQuery('')
                    setStatusFilters([])
                    setTypeFilters([])
                  }}
                >
                  {t('common.clearFilters')}
                </Button>
              ) : null}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredProperties.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              {query ? t('common.noPropertiesSearch') : t('common.noPropertiesYet')}
            </p>
          ) : (
            <ul className="divide-y divide-border/60">
              {pagination.items.map((property) => {
                const lifecycle = normalizePropertyLifecycle(property)
                return (
                  <li key={property.id}>
                    <button
                      type="button"
                      onClick={() => handleSelectProperty(property.id)}
                      disabled={!canViewPropertyDetails}
                      className={cn(
                        'flex w-full items-start justify-between gap-3 px-4 py-3.5 text-left transition-colors',
                        canViewPropertyDetails
                          ? 'cursor-pointer hover:bg-muted/50'
                          : 'cursor-default'
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
                      <span className="flex shrink-0 flex-col items-end gap-1 self-center">
                        <span
                          className={cn(
                            'rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide',
                            getPropertyStatusBadgeClass(lifecycle.fundingStatus)
                          )}
                        >
                          {t(`filter.${getPropertyStatusLabelKey(lifecycle.fundingStatus)}`)}
                        </span>
                        {lifecycle.executionStatus !== 'NONE' ? (
                          <span
                            className={cn(
                              'rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide',
                              getPropertyStatusBadgeClass(lifecycle.executionStatus)
                            )}
                          >
                            {t(`filter.${getPropertyStatusLabelKey(lifecycle.executionStatus)}`)}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  </li>
                )
              })}
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
