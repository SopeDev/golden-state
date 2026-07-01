'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { isImageDocument, isPdfDocument } from '@/lib/investorDocumentPreview'

export default function DocumentPreviewModal({
  doc,
  title,
  closeLabel,
  openInNewTabLabel,
  previewUnavailableLabel,
  onClose,
}) {
  useEffect(() => {
    if (!doc) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [doc, onClose])

  if (!doc) return null

  const isImage = isImageDocument(doc)
  const isPdf = isPdfDocument(doc)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-label={closeLabel}
      />
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-border/80 bg-background shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border/80 px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <p className="font-heading text-lg font-semibold text-primary">{title}</p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{doc.fileName}</p>
          </div>
          <Button type="button" variant="ghost" size="icon-sm" onClick={onClose} aria-label={closeLabel}>
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        <div className="flex-1 overflow-auto bg-muted/20 p-4 sm:p-5">
          {isImage ? (
            <img
              src={doc.fileUrl}
              alt={doc.fileName}
              className="mx-auto max-h-[72vh] w-auto max-w-full rounded-md border border-border/60 bg-background object-contain"
            />
          ) : isPdf ? (
            <iframe
              title={doc.fileName}
              src={doc.fileUrl}
              className="h-[72vh] w-full rounded-md border border-border/60 bg-background"
            />
          ) : (
            <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
              <p className="text-sm text-muted-foreground">{previewUnavailableLabel}</p>
              <a
                href={doc.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-main-gold hover:underline"
              >
                {openInNewTabLabel}
              </a>
            </div>
          )}
        </div>

        {isImage || isPdf ? (
          <div className="border-t border-border/80 px-4 py-3 sm:px-5">
            <a
              href={doc.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-main-gold hover:underline"
            >
              {openInNewTabLabel}
            </a>
          </div>
        ) : null}
      </div>
    </div>
  )
}
