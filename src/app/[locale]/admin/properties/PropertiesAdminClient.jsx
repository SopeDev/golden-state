'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { adminSelectClassName } from '@/lib/adminFormClasses'

export default function PropertiesAdminClient({ properties }) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProperty, setEditingProperty] = useState(null)
  const [propertiesList, setPropertiesList] = useState(properties)
  const [isLoading, setIsLoading] = useState(false)

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const handleCreateProperty = () => {
    setEditingProperty(null)
    setIsFormOpen(true)
  }

  const handleEditProperty = (property) => {
    setEditingProperty(property)
    setIsFormOpen(true)
  }

  const handleDeleteProperty = async (propertyId) => {
    if (!confirm('Are you sure you want to delete this property?')) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/properties/${propertyId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        setPropertiesList(propertiesList.filter((p) => p.id !== propertyId))
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
      const url = editingProperty
        ? `/api/admin/properties/${editingProperty.id}`
        : '/api/admin/properties'
      const method = editingProperty ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const updatedProperty = await response.json()
        if (editingProperty) {
          setPropertiesList(
            propertiesList.map((p) => (p.id === editingProperty.id ? updatedProperty : p))
          )
        } else {
          setPropertiesList([updatedProperty, ...propertiesList])
        }
        setIsFormOpen(false)
        setEditingProperty(null)
      } else {
        const error = await response.json()
        alert(`Failed to ${editingProperty ? 'update' : 'create'} property: ${error.message}`)
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
            Create, edit, and manage properties in the Golden State investment platform.
          </p>
        </div>
        <Button type="button" onClick={handleCreateProperty} className="shrink-0">
          + Add New Property
        </Button>
      </div>

      <Card className="overflow-hidden border-border/80 shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-primary text-primary-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium md:px-6">ID</th>
                <th className="px-4 py-3 text-left font-medium md:px-6">Name</th>
                <th className="px-4 py-3 text-left font-medium md:px-6">Type</th>
                <th className="hidden px-6 py-3 text-left font-medium lg:table-cell">Location</th>
                <th className="px-4 py-3 text-left font-medium md:px-6">Price</th>
                <th className="hidden px-6 py-3 text-left font-medium xl:table-cell">Min Inv.</th>
                <th className="hidden px-6 py-3 text-left font-medium md:table-cell">ROI</th>
                <th className="hidden px-6 py-3 text-left font-medium lg:table-cell">Created</th>
                <th className="px-4 py-3 text-left font-medium md:px-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {propertiesList.map((property) => (
                <tr key={property.id} className="border-b border-border transition-colors hover:bg-muted/40">
                  <td className="px-4 py-3 md:px-6">
                    <span className="font-semibold text-primary">#{property.investmentId}</span>
                  </td>
                  <td className="px-4 py-3 md:px-6">
                    <div className="font-medium text-primary">{property.name}</div>
                    <div className="text-xs text-muted-foreground">{property.slug}</div>
                  </td>
                  <td className="px-4 py-3 md:px-6">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        property.type === 'BUILD_TO_SELL'
                          ? 'bg-secondary-blue text-white'
                          : 'bg-secondary-gold text-primary'
                      }`}
                    >
                      {property.type}
                    </span>
                  </td>
                  <td className="hidden px-6 py-3 lg:table-cell">
                    <div className="font-medium">
                      {property.city}, {property.state}
                    </div>
                    <div className="text-xs text-muted-foreground">{property.address}</div>
                  </td>
                  <td className="px-4 py-3 md:px-6">
                    <span className="font-semibold text-main-gold">{formatCurrency(property.price)}</span>
                  </td>
                  <td className="hidden px-6 py-3 xl:table-cell">
                    <span className="font-semibold text-main-gold">
                      {formatCurrency(property.minInvestment)}
                    </span>
                  </td>
                  <td className="hidden px-6 py-3 md:table-cell">
                    <span className="font-semibold text-main-gold">{property.estimatedROI}%</span>
                  </td>
                  <td className="hidden px-6 py-3 text-muted-foreground lg:table-cell">
                    {formatDate(property.createdAt)}
                  </td>
                  <td className="px-4 py-3 md:px-6">
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => handleEditProperty(property)}>
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteProperty(property.id)}
                        disabled={isLoading}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {isFormOpen && (
        <PropertyForm
          property={editingProperty}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsFormOpen(false)
            setEditingProperty(null)
          }}
          isLoading={isLoading}
        />
      )}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="space-y-2">
      {label && <Label className="text-main-gold">{label}</Label>}
      {children}
    </div>
  )
}

function PropertyForm({ property, onSubmit, onCancel, isLoading }) {
  const keyToLabel = (key) => {
    if (!key) return ''
    const withSpaces = String(key).replace(/([A-Z])/g, ' $1').replace(/[_-]+/g, ' ')
    return withSpaces
      .trim()
      .split(/\s+/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
  }

  const labelToKey = (label) => {
    const cleaned = String(label)
      .trim()
      .replace(/[^a-zA-Z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')

    if (!cleaned) return ''

    const parts = cleaned.split(' ')
    return parts
      .map((part, index) => {
        const lower = part.toLowerCase()
        if (index === 0) return lower
        return lower.charAt(0).toUpperCase() + lower.slice(1)
      })
      .join('')
  }

  const objectToRows = (value) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return [{ id: crypto.randomUUID(), labelEn: '', valueEn: '', labelEs: '', valueEs: '' }]
    }

    const entries = Object.entries(value)
    if (!entries.length) {
      return [{ id: crypto.randomUUID(), labelEn: '', valueEn: '', labelEs: '', valueEs: '' }]
    }

    return entries.map(([entryKey, entryValue]) => {
      const fallbackLabel = keyToLabel(entryKey)

      // Backward compatibility: previously value was a plain string.
      if (entryValue == null || typeof entryValue !== 'object' || Array.isArray(entryValue)) {
        const legacyValue = entryValue == null ? '' : String(entryValue)
        return {
          id: crypto.randomUUID(),
          labelEn: fallbackLabel,
          valueEn: legacyValue,
          labelEs: fallbackLabel,
          valueEs: legacyValue,
        }
      }

      const en = entryValue.en || {}
      const es = entryValue.es || {}
      return {
        id: crypto.randomUUID(),
        labelEn: en.label || fallbackLabel,
        valueEn: en.value == null ? '' : String(en.value),
        labelEs: es.label || fallbackLabel,
        valueEs: es.value == null ? '' : String(es.value),
      }
    })
  }

  const rowsToObject = (rows) => {
    return rows.reduce((acc, row) => {
      const normalizedKey = labelToKey(row.labelEn)
      if (!normalizedKey) return acc
      acc[normalizedKey] = {
        en: {
          label: row.labelEn?.trim() || keyToLabel(normalizedKey),
          value: row.valueEn || '',
        },
        es: {
          label: row.labelEs?.trim() || row.labelEn?.trim() || keyToLabel(normalizedKey),
          value: row.valueEs || '',
        },
      }
      return acc
    }, {})
  }

  const [formData, setFormData] = useState({
    investmentId: property?.investmentId || '',
    name: property?.name || '',
    slug: property?.slug || '',
    type: property?.type || 'BUILD_TO_SELL',
    city: property?.city || '',
    state: property?.state || '',
    address: property?.address || '',
    price: property?.price || '',
    unitCount: property?.unitCount || '',
    minInvestment: property?.minInvestment || '',
    estimatedROI: property?.estimatedROI || '',
    estimatedMonths: property?.estimatedMonths || '',
    summary: property?.summary || '',
    images: property?.images || [],
  })
  const [propertyFactsRows, setPropertyFactsRows] = useState(objectToRows(property?.propertyFacts))
  const [investmentDetailsRows, setInvestmentDetailsRows] = useState(
    objectToRows(property?.investmentDetails)
  )
  const [isUploadingImages, setIsUploadingImages] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const submitData = {
      ...formData,
      price: parseInt(formData.price, 10),
      unitCount: parseInt(formData.unitCount, 10),
      minInvestment: parseInt(formData.minInvestment, 10),
      estimatedROI: parseFloat(formData.estimatedROI),
      propertyFacts: rowsToObject(propertyFactsRows),
      investmentDetails: rowsToObject(investmentDetailsRows),
      images: formData.images,
    }
    onSubmit(submitData)
  }

  const handleKeyValueChange = (setter, id, field, value) => {
    setter((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)))
  }

  const addKeyValueRow = (setter) => {
    setter((prev) => [
      ...prev,
      { id: crypto.randomUUID(), labelEn: '', valueEn: '', labelEs: '', valueEs: '' },
    ])
  }

  const removeKeyValueRow = (setter, id) => {
    setter((prev) => (prev.length > 1 ? prev.filter((row) => row.id !== id) : prev))
  }

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files || [])
    if (!files.length) return

    setIsUploadingImages(true)
    try {
      const payload = new FormData()
      files.forEach((file) => payload.append('images', file))

      const response = await fetch('/api/admin/uploads/property-images', {
        method: 'POST',
        body: payload,
      })

      if (!response.ok) {
        const error = await response.json()
        alert(`Failed to upload images: ${error.message}`)
        return
      }

      const data = await response.json()
      const uploadedUrls = Array.isArray(data.urls) ? data.urls : []

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }))
    } catch (error) {
      console.error('Error uploading images:', error)
      alert('Unexpected error while uploading images')
    } finally {
      event.target.value = ''
      setIsUploadingImages(false)
    }
  }

  const handleRemoveImage = (imageUrl) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((url) => url !== imageUrl),
    }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <Card className="max-h-[90vh] w-full max-w-5xl overflow-y-auto border-border/80 shadow-lg">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
          <CardTitle className="font-heading text-2xl text-primary">
            {property ? 'Edit Property' : 'Create New Property'}
          </CardTitle>
          <Button type="button" variant="ghost" size="icon-sm" onClick={onCancel} aria-label="Close">
            ✕
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <h3 className="font-heading text-lg font-semibold text-primary">Basic Information</h3>
                <Field label="Investment ID">
                  <Input
                    type="number"
                    name="investmentId"
                    value={formData.investmentId}
                    onChange={handleChange}
                    required
                  />
                </Field>
                <Field label="Property Name">
                  <Input type="text" name="name" value={formData.name} onChange={handleChange} required />
                </Field>
                <Field label="Slug (URL-friendly name)">
                  <Input type="text" name="slug" value={formData.slug} onChange={handleChange} required />
                </Field>
                <Field label="Property Type">
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className={adminSelectClassName()}
                    required
                  >
                    <option value="BUILD_TO_SELL">Build to Sell</option>
                    <option value="BUILD_TO_RENT">Build to Rent</option>
                  </select>
                </Field>
              </div>

              <div className="space-y-4">
                <h3 className="font-heading text-lg font-semibold text-primary">Location</h3>
                <Field label="City">
                  <Input type="text" name="city" value={formData.city} onChange={handleChange} required />
                </Field>
                <Field label="State">
                  <Input type="text" name="state" value={formData.state} onChange={handleChange} required />
                </Field>
                <Field label="Full Address">
                  <Input type="text" name="address" value={formData.address} onChange={handleChange} required />
                </Field>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-heading text-lg font-semibold text-primary">Financial Information</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                <Field label="Total Price ($)">
                  <Input type="number" name="price" value={formData.price} onChange={handleChange} required />
                </Field>
                <Field label="Unit Count">
                  <Input type="number" name="unitCount" value={formData.unitCount} onChange={handleChange} required />
                </Field>
                <Field label="Min Investment ($)">
                  <Input
                    type="number"
                    name="minInvestment"
                    value={formData.minInvestment}
                    onChange={handleChange}
                    required
                  />
                </Field>
                <Field label="Estimated ROI (%)">
                  <Input
                    type="number"
                    step="0.1"
                    name="estimatedROI"
                    value={formData.estimatedROI}
                    onChange={handleChange}
                    required
                  />
                </Field>
              </div>
              <Field label="Timeline (Months)">
                <Input
                  type="text"
                  name="estimatedMonths"
                  value={formData.estimatedMonths}
                  onChange={handleChange}
                  required
                />
              </Field>
            </div>

            <div className="space-y-4">
              <h3 className="font-heading text-lg font-semibold text-primary">Content</h3>
              <Field label="Summary">
                <Textarea name="summary" value={formData.summary} onChange={handleChange} rows={4} required />
              </Field>
              <Field label="Property Facts">
                <div className="space-y-3">
                  {propertyFactsRows.map((row) => (
                    <div key={row.id} className="space-y-2 rounded-md border border-border/60 p-3">
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div className="space-y-1">
                          <Label className="text-xs text-main-gold">English Label</Label>
                          <Input
                            type="text"
                            value={row.labelEn}
                            placeholder="Property Size"
                            onChange={(e) =>
                              handleKeyValueChange(setPropertyFactsRows, row.id, 'labelEn', e.target.value)
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-main-gold">English Value</Label>
                          <Input
                            type="text"
                            value={row.valueEn}
                            placeholder="0.25 acres"
                            onChange={(e) =>
                              handleKeyValueChange(setPropertyFactsRows, row.id, 'valueEn', e.target.value)
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-main-gold">Spanish Label</Label>
                          <Input
                            type="text"
                            value={row.labelEs}
                            placeholder="Tamano de la propiedad"
                            onChange={(e) =>
                              handleKeyValueChange(setPropertyFactsRows, row.id, 'labelEs', e.target.value)
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-main-gold">Spanish Value</Label>
                          <Input
                            type="text"
                            value={row.valueEs}
                            placeholder="0.25 acres"
                            onChange={(e) =>
                              handleKeyValueChange(setPropertyFactsRows, row.id, 'valueEs', e.target.value)
                            }
                          />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => removeKeyValueRow(setPropertyFactsRows, row.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={() => addKeyValueRow(setPropertyFactsRows)}>
                    + Add Fact
                  </Button>
                </div>
              </Field>
              <Field label="Investment Details">
                <div className="space-y-3">
                  {investmentDetailsRows.map((row) => (
                    <div key={row.id} className="space-y-2 rounded-md border border-border/60 p-3">
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div className="space-y-1">
                          <Label className="text-xs text-main-gold">English Label</Label>
                          <Input
                            type="text"
                            value={row.labelEn}
                            placeholder="Land Cost"
                            onChange={(e) =>
                              handleKeyValueChange(setInvestmentDetailsRows, row.id, 'labelEn', e.target.value)
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-main-gold">English Value</Label>
                          <Input
                            type="text"
                            value={row.valueEn}
                            placeholder="1200000"
                            onChange={(e) =>
                              handleKeyValueChange(setInvestmentDetailsRows, row.id, 'valueEn', e.target.value)
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-main-gold">Spanish Label</Label>
                          <Input
                            type="text"
                            value={row.labelEs}
                            placeholder="Costo del terreno"
                            onChange={(e) =>
                              handleKeyValueChange(setInvestmentDetailsRows, row.id, 'labelEs', e.target.value)
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-main-gold">Spanish Value</Label>
                          <Input
                            type="text"
                            value={row.valueEs}
                            placeholder="1200000"
                            onChange={(e) =>
                              handleKeyValueChange(setInvestmentDetailsRows, row.id, 'valueEs', e.target.value)
                            }
                          />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => removeKeyValueRow(setInvestmentDetailsRows, row.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addKeyValueRow(setInvestmentDetailsRows)}
                  >
                    + Add Detail
                  </Button>
                </div>
              </Field>
              <Field label="Project Images">
                <div className="space-y-3 rounded-md border border-border/60 p-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <Input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/avif"
                      multiple
                      onChange={handleImageUpload}
                      disabled={isUploadingImages || isLoading}
                    />
                    {isUploadingImages ? (
                      <span className="text-sm text-muted-foreground">Uploading...</span>
                    ) : null}
                  </div>

                  {formData.images.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                      {formData.images.map((imageUrl) => (
                        <div key={imageUrl} className="space-y-2 rounded border border-border/60 p-2">
                          <div className="aspect-video overflow-hidden rounded bg-muted">
                            <img src={imageUrl} alt="Property upload" className="h-full w-full object-cover" />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => handleRemoveImage(imageUrl)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No images uploaded yet.</p>
                  )}
                </div>
              </Field>
            </div>

            <div className="flex justify-end gap-3 border-t border-border pt-6">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : property ? 'Update Property' : 'Create Property'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
