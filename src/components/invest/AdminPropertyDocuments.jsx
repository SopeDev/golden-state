'use client'

import { useCallback, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useSession } from 'next-auth/react'
import { FileText, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { adminSelectClassName } from '@/lib/adminFormClasses'
import {
  PROPERTY_DOCUMENT_KINDS,
  translatePropertyDocumentKind,
} from '@/lib/propertyDocuments'
import { useMessaging } from '@/hooks/useMessaging'
import NotifyDocumentsDialog from '@/components/invest/NotifyDocumentsDialog'
import { hasOperatorPermission, OPERATOR_PERMISSIONS } from '@/lib/operatorPermissions'

const fileInputClassName =
  'block w-full min-w-0 cursor-pointer text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:border-input file:bg-background file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-foreground hover:file:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-50'

const isImageMime = (mimeType) => String(mimeType || '').startsWith('image/')

export default function AdminPropertyDocuments({ propertyId }) {
  const t = useTranslations('PropertyDocuments')
  const tc = useTranslations('Admin.common')
  const { confirm } = useMessaging()
  const { data: session } = useSession()
  const canNotify = hasOperatorPermission(
    session?.user,
    OPERATOR_PERMISSIONS.NOTIFY_PROPERTY_INVESTORS
  )
  const [documents, setDocuments] = useState([])
  const [unannouncedCount, setUnannouncedCount] = useState(0)
  const [kind, setKind] = useState('CONSTRUCTION_PHOTOS')
  const [fileInputKey, setFileInputKey] = useState(0)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)
  const [error, setError] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [notifyPrompt, setNotifyPrompt] = useState(null)
  const [notifying, setNotifying] = useState(false)

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
      setUnannouncedCount(Number(data.unannouncedCount) || 0)
    } catch {
      setError(t('loadError'))
    } finally {
      setLoading(false)
    }
  }, [propertyId, t])

  useEffect(() => {
    loadDocuments()
  }, [loadDocuments])

  const uploadOneFile = async (file, documentKind) => {
    const formData = new FormData()
    formData.append('kind', documentKind)
    formData.append('file', file)

    const res = await fetch(`/api/admin/properties/${propertyId}/documents`, {
      method: 'POST',
      body: formData,
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(data.message || t('uploadError'))
    }
    return data.document
  }

  const handleFilesSelected = async (event) => {
    const files = Array.from(event.target.files || [])
    if (!files.length || !propertyId) return

    setUploading(true)
    setError('')
    setStatusMessage('')
    let uploaded = 0
    try {
      for (const file of files) {
        await uploadOneFile(file, kind)
        uploaded += 1
      }
    } catch (uploadError) {
      setError(uploadError.message || t('uploadError'))
    } finally {
      setUploading(false)
      setFileInputKey((key) => key + 1)
      if (uploaded > 0) {
        await loadDocuments()
        if (canNotify) setNotifyPrompt({ uploadedCount: uploaded })
      }
    }
  }

  const handleKindChange = async (docId, nextKind) => {
    const previous = documents.find((doc) => doc.id === docId)
    if (!previous || previous.kind === nextKind) return

    setUpdatingId(docId)
    setError('')
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === docId ? { ...doc, kind: nextKind } : doc))
    )

    try {
      const res = await fetch(`/api/admin/properties/${propertyId}/documents/${docId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: nextKind }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setDocuments((prev) =>
          prev.map((doc) => (doc.id === docId ? { ...doc, kind: previous.kind } : doc))
        )
        setError(data.message || t('updateError'))
      }
    } catch {
      setDocuments((prev) =>
        prev.map((doc) => (doc.id === docId ? { ...doc, kind: previous.kind } : doc))
      )
      setError(t('updateError'))
    } finally {
      setUpdatingId(null)
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
      await loadDocuments()
    } catch {
      setError(t('deleteError'))
    }
  }

  const handleSkipNotify = () => {
    if (notifying) return
    setNotifyPrompt(null)
  }

  const handleNotifyHolders = async () => {
    if (!propertyId || notifying) return
    setNotifying(true)
    setError('')
    setStatusMessage('')
    try {
      const res = await fetch(`/api/admin/properties/${propertyId}/notify-documents`, {
        method: 'POST',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.message || t('notifyError'))
        return
      }
      setNotifyPrompt(null)
      await loadDocuments()
      const holders = Number(data.holderCount) || 0
      setStatusMessage(
        holders > 0 ? t('notifySuccess', { count: holders }) : t('notifyNone')
      )
    } catch {
      setError(t('notifyError'))
    } finally {
      setNotifying(false)
    }
  }

  if (!propertyId) {
    return <p className="text-sm text-muted-foreground">{t('savePropertyFirst')}</p>
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[12rem] flex-1 space-y-1.5 sm:max-w-xs">
          <label htmlFor="prop-doc-kind" className="text-xs font-medium text-muted-foreground">
            {t('documentType')}
          </label>
          <select
            id="prop-doc-kind"
            value={kind}
            onChange={(e) => setKind(e.target.value)}
            disabled={uploading}
            className={adminSelectClassName()}
          >
            {PROPERTY_DOCUMENT_KINDS.map((value) => (
              <option key={value} value={value}>
                {translatePropertyDocumentKind(t, value)}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          <label htmlFor="prop-doc-file" className="text-xs font-medium text-muted-foreground">
            {t('file')}
          </label>
          <input
            key={fileInputKey}
            id="prop-doc-file"
            type="file"
            accept="application/pdf,image/jpeg,image/png,image/webp,image/avif"
            multiple
            onChange={handleFilesSelected}
            disabled={uploading || loading}
            className={fileInputClassName}
          />
        </div>
        {uploading ? (
          <span className="pb-2 text-sm text-muted-foreground">{t('uploading')}</span>
        ) : null}
      </div>

      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {statusMessage ? (
        <p className="rounded-md border border-border/70 bg-muted/40 px-3 py-2 text-sm text-foreground">
          {statusMessage}
        </p>
      ) : null}

      {canNotify && !notifyPrompt && unannouncedCount > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-main-gold/40 bg-main-gold/10 px-3 py-2">
          <p className="text-sm text-foreground">
            {t('unannouncedHint', { count: unannouncedCount })}
          </p>
          <Button
            type="button"
            size="sm"
            onClick={handleNotifyHolders}
            disabled={notifying || uploading}
          >
            {notifying ? t('notifying') : t('notifyNow')}
          </Button>
        </div>
      ) : null}

      {loading ? (
        <p className="text-sm text-muted-foreground">{tc('saving')}</p>
      ) : documents.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {documents.map((doc) => (
            <div key={doc.id} className="space-y-2 rounded border border-border/60 p-2">
              <a
                href={doc.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="block aspect-video overflow-hidden rounded bg-muted"
                title={doc.fileName}
              >
                {isImageMime(doc.mimeType) ? (
                  <img
                    src={doc.fileUrl}
                    alt={doc.fileName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 px-3 text-center">
                    <FileText className="size-8 text-muted-foreground" aria-hidden />
                    <span className="line-clamp-2 text-xs text-muted-foreground">{doc.fileName}</span>
                  </div>
                )}
              </a>

              {!isImageMime(doc.mimeType) ? null : (
                <p className="truncate text-xs text-muted-foreground" title={doc.fileName}>
                  {doc.fileName}
                </p>
              )}

              <select
                value={doc.kind}
                onChange={(e) => handleKindChange(doc.id, e.target.value)}
                disabled={updatingId === doc.id || uploading}
                className={adminSelectClassName()}
                aria-label={t('documentType')}
              >
                {PROPERTY_DOCUMENT_KINDS.map((value) => (
                  <option key={value} value={value}>
                    {translatePropertyDocumentKind(t, value)}
                  </option>
                ))}
              </select>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => handleDelete(doc.id)}
                disabled={uploading || updatingId === doc.id}
              >
                <Trash2 className="size-4" aria-hidden />
                {t('remove')}
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{t('emptyAdmin')}</p>
      )}

      <NotifyDocumentsDialog
        open={Boolean(notifyPrompt)}
        uploadedCount={notifyPrompt?.uploadedCount || 0}
        notifying={notifying}
        onSkip={handleSkipNotify}
        onNotify={handleNotifyHolders}
      />
    </div>
  )
}
