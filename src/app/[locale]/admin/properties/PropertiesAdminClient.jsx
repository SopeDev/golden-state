'use client'

import { useMemo, useState } from 'react'
import { ArrowLeft, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { PROPERTY_TYPE_ADMIN_LABEL, getPropertyTypeBadgeClass } from '@/lib/propertyTypeUi'
import PropertyEditor from './PropertyEditor'

const formatCurrency = (amount) => {
  if (amount == null || amount === '') return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(amount))
}

const STATUS_FILTERS = [
  { id: 'ALL', label: 'All' },
  { id: 'IN_PROGRESS', label: 'In progress' },
  { id: 'COMPLETED', label: 'Completed' },
]

export default function PropertiesAdminClient({ properties }) {
  const [propertiesList, setPropertiesList] = useState(properties)
  const [selectedId, setSelectedId] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const selectedProperty = useMemo(
    () => propertiesList.find((p) => p.id === selectedId) || null,
    [propertiesList, selectedId]
  )

  const filteredProperties = useMemo(() => {
    let list = propertiesList
    if (statusFilter !== 'ALL') {
      list = list.filter((property) => (property.status || 'IN_PROGRESS') === statusFilter)
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
        property.type?.toLowerCase().includes(q)
    )
  }, [propertiesList, query, statusFilter])

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
    if (!confirm('Are you sure you want to delete this property? This action cannot be undone.')) return

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
      alert('Error deleting property')
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
      alert('Error saving property')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-heading text-4xl font-semibold text-primary">Property Management</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Pick a property from the list to edit, or create a new one.
          </p>
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
                Properties · {propertiesList.length}
              </CardTitle>
              <Button type="button" size="sm" onClick={handleNewProperty} className="gap-1.5">
                <Plus className="size-4" aria-hidden />
                New
              </Button>
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search name, city, type, id"
                className="pl-8"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_FILTERS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setStatusFilter(option.id)}
                  className={cn(
                    'rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide transition-colors',
                    statusFilter === option.id
                      ? 'border-main-gold bg-main-gold/15 text-main-gold'
                      : 'border-border text-muted-foreground hover:text-primary'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0">
            {filteredProperties.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                {query ? 'No properties match your search.' : 'No properties yet.'}
              </p>
            ) : (
              <ul>
                {filteredProperties.map((property) => {
                  const isActive = !isCreating && property.id === selectedId
                  return (
                    <li key={property.id}>
                      <button
                        type="button"
                        onClick={() => handleSelectProperty(property.id)}
                        className={cn(
                          'flex w-full flex-col items-start gap-1 border-l-2 border-transparent px-4 py-3 text-left transition-colors hover:bg-muted/50',
                          isActive && 'border-l-main-gold bg-main-gold/10'
                        )}
                      >
                        <div className="flex w-full items-start justify-between gap-2">
                          <span className="truncate text-sm font-medium text-primary">{property.name}</span>
                          <span
                            className={cn(
                              'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                              getPropertyTypeBadgeClass(property.type)
                            )}
                          >
                            {PROPERTY_TYPE_ADMIN_LABEL[property.type] || property.type}
                          </span>
                        </div>
                        <div className="flex w-full items-center justify-between text-[11px] text-muted-foreground">
                          <span>
                            #{property.investmentId} · {property.city}, {property.state}
                          </span>
                          <span className="shrink-0 font-semibold text-main-gold">
                            {formatCurrency(property.price)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>ROI {property.estimatedROI}% · {property.estimatedMonths} mo</span>
                          <span
                            className={cn(
                              'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                              (property.status || 'IN_PROGRESS') === 'COMPLETED'
                                ? 'bg-green-600/15 text-green-800 dark:text-green-400'
                                : 'bg-secondary-blue/15 text-secondary-blue'
                            )}
                          >
                            {(property.status || 'IN_PROGRESS') === 'COMPLETED' ? 'Completed' : 'In progress'}
                          </span>
                        </div>
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
              Back to properties
            </Button>
          </div>

          {editorVisible ? (
            <PropertyEditor
              key={isCreating ? '__new__' : selectedProperty?.id}
              property={selectedProperty}
              isCreating={isCreating}
              isLoading={isLoading}
              onSubmit={handleFormSubmit}
              onCancel={handleCancel}
              onDelete={handleDeleteProperty}
            />
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex min-h-[40vh] flex-col items-center justify-center gap-3 px-6 py-10 text-center text-sm text-muted-foreground">
                <p>Select a property from the list to view and edit it.</p>
                <Button type="button" size="sm" onClick={handleNewProperty} className="gap-1.5">
                  <Plus className="size-4" aria-hidden />
                  Create new property
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
