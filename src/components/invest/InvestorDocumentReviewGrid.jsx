'use client'

import { useState } from 'react'
import { FileText } from 'lucide-react'
import { INVESTOR_DOCUMENT_FIELDS } from '@/lib/investorDocumentFields'
import { isImageDocument, isPdfDocument } from '@/lib/investorDocumentPreview'
import DocumentPreviewModal from '@/components/invest/DocumentPreviewModal'
import { cn } from '@/lib/utils'

const DocumentThumbnail = ({ doc }) => {
  if (isImageDocument(doc)) {
    return (
      <img
        src={doc.fileUrl}
        alt=""
        className="h-full w-full object-cover transition-transform group-hover:scale-[1.03]"
      />
    )
  }

  if (isPdfDocument(doc)) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-0.5 bg-muted/50 text-muted-foreground">
        <FileText className="h-4 w-4" aria-hidden="true" />
        <span className="text-[9px] font-semibold uppercase tracking-wide">PDF</span>
      </div>
    )
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-muted/50 px-1 text-center text-[10px] leading-tight text-muted-foreground">
      {doc.fileName}
    </div>
  )
}

export default function InvestorDocumentReviewGrid({
  documents,
  t,
  viewLabel,
  missingLabel,
  closeLabel,
  openInNewTabLabel,
  previewUnavailableLabel,
  selectable = false,
  selectedKinds = [],
  onToggleKind,
  selectLabel,
}) {
  const documentsByKind = Object.fromEntries(documents.map((doc) => [doc.kind, doc]))
  const [preview, setPreview] = useState(null)
  const selectedSet = new Set(selectedKinds)

  return (
    <>
      <div className="overflow-x-auto">
        <div className="grid min-w-[28rem] grid-cols-4 gap-2">
          {INVESTOR_DOCUMENT_FIELDS.map((field) => {
            const doc = documentsByKind[field.kind]
            const isSelected = selectedSet.has(field.kind)

            return (
              <div key={field.kind} className="min-w-0">
                <p className="line-clamp-2 text-[11px] font-medium leading-tight text-primary">
                  {t(field.labelKey)}
                </p>
                {doc ? (
                  <div
                    className={cn(
                      'mt-1.5 rounded border',
                      isSelected ? 'border-main-gold/60 bg-main-gold/[0.04] p-1' : 'border-transparent'
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setPreview({ doc, title: t(field.labelKey) })}
                      className="group block w-full cursor-pointer overflow-hidden rounded border border-border/70 bg-background text-left transition-colors hover:border-main-gold/40 hover:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                      aria-label={`${viewLabel}: ${doc.fileName}`}
                    >
                      <div className="aspect-[4/3] w-full overflow-hidden">
                        <DocumentThumbnail doc={doc} />
                      </div>
                    </button>
                    {selectable ? (
                      <label className="mt-1.5 flex cursor-pointer items-center gap-1.5 px-0.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleKind?.(field.kind)}
                          className="h-3.5 w-3.5 rounded border-input accent-[var(--main-gold)]"
                        />
                        <span className="text-[10px] leading-tight text-muted-foreground">{selectLabel}</span>
                      </label>
                    ) : null}
                  </div>
                ) : (
                  <div className="mt-1.5 flex aspect-[4/3] w-full items-center justify-center rounded border border-dashed border-border/60 bg-muted/20 px-1 text-center text-[10px] leading-tight text-muted-foreground">
                    {missingLabel}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <DocumentPreviewModal
        doc={preview?.doc}
        title={preview?.title}
        closeLabel={closeLabel}
        openInNewTabLabel={openInNewTabLabel}
        previewUnavailableLabel={previewUnavailableLabel}
        onClose={() => setPreview(null)}
      />
    </>
  )
}
