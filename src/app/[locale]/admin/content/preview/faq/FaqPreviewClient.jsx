'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import enMessages from '../../../../../../../messages/en.json'
import esMessages from '../../../../../../../messages/es.json'
import { parseFaqStructure } from '@/lib/faqEditor'

const FALLBACK_CONTENT_BY_LOCALE = {
  en: enMessages.FAQ || {},
  es: esMessages.FAQ || {},
}

const EDITABLE_CLASS =
  'cursor-pointer rounded transition-colors hover:bg-main-gold/20'

const Editable = ({ tag: Tag = 'span', kind, dataset, className = '', children, ...rest }) => {
  const dataAttrs = {}
  if (kind) dataAttrs['data-edit-kind'] = kind
  if (dataset) {
    Object.entries(dataset).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        dataAttrs[`data-edit-${key}`] = String(value)
      }
    })
  }

  return (
    <Tag className={`${EDITABLE_CLASS} ${className}`} {...dataAttrs} {...rest}>
      {children}
    </Tag>
  )
}

export default function FaqPreviewClient() {
  const [locale, setLocale] = useState('en')
  const [contentByLocale, setContentByLocale] = useState(FALLBACK_CONTENT_BY_LOCALE)
  const containerRef = useRef(null)

  useEffect(() => {
    const handler = (event) => {
      if (event.origin !== window.location.origin) return
      if (event.data?.type !== 'FAQ_PREVIEW_UPDATE') return

      setLocale(event.data.payload?.locale || 'en')
      setContentByLocale(event.data.payload?.contentByLocale || FALLBACK_CONTENT_BY_LOCALE)
    }

    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  const content = useMemo(() => {
    return contentByLocale[locale] || FALLBACK_CONTENT_BY_LOCALE[locale] || FALLBACK_CONTENT_BY_LOCALE.en
  }, [contentByLocale, locale])

  const structure = useMemo(() => parseFaqStructure(contentByLocale), [contentByLocale])

  const sections = useMemo(() => {
    return (structure?.categories || []).map((cat) => ({
      id: cat.id,
      title: cat.title?.[locale] || cat.title?.en || cat.id,
      items: (cat.questions || []).map((q) => ({
        question: q.question?.[locale] || '',
        answer: q.answer?.[locale] || '',
      })),
    }))
  }, [structure, locale])

  useEffect(() => {
    const nav = document.getElementById('nav')
    const contentEl = document.getElementById('content')
    const footer = document.querySelector('footer')

    const previousNavDisplay = nav?.style.display || ''
    const previousContentMarginTop = contentEl?.style.marginTop || ''
    const previousFooterDisplay = footer?.style.display || ''

    if (nav) nav.style.display = 'none'
    if (contentEl) contentEl.style.marginTop = '0px'
    if (footer) footer.style.display = 'none'

    return () => {
      if (nav) nav.style.display = previousNavDisplay
      if (contentEl) contentEl.style.marginTop = previousContentMarginTop
      if (footer) footer.style.display = previousFooterDisplay
    }
  }, [])

  const handlePreviewClickCapture = (event) => {
    const interactiveTarget = event.target.closest('a, button')
    if (interactiveTarget) {
      event.preventDefault()
    }
  }

  const handlePreviewClick = (event) => {
    const target = event.target.closest('[data-edit-kind]')
    if (!target) return

    event.preventDefault()
    event.stopPropagation()

    const kind = target.getAttribute('data-edit-kind')
    const payload = { kind, locale }

    if (kind === 'static') {
      payload.key = target.getAttribute('data-edit-key')
    } else if (kind === 'categoryTitle') {
      payload.categoryId = target.getAttribute('data-edit-cat')
    } else if (kind === 'question') {
      payload.categoryId = target.getAttribute('data-edit-cat')
      payload.index = Number(target.getAttribute('data-edit-index'))
      payload.field = target.getAttribute('data-edit-field')
    }

    window.parent.postMessage(
      { type: 'FAQ_PREVIEW_SELECT', payload },
      window.location.origin
    )
  }

  return (
    <div
      ref={containerRef}
      onClickCapture={handlePreviewClickCapture}
      onClick={handlePreviewClick}
      className="flex-1 bg-background"
    >
      <section className="relative overflow-hidden border-b border-border text-primary-foreground">
        <div className="absolute inset-0">
          <Image
            src="/images/skyline-3_1920.webp"
            alt={content.heroTitle || ''}
            fill
            priority
            className="object-cover object-[center_35%]"
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/92 via-primary/82 to-secondary-blue/78" aria-hidden />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(212,175,55,0.22),transparent_45%)]" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 py-14 md:py-20">
          <div className="max-w-3xl">
            <Editable
              tag="h1"
              kind="static"
              dataset={{ key: 'heroTitle' }}
              className="font-heading text-4xl font-semibold tracking-tight md:text-5xl"
            >
              {content.heroTitle}
            </Editable>
            <Editable
              tag="p"
              kind="static"
              dataset={{ key: 'heroSubtitle' }}
              className="mt-5 max-w-2xl text-base leading-relaxed text-primary-foreground/90 md:text-lg"
            >
              {content.heroSubtitle}
            </Editable>
            {content.intro ? (
              <Editable
                tag="p"
                kind="static"
                dataset={{ key: 'intro' }}
                className="mt-4 max-w-2xl text-sm leading-relaxed text-primary-foreground/80 md:text-base"
              >
                {content.intro}
              </Editable>
            ) : null}
          </div>
        </div>
      </section>


      <section className="mx-auto max-w-5xl px-4 py-12 md:py-14">
        {sections.length > 0 ? (
          <div className="mb-8 flex flex-wrap gap-2">
            {sections.map((section) => (
              <Editable
                key={section.id}
                tag="span"
                kind="categoryTitle"
                dataset={{ cat: section.id }}
                className="inline-block rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                {section.title}
              </Editable>
            ))}
          </div>
        ) : null}

        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.id} className="scroll-mt-24">
              <Editable
                tag="h2"
                kind="categoryTitle"
                dataset={{ cat: section.id }}
                className="font-heading mb-4 inline-block text-2xl font-semibold text-primary md:text-3xl"
              >
                {section.title}
              </Editable>
              {section.items.length === 0 ? (
                <p className="rounded-md border border-dashed border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                  No questions yet in this category.
                </p>
              ) : (
                <ul className="space-y-6">
                  {section.items.map((item, index) => (
                    <li key={`${section.id}-${index}`} className="rounded-xl border border-border/80 bg-card p-6 shadow-sm">
                      <Editable
                        tag="h3"
                        kind="question"
                        dataset={{ cat: section.id, index, field: 'question' }}
                        className="font-heading text-xl font-semibold text-primary"
                      >
                        {item.question}
                      </Editable>
                      <Editable
                        tag="p"
                        kind="question"
                        dataset={{ cat: section.id, index, field: 'answer' }}
                        className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base"
                      >
                        {item.answer}
                      </Editable>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-12 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <Editable
              tag="h3"
              kind="static"
              dataset={{ key: 'bottomCtaTitle' }}
              className="font-heading text-2xl font-semibold text-primary"
            >
              {content.bottomCtaTitle}
            </Editable>
            <Editable
              tag="p"
              kind="static"
              dataset={{ key: 'bottomCtaBody' }}
              className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base"
            >
              {content.bottomCtaBody}
            </Editable>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Editable
              tag="span"
              kind="static"
              dataset={{ key: 'bottomCtaPrimary' }}
              className="inline-flex items-center justify-center rounded-md bg-main-gold px-5 py-3 text-sm font-semibold text-primary-foreground"
            >
              {content.bottomCtaPrimary}
            </Editable>
            <Editable
              tag="span"
              kind="static"
              dataset={{ key: 'bottomCtaSecondary' }}
              className="inline-flex items-center justify-center rounded-md border border-primary/30 px-5 py-3 text-sm font-semibold text-primary"
            >
              {content.bottomCtaSecondary}
            </Editable>
          </div>
        </div>
      </section>
    </div>
  )
}
