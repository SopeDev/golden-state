'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import ContactPageClient from '@/app/[locale]/contact/ContactPageClient'
import enMessages from '../../../../../../../messages/en.json'
import esMessages from '../../../../../../../messages/es.json'

const FALLBACK_CONTENT_BY_LOCALE = {
  en: enMessages.Contact || {},
  es: esMessages.Contact || {},
}

export default function ContactPreviewClient() {
  const [locale, setLocale] = useState('en')
  const containerRef = useRef(null)
  const [contentByLocale, setContentByLocale] = useState({
    en: FALLBACK_CONTENT_BY_LOCALE.en,
    es: FALLBACK_CONTENT_BY_LOCALE.es,
  })

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return
      if (event.data?.type !== 'CONTACT_PREVIEW_UPDATE') return

      setLocale(event.data.payload?.locale || 'en')
      setContentByLocale(event.data.payload?.contentByLocale || { en: {}, es: {} })
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const content = useMemo(() => {
    return contentByLocale[locale] || FALLBACK_CONTENT_BY_LOCALE[locale] || FALLBACK_CONTENT_BY_LOCALE.en
  }, [contentByLocale, locale])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const valueToKey = new Map()
    const normalizeText = (value) => value.replace(/\s+/g, ' ').trim()

    Object.entries(content).forEach(([key, value]) => {
      if (typeof value !== 'string') return
      const normalized = normalizeText(value)
      if (!normalized) return
      if (!valueToKey.has(normalized)) {
        valueToKey.set(normalized, key)
      }
    })

    const candidates = container.querySelectorAll(
      'h1, h2, h3, h4, h5, h6, p, span, a, button, blockquote, li, div, dt, dd, small, strong, em, label'
    )
    candidates.forEach((node) => {
      const text = normalizeText(node.textContent || '')
      const hasNestedElementChildren = Array.from(node.children).some(
        (child) => normalizeText(child.textContent || '').length > 0
      )

      if (hasNestedElementChildren) {
        node.removeAttribute('data-editable-key')
        node.classList.remove('cursor-pointer', 'rounded', 'transition-colors', 'hover:bg-main-gold/20')
        return
      }

      const key = valueToKey.get(text)

      if (key) {
        node.setAttribute('data-editable-key', key)
        node.classList.add('cursor-pointer', 'rounded', 'transition-colors', 'hover:bg-main-gold/20')
      } else {
        node.removeAttribute('data-editable-key')
        node.classList.remove('cursor-pointer', 'rounded', 'transition-colors', 'hover:bg-main-gold/20')
      }
    })
  }, [content])

  useEffect(() => {
    const nav = document.getElementById('nav')
    const contentEl = document.getElementById('content')
    const footer = document.querySelector('footer')

    const previousNavDisplay = nav?.style.display || ''
    const previousContentMarginTop = contentEl?.style.marginTop || ''
    const previousFooterDisplay = footer?.style.display || ''

    if (nav) {
      nav.style.display = 'none'
    }
    if (contentEl) {
      contentEl.style.marginTop = '0px'
    }
    if (footer) {
      footer.style.display = 'none'
    }

    return () => {
      if (nav) {
        nav.style.display = previousNavDisplay
      }
      if (contentEl) {
        contentEl.style.marginTop = previousContentMarginTop
      }
      if (footer) {
        footer.style.display = previousFooterDisplay
      }
    }
  }, [])

  const handlePreviewClickCapture = (event) => {
    const interactiveTarget = event.target.closest('a, button')
    if (interactiveTarget) {
      event.preventDefault()
    }
  }

  const handlePreviewClick = (event) => {
    const target = event.target.closest('[data-editable-key]')
    if (!target) return

    const key = target.getAttribute('data-editable-key')
    if (!key) return

    event.preventDefault()
    event.stopPropagation()

    window.parent.postMessage(
      {
        type: 'CONTACT_PREVIEW_SELECT',
        payload: {
          key,
          locale,
        },
      },
      window.location.origin
    )
  }

  return (
    <div ref={containerRef} onClickCapture={handlePreviewClickCapture} onClick={handlePreviewClick}>
      <ContactPageClient content={content} />
    </div>
  )
}
