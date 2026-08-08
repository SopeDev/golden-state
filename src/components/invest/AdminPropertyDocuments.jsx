'use client'

import { useCallback, useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { FileText, Trash2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { adminSelectClassName } from '@/lib/adminFormClasses'
import {
  PROPERTY_DOCUMENT_KINDS,
  translatePropertyDocumentKind,
} from '@/lib/propertyDocuments'
import { useMessaging } from '@/hooks/useMessaging'

export default function AdminPropertyDocuments({ propertyId }) {
  const t = useTranslations('PropertyDocuments')
  const tc = useTranslations('Admin.common')
  const locale = useLocale()
  const { confirm } = useMessaging()
  const [documents, setDocuments] = useState([])
  const [kind, setKind] = useState('CONSTRUCTION_PHOTOS')
  const [file, setFile] = useState(null)
  const [fileInputKey, setFileInputKey] = useState(0)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const loadDocuments = useCallback(async () => {
    if (!propertyId) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/properties/${propertyId}/documents`)
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.message || t('loadError'))
        return
      }
      setDocuments(Array.isArray(data.documents) ? data.documents : [])
    } catch {
      setError(t('loadError'))
    } finally {
      setLoading(false)
    }
  }, [propertyId, t])

  useEffect(() => {
    loadDocuments()
  }, [loadDocuments])

  const handleUpload = async () => {
    if (!file || !propertyId) return

    setUploading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('kind', kind)
      formData.append('file', file)

      const res = await fetch(`/api/admin/properties/${propertyId}/documents`, {
        method: 'POST',
        body: formData,
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.message || t('uploadError'))
        return
      }
      setFile(null)
      setFileInputKey((key) => key + 1)
      await loadDocuments()
    } catch {
      setError(t('uploadError'))
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (docId) => {
    const confirmed = await confirm({
      message: t('confirmDelete'),
      variant: 'destructive',
      confirmLabel: t('remove'),
    })
    if (!confirmed) return
    setError('')
    try {
      const res = await fetch(`/api/admin/properties/${propertyId}/documents/${docId}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.message || t('deleteError'))
        return
      }
      setDocuments((prev) => prev.filter((doc) => doc.id !== docId))
    } catch {
      setError(t('deleteError'))
    }
  }

  const formatDate = (value) => {
    if (!value) return '—'
    return new Intl.DateTimeFormat(locale === 'es' ? 'es-MX' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(value))
  }

  if (!propertyId) {
    return (
      <p className="text-sm text-muted-foreground">{t('savePropertyFirst')}</p>
    )
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">{t('adminHint')}</p>

      <div className="space-y-3 rounded-lg border border-border/70 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="prop-doc-kind">{t('documentType')}</Label>
            <select
              id="prop-doc-kind"
              value={kind}
              onChange={(e) => setKind(e.target.value)}
              className={adminSelectClassName()}
            >
              {PROPERTY_DOCUMENT_KINDS.map((value) => (
                <option key={value} value={value}>
                  {translatePropertyDocumentKind(t, value)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="prop-doc-file">{t('file')}</Label>
            <Input
              key={fileInputKey}
              id="prop-doc-file"
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/webp,image/avif"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              disabled={uploading}
            />
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          className="gap-1.5"
          disabled={!file || uploading}
          onClick={handleUpload}
        >
          <Upload className="size-4" aria-hidden />
          {uploading ? t('uploading') : t('upload')}
        </Button>
      </div>

      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-muted-foreground">{tc('saving')}</p>
      ) : documents.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('emptyAdmin')}</p>
      ) : (
        <ul className="divide-y divide-border/60 rounded-lg border border-border/70">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="flex flex-wrap items-center justify-between gap-3 px-3 py-2.5"
            >
              <div className="min-w-0 flex items-start gap-2">
                <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                <div className="min-w-0">
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block truncate text-sm font-medium text-primary hover:underline"
                  >
                    {doc.fileName}
                  </a>
                  <p className="text-xs text-muted-foreground">
                    {translatePropertyDocumentKind(t, doc.kind)} ·{' '}
                    {formatDate(doc.uploadedAt)}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10"
                onClick={() => handleDelete(doc.id)}
              >
                <Trash2 className="size-4" aria-hidden />
                {t('remove')}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
