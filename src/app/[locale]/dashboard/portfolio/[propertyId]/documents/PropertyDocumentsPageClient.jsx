'use client'

import { useMemo, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { FileText, Search } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import DocumentPreviewModal from '@/components/invest/DocumentPreviewModal'
import { isImageDocument, isPdfDocument } from '@/lib/investorDocumentPreview'
import { cn } from '@/lib/utils'
import {
  PROPERTY_DOCUMENT_KIND_ORDER,
  translatePropertyDocumentKind,
} from '@/lib/propertyDocuments'

function DocumentGalleryThumb({ doc, pdfLabel }) {
  if (isImageDocument(doc)) {
    return (
      <img
        src={doc.fileUrl}
        alt=""
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
      />
    )
  }

  if (isPdfDocument(doc)) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted/40 text-muted-foreground">
        <FileText className="size-8 text-main-gold" aria-hidden />
        <span className="text-[10px] font-semibold uppercase tracking-wide">{pdfLabel}</span>
      </div>
    )
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted/40 px-3 text-center text-muted-foreground">
      <FileText className="size-8 text-main-gold" aria-hidden />
      <span className="line-clamp-2 text-[10px] leading-tight">{doc.fileName}</span>
    </div>
  )
}

function getUploadMonthKey(value) {
  if (!value) return 'unknown'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'unknown'
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

function formatUploadMonthLabel(monthKey, locale) {
  if (!monthKey || monthKey === 'unknown') return null
  const [year, month] = monthKey.split('-').map(Number)
  if (!year || !month) return null
  return new Intl.DateTimeFormat(locale === 'es' ? 'es-MX' : 'en-US', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, 1))
}

function groupDocumentsByUploadMonth(docs, locale) {
  const buckets = new Map()

  for (const doc of docs || []) {
    const key = getUploadMonthKey(doc.uploadedAt)
    if (!buckets.has(key)) buckets.set(key, [])
    buckets.get(key).push(doc)
  }

  return [...buckets.entries()]
    .sort((a, b) => {
      if (a[0] === 'unknown') return 1
      if (b[0] === 'unknown') return -1
      return b[0].localeCompare(a[0])
    })
    .map(([key, documents]) => ({
      key,
      label: formatUploadMonthLabel(key, locale),
      documents,
    }))
}

