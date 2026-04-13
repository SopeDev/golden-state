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
      {label && <Label>{label}</Label>}
      {children}
    </div>
  )
}

function PropertyForm({ property, onSubmit, onCancel, isLoading }) {
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
    propertyFacts: property?.propertyFacts ? JSON.stringify(property.propertyFacts, null, 2) : '',
    investmentDetails: property?.investmentDetails
      ? JSON.stringify(property.investmentDetails, null, 2)
      : '',
    images: property?.images ? property.images.join('\n') : '',
  })

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
      estimatedMonths: parseInt(formData.estimatedMonths, 10),
      propertyFacts: formData.propertyFacts ? JSON.parse(formData.propertyFacts) : {},
      investmentDetails: formData.investmentDetails ? JSON.parse(formData.investmentDetails) : {},
      images: formData.images ? formData.images.split('\n').filter((img) => img.trim()) : [],
    }
    onSubmit(submitData)
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
                  type="number"
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
              <Field label="Property Facts (JSON)">
                <Textarea
                  name="propertyFacts"
                  value={formData.propertyFacts}
                  onChange={handleChange}
                  rows={6}
                  className="font-mono text-xs"
                  placeholder='{"lotSize": "0.25 acres", "zoning": "R-2", "permits": "In progress"}'
                />
              </Field>
              <Field label="Investment Details (JSON)">
                <Textarea
                  name="investmentDetails"
                  value={formData.investmentDetails}
                  onChange={handleChange}
                  rows={6}
                  className="font-mono text-xs"
                  placeholder='{"landCost": 1200000, "constructionCost": 2000000, "softCosts": 300000}'
                />
              </Field>
              <Field label="Image URLs (one per line)">
                <Textarea
                  name="images"
                  value={formData.images}
                  onChange={handleChange}
                  rows={3}
                  placeholder="/properties/image1.jpg&#10;/properties/image2.jpg"
                />
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
