'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { adminSelectClassName } from '@/lib/adminFormClasses'
import { getPropertyTypeLabelKey } from '@/lib/propertyTypeUi'

const PROPERTY_TYPE_OPTIONS = [
  'BUILD_TO_SELL',
  'BUILD_TO_RENT',
  'FLIPHOUSE',
  'MEX_TO_US',
  'US_TO_MEX',
]

const PROPERTY_STATUS_VALUES = ['IN_PROGRESS', 'COMPLETED']

const keyToLabel = (key) => {
  if (!key) return ''
  const withSpaces = String(key)
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]+/g, ' ')
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

const emptyRow = () => ({
  id: crypto.randomUUID(),
  labelEn: '',
  valueEn: '',
  labelEs: '',
  valueEs: '',
})

const objectToRows = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return [emptyRow()]
  }

  const entries = Object.entries(value)
  if (!entries.length) {
    return [emptyRow()]
  }

  return entries.map(([entryKey, entryValue]) => {
    const fallbackLabel = keyToLabel(entryKey)

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

const buildInitialFormData = (property) => ({
  investmentId: property?.investmentId || '',
  name: property?.name || '',
  slug: property?.slug || '',
  type: property?.type || 'BUILD_TO_SELL',
  status: property?.status || 'IN_PROGRESS',
  city: property?.city || '',
  state: property?.state || '',
  address: property?.address || '',
  price: property?.price ?? '',
  unitCount: property?.unitCount ?? '',
  minInvestment: property?.minInvestment ?? '',
  estimatedROI: property?.estimatedROI ?? '',
  estimatedMonths: property?.estimatedMonths || '',
  summary: property?.summary || '',
  images: property?.images || [],
})

function Field({ label, children, htmlFor }) {
  return (
    <div className="space-y-2">
      {label ? (
        <Label htmlFor={htmlFor} className="text-main-gold">
          {label}
        </Label>
      ) : null}
      {children}
    </div>
  )
}

function KeyValueRow({ row, onChange, onRemove, placeholders }) {
  const te = useTranslations('Admin.properties.editor')
  const tc = useTranslations('Admin.common')
  return (
    <div className="space-y-2 rounded-md border border-border/60 bg-card/40 p-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <Label className="text-xs text-main-gold">{te('labelEn')}</Label>
          <Input
            value={row.labelEn}
            placeholder={placeholders.labelEn}
            onChange={(event) => onChange('labelEn', event.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-main-gold">{te('valueEn')}</Label>
          <Input
            value={row.valueEn}
            placeholder={placeholders.valueEn}
            onChange={(event) => onChange('valueEn', event.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-main-gold">{te('labelEs')}</Label>
          <Input
            value={row.labelEs}
            placeholder={placeholders.labelEs}
            onChange={(event) => onChange('labelEs', event.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-main-gold">{te('valueEs')}</Label>
          <Input
            value={row.valueEs}
            placeholder={placeholders.valueEs}
            onChange={(event) => onChange('valueEs', event.target.value)}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={onRemove}
        >
          <Trash2 className="size-4" aria-hidden />
          {te('removeRow')}
        </Button>
      </div>
    </div>
  )
}

export default function PropertyEditor({
  property,
  isCreating,
  isLoading,
  onSubmit,
  onCancel,
  onDelete,
}) {
  const t = useTranslations('Admin.properties.editor')
  const tc = useTranslations('Admin.common')
  const tf = useTranslations('Admin.filter')
  const tProjects = useTranslations('Projects')
  const [formData, setFormData] = useState(() => buildInitialFormData(property))
  const [propertyFactsRows, setPropertyFactsRows] = useState(() =>
    objectToRows(property?.propertyFacts)
  )
  const [investmentDetailsRows, setInvestmentDetailsRows] = useState(() =>
    objectToRows(property?.investmentDetails)
  )
  const [isUploadingImages, setIsUploadingImages] = useState(false)

  const resetForm = useCallback(() => {
    setFormData(buildInitialFormData(property))
    setPropertyFactsRows(objectToRows(property?.propertyFacts))
    setInvestmentDetailsRows(objectToRows(property?.investmentDetails))
  }, [property])

  useEffect(() => {
    resetForm()
  }, [property?.id, isCreating, resetForm])

  // Dirty tracking: serialize the saved snapshot vs the live form so we
  // can disable "Discard changes" / "Save" when there's nothing to do.
  const initialSnapshot = useMemo(
    () =>
      JSON.stringify({
        formData: buildInitialFormData(property),
        propertyFactsRows: objectToRows(property?.propertyFacts),
        investmentDetailsRows: objectToRows(property?.investmentDetails),
      }),
    [property]
  )

  const currentSnapshot = useMemo(
    () => JSON.stringify({ formData, propertyFactsRows, investmentDetailsRows }),
    [formData, propertyFactsRows, investmentDetailsRows]
  )

  const isDirty = currentSnapshot !== initialSnapshot

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleKeyValueChange = (setter, id, field, value) => {
    setter((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)))
  }

  const addKeyValueRow = (setter) => {
    setter((prev) => [...prev, emptyRow()])
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
      alert(t('uploadError'))
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

  const handleCancelClick = () => {
    if (isCreating) {
      onCancel?.()
      return
    }
    resetForm()
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const submitData = {
      ...formData,
      status: formData.status || 'IN_PROGRESS',
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

  return (
    <Card className="border-border/80 shadow-md">
      <CardHeader className="flex flex-col gap-2 border-b border-border/60 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <CardTitle className="font-heading text-2xl text-primary">
            {isCreating ? t('createTitle') : t('editTitle')}
          </CardTitle>
          {property && !isCreating ? (
            <p className="mt-1 text-xs text-muted-foreground">
              ID #{property.investmentId} · {property.name}
            </p>
          ) : null}
        </div>
        {!isCreating && property ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onDelete?.(property.id)}
            disabled={isLoading}
          >
            <Trash2 className="size-4" aria-hidden />
            {t('deleteProperty')}
          </Button>
        ) : null}
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="space-y-4">
            <h3 className="font-heading text-lg font-semibold text-primary">{t('basicInfo')}</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label={t('investmentId')} htmlFor="prop-investmentId">
                <Input
                  id="prop-investmentId"
                  type="number"
                  name="investmentId"
                  value={formData.investmentId}
                  onChange={handleChange}
                  required
                />
              </Field>
              <Field label={t('propertyType')} htmlFor="prop-type">
                <select
                  id="prop-type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className={adminSelectClassName()}
                  required
                >
                  {PROPERTY_TYPE_OPTIONS.map((value) => (
                    <option key={value} value={value}>
                      {tProjects(getPropertyTypeLabelKey(value))}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t('status')} htmlFor="prop-status">
                <select
                  id="prop-status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={adminSelectClassName()}
                  required
                >
                  {PROPERTY_STATUS_VALUES.map((value) => (
                    <option key={value} value={value}>
                      {value === 'IN_PROGRESS' ? tf('inProgress') : tf('completed')}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">{t('statusHint')}</p>
              </Field>
              <Field label={t('propertyName')} htmlFor="prop-name">
                <Input
                  id="prop-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Field>
              <Field label={t('slug')} htmlFor="prop-slug">
                <Input
                  id="prop-slug"
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  required
                />
              </Field>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="font-heading text-lg font-semibold text-primary">{t('locationSection')}</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Field label={t('city')} htmlFor="prop-city">
                <Input
                  id="prop-city"
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </Field>
              <Field label={t('state')} htmlFor="prop-state">
                <Input
                  id="prop-state"
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                />
              </Field>
              <Field label={t('address')} htmlFor="prop-address">
                <Input
                  id="prop-address"
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </Field>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="font-heading text-lg font-semibold text-primary">{t('financialInfo')}</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
              <Field label={t('totalPrice')} htmlFor="prop-price">
                <Input
                  id="prop-price"
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </Field>
              <Field label={t('unitCount')} htmlFor="prop-unitCount">
                <Input
                  id="prop-unitCount"
                  type="number"
                  name="unitCount"
                  value={formData.unitCount}
                  onChange={handleChange}
                  required
                />
              </Field>
              <Field label={t('minInvestment')} htmlFor="prop-minInvestment">
                <Input
                  id="prop-minInvestment"
                  type="number"
                  name="minInvestment"
                  value={formData.minInvestment}
                  onChange={handleChange}
                  required
                />
              </Field>
              <Field label={t('estimatedRoi')} htmlFor="prop-estimatedROI">
                <Input
                  id="prop-estimatedROI"
                  type="number"
                  step="0.1"
                  name="estimatedROI"
                  value={formData.estimatedROI}
                  onChange={handleChange}
                  required
                />
              </Field>
            </div>
            <Field label={t('timelineMonths')} htmlFor="prop-estimatedMonths">
              <Input
                id="prop-estimatedMonths"
                type="text"
                name="estimatedMonths"
                value={formData.estimatedMonths}
                onChange={handleChange}
                required
                placeholder={t('timelinePlaceholder')}
              />
            </Field>
          </section>

          <section className="space-y-4">
            <h3 className="font-heading text-lg font-semibold text-primary">{t('contentSection')}</h3>
            <Field label={t('summary')} htmlFor="prop-summary">
              <Textarea
                id="prop-summary"
                name="summary"
                value={formData.summary}
                onChange={handleChange}
                rows={4}
                required
              />
            </Field>

            <Field label={t('propertyFacts')}>
              <div className="space-y-3">
                {propertyFactsRows.map((row) => (
                  <KeyValueRow
                    key={row.id}
                    row={row}
                    placeholders={{
                      labelEn: t('placeholderSizeEn'),
                      valueEn: t('placeholderSizeValue'),
                      labelEs: t('placeholderSizeEs'),
                      valueEs: t('placeholderSizeValue'),
                    }}
                    onChange={(field, value) =>
                      handleKeyValueChange(setPropertyFactsRows, row.id, field, value)
                    }
                    onRemove={() => removeKeyValueRow(setPropertyFactsRows, row.id)}
                  />
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 border-main-gold/50 text-main-gold hover:bg-main-gold/10"
                  onClick={() => addKeyValueRow(setPropertyFactsRows)}
                >
                  <Plus className="size-4" aria-hidden />
                  {t('addFact')}
                </Button>
              </div>
            </Field>

            <Field label={t('investmentDetails')}>
              <div className="space-y-3">
                {investmentDetailsRows.map((row) => (
                  <KeyValueRow
                    key={row.id}
                    row={row}
                    placeholders={{
                      labelEn: t('placeholderLandEn'),
                      valueEn: '1200000',
                      labelEs: t('placeholderLandEs'),
                      valueEs: '1200000',
                    }}
                    onChange={(field, value) =>
                      handleKeyValueChange(setInvestmentDetailsRows, row.id, field, value)
                    }
                    onRemove={() => removeKeyValueRow(setInvestmentDetailsRows, row.id)}
                  />
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 border-main-gold/50 text-main-gold hover:bg-main-gold/10"
                  onClick={() => addKeyValueRow(setInvestmentDetailsRows)}
                >
                  <Plus className="size-4" aria-hidden />
                  {t('addDetail')}
                </Button>
              </div>
            </Field>

            <Field label={t('projectImages')}>
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
                    <span className="text-sm text-muted-foreground">{t('uploading')}</span>
                  ) : null}
                </div>

                {formData.images.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {formData.images.map((imageUrl) => (
                      <div key={imageUrl} className="space-y-2 rounded border border-border/60 p-2">
                        <div className="aspect-video overflow-hidden rounded bg-muted">
                          <img src={imageUrl} alt={t('imageAlt')} className="h-full w-full object-cover" />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleRemoveImage(imageUrl)}
                        >
                          <Trash2 className="size-4" aria-hidden />
                          {t('removeImage')}
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{t('noImages')}</p>
                )}
              </div>
            </Field>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
            <p className="text-xs text-muted-foreground">
              {isDirty ? (
                <span className="text-main-gold">{tc('unsavedChanges')}</span>
              ) : isCreating ? (
                tc('fillFormThenCreate')
              ) : (
                tc('noUnsavedChanges')
              )}
            </p>
            <div className="flex flex-wrap justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelClick}
                disabled={isLoading || (!isCreating && !isDirty)}
              >
                {isCreating ? tc('cancel') : tc('discardChanges')}
              </Button>
              <Button type="submit" disabled={isLoading || (!isCreating && !isDirty)}>
                {isLoading ? tc('saving') : isCreating ? t('createProperty') : tc('saveChanges')}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