export default function PropertyDocumentsPageClient({ property, documents, groups }) {
  const t = useTranslations('PropertyDocuments')
  const locale = useLocale()
  const [activeKind, setActiveKind] = useState('ALL')
  const [query, setQuery] = useState('')
  const [preview, setPreview] = useState(null)

  const kindCounts = useMemo(() => {
    const counts = Object.fromEntries(PROPERTY_DOCUMENT_KIND_ORDER.map((k) => [k, 0]))
    for (const doc of documents || []) {
      if (counts[doc.kind] != null) counts[doc.kind] += 1
      else counts.OTHER = (counts.OTHER || 0) + 1
    }
    return counts
  }, [documents])

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase()
    const source =
      activeKind === 'ALL'
        ? groups
        : groups.filter((group) => group.kind === activeKind)

    const filtered = !q
      ? source
      : source
          .map((group) => ({
            ...group,
            documents: group.documents.filter((doc) =>
              String(doc.fileName || '').toLowerCase().includes(q)
            ),
          }))
          .filter((group) => group.documents.length > 0)

    return filtered.map((group) => ({
      ...group,
      dateGroups: groupDocumentsByUploadMonth(group.documents, locale),
    }))
  }, [groups, activeKind, query, locale])

  const totalVisible = filteredGroups.reduce((sum, g) => sum + g.documents.length, 0)

  const formatDate = (value) => {
    if (!value) return '—'
    return new Intl.DateTimeFormat(locale === 'es' ? 'es-MX' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(value))
  }

  const sidebarKinds = [
    { id: 'ALL', label: t('filterAll'), count: documents.length },
    ...PROPERTY_DOCUMENT_KIND_ORDER.filter((kind) => kindCounts[kind] > 0).map((kind) => ({
      id: kind,
      label: translatePropertyDocumentKind(t, kind),
      count: kindCounts[kind],
    })),
  ]

  return (
    <div className="flex-1 bg-background">
      <header className="border-b border-border bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-10 md:px-6 md:py-12">
          <Link
            href="/dashboard/portfolio"
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'sm' }),
              'mb-4 text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground'
            )}
          >
            {t('backToPortfolio')}
          </Link>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-foreground/70">
            {t('panelTitle')}
          </p>
          <h1 className="font-heading mt-2 text-3xl font-semibold md:text-4xl">{property.name}</h1>
          <p className="mt-2 text-sm text-primary-foreground/80 md:text-base">
            #{property.investmentId} · {property.address}, {property.city}, {property.state}
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 md:px-6 md:py-10">
        <div className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
          <aside className="space-y-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('filterByType')}
              </p>
              <nav className="flex flex-row gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
                {sidebarKinds.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveKind(item.id)}
                    className={cn(
                      'flex shrink-0 cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-colors',
                      activeKind === item.id
                        ? 'border-main-gold/50 bg-main-gold/10 text-primary'
                        : 'border-border/70 bg-card text-muted-foreground hover:border-border hover:text-foreground'
                    )}
                  >
                    <span className="truncate">{item.label}</span>
                    <span className="tabular-nums text-xs opacity-80">{item.count}</span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          <section className="min-w-0 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                {t('resultsCount', { count: totalVisible })}
              </p>
              <div className="relative w-full sm:max-w-xs">
                <Search
                  className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className="pl-8"
                  aria-label={t('searchPlaceholder')}
                />
              </div>
            </div>

            {documents.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
                <p className="text-sm text-muted-foreground">{t('emptyInvestor')}</p>
                <Link
                  href="/dashboard/portfolio"
                  className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'mt-4')}
                >
                  {t('backToPortfolio')}
                </Link>
              </div>
            ) : filteredGroups.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center text-sm text-muted-foreground">
                {t('noSearchResults')}
              </div>
            ) : (
              <div className="space-y-10">
                {filteredGroups.map((group) => (
                  <div key={group.kind} className="space-y-5">
                    <div className="flex items-baseline justify-between gap-3 border-b border-border/70 pb-2">
                      <h2 className="font-heading text-lg font-semibold text-primary">
                        {translatePropertyDocumentKind(t, group.kind)}
                      </h2>
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {group.documents.length}
                      </span>
                    </div>

                    <div className="space-y-6">
                      {group.dateGroups.map((dateGroup) => (
                        <div key={dateGroup.key} className="space-y-3">
                          <div className="flex items-baseline justify-between gap-3">
                            <h3 className="text-sm font-semibold text-muted-foreground">
                              {dateGroup.label || t('unknownDate')}
                            </h3>
                            <span className="text-xs tabular-nums text-muted-foreground">
                              {dateGroup.documents.length}
                            </span>
                          </div>

                          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                            {dateGroup.documents.map((doc) => (
                              <li key={doc.id}>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPreview({
                                      doc,
                                      title: translatePropertyDocumentKind(t, doc.kind),
                                    })
                                  }
                                  className="group flex w-full cursor-pointer flex-col overflow-hidden rounded-xl border border-border/80 bg-card text-left transition-colors hover:border-main-gold/40 hover:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                                  aria-label={t('viewDocument', { fileName: doc.fileName })}
                                >
                                  <div className="aspect-[4/3] w-full overflow-hidden bg-muted/30">
                                    <DocumentGalleryThumb doc={doc} pdfLabel={t('pdfBadge')} />
                                  </div>
                                  <div className="space-y-0.5 px-3 py-2.5">
                                    <p className="truncate text-sm font-medium text-foreground">
                                      {doc.fileName}
                                    </p>
                                    <p className="text-xs tabular-nums text-muted-foreground">
                                      {formatDate(doc.uploadedAt)}
                                    </p>
                                  </div>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      <DocumentPreviewModal
        doc={preview?.doc}
        title={preview?.title}
        closeLabel={t('close')}
        openInNewTabLabel={t('openInNewTab')}
        previewUnavailableLabel={t('previewUnavailable')}
        onClose={() => setPreview(null)}
      />
    </div>
  )
}
