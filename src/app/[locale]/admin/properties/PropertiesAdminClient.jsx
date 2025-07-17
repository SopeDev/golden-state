'use client'

import { useState } from 'react'
import Button from '../../../components/Button'

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
      day: 'numeric'
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
        setPropertiesList(propertiesList.filter(p => p.id !== propertyId))
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const updatedProperty = await response.json()
        
        if (editingProperty) {
          setPropertiesList(propertiesList.map(p => 
            p.id === editingProperty.id ? updatedProperty : p
          ))
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-main-blue mb-4">Property Management</h1>
            <p className="text-lg text-main-text max-w-2xl">
              Create, edit, and manage properties in the Golden State investment platform.
            </p>
          </div>
          <Button
            onClick={handleCreateProperty}
            variant="primary"
            className="px-6 py-3"
          >
            + Add New Property
          </Button>
        </div>

        {/* Properties Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-main-blue text-white">
                <tr>
                  <th className="px-6 py-4 text-left">ID</th>
                  <th className="px-6 py-4 text-left">Name</th>
                  <th className="px-6 py-4 text-left">Type</th>
                  <th className="px-6 py-4 text-left">Location</th>
                  <th className="px-6 py-4 text-left">Price</th>
                  <th className="px-6 py-4 text-left">Min Investment</th>
                  <th className="px-6 py-4 text-left">ROI</th>
                  <th className="px-6 py-4 text-left">Created</th>
                  <th className="px-6 py-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {propertiesList.map((property) => (
                  <tr key={property.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-main-blue">#{property.investmentId}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-main-blue">{property.name}</div>
                        <div className="text-sm text-gray-500">{property.slug}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        property.type === 'BUILD_TO_SELL' 
                          ? 'bg-secondary-blue text-white' 
                          : 'bg-secondary-gold text-main-blue'
                      }`}>
                        {property.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold">{property.city}, {property.state}</div>
                        <div className="text-sm text-gray-500">{property.address}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-main-gold">
                        {formatCurrency(property.price)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-main-gold">
                        {formatCurrency(property.minInvestment)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-main-gold">
                        {property.estimatedROI}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(property.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEditProperty(property)}
                          variant="outlineblue"
                          className="px-3 py-1 text-sm"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDeleteProperty(property.id)}
                          variant="ghost"
                          className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
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
        </div>

        {/* Property Form Modal */}
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
    investmentDetails: property?.investmentDetails ? JSON.stringify(property.investmentDetails, null, 2) : '',
    images: property?.images ? property.images.join('\n') : ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Parse JSON fields
    const submitData = {
      ...formData,
      price: parseInt(formData.price),
      unitCount: parseInt(formData.unitCount),
      minInvestment: parseInt(formData.minInvestment),
      estimatedROI: parseFloat(formData.estimatedROI),
      estimatedMonths: parseInt(formData.estimatedMonths),
      propertyFacts: formData.propertyFacts ? JSON.parse(formData.propertyFacts) : {},
      investmentDetails: formData.investmentDetails ? JSON.parse(formData.investmentDetails) : {},
      images: formData.images ? formData.images.split('\n').filter(img => img.trim()) : []
    }

    onSubmit(submitData)
  }

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.75)] flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-main-blue">
            {property ? 'Edit Property' : 'Create New Property'}
          </h2>
          <Button
            onClick={onCancel}
            variant="ghost"
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-main-blue">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-main-text mb-2">
                  Investment ID
                </label>
                <input
                  type="number"
                  name="investmentId"
                  value={formData.investmentId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-main-blue focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-main-text mb-2">
                  Property Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-main-blue focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-main-text mb-2">
                  Slug (URL-friendly name)
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-main-blue focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-main-text mb-2">
                  Property Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-main-blue focus:border-transparent"
                  required
                >
                  <option value="BUILD_TO_SELL">Build to Sell</option>
                  <option value="BUILD_TO_RENT">Build to Rent</option>
                </select>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-main-blue">Location</h3>
              
              <div>
                <label className="block text-sm font-medium text-main-text mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-main-blue focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-main-text mb-2">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-main-blue focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-main-text mb-2">
                  Full Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-main-blue focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-main-blue">Financial Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-main-text mb-2">
                  Total Price ($)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-main-blue focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-main-text mb-2">
                  Unit Count
                </label>
                <input
                  type="number"
                  name="unitCount"
                  value={formData.unitCount}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-main-blue focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-main-text mb-2">
                  Min Investment ($)
                </label>
                <input
                  type="number"
                  name="minInvestment"
                  value={formData.minInvestment}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-main-blue focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-main-text mb-2">
                  Estimated ROI (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="estimatedROI"
                  value={formData.estimatedROI}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-main-blue focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-main-text mb-2">
                Timeline (Months)
              </label>
              <input
                type="number"
                name="estimatedMonths"
                value={formData.estimatedMonths}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-main-blue focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Content */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-main-blue">Content</h3>
            
            <div>
              <label className="block text-sm font-medium text-main-text mb-2">
                Summary
              </label>
              <textarea
                name="summary"
                value={formData.summary}
                onChange={handleChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-main-blue focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-main-text mb-2">
                Property Facts (JSON)
              </label>
              <textarea
                name="propertyFacts"
                value={formData.propertyFacts}
                onChange={handleChange}
                rows="6"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-main-blue focus:border-transparent font-mono text-sm"
                placeholder='{"lotSize": "0.25 acres", "zoning": "R-2", "permits": "In progress"}'
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-main-text mb-2">
                Investment Details (JSON)
              </label>
              <textarea
                name="investmentDetails"
                value={formData.investmentDetails}
                onChange={handleChange}
                rows="6"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-main-blue focus:border-transparent font-mono text-sm"
                placeholder='{"landCost": 1200000, "constructionCost": 2000000, "softCosts": 300000}'
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-main-text mb-2">
                Image URLs (one per line)
              </label>
              <textarea
                name="images"
                value={formData.images}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-main-blue focus:border-transparent"
                placeholder="/properties/image1.jpg&#10;/properties/image2.jpg"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button
              type="button"
              onClick={onCancel}
              variant="outlineblue"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : (property ? 'Update Property' : 'Create Property')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 