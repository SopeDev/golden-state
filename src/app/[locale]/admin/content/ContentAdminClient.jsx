'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const ABOUT_KEY_ORDER = [
  'metaTitle',
  'metaDescription',
  'heroEyebrow',
  'heroTitle',
  'heroSubtitle',
  'heroImageAlt',
  'ctaProjects',
  'ctaRegister',
  'modelKicker',
  'modelTitle',
  'modelIntro',
  'modelStep1Title',
  'modelStep1Body',
  'modelStep2Title',
  'modelStep2Body',
  'modelStep3Title',
  'modelStep3Body',
  'missionKicker',
  'missionTitle',
  'missionQuote',
  'missionBody',
  'governanceKicker',
  'governanceTitle',
  'governanceBody',
  'governanceBody2',
  'imageGovernance',
  'diffKicker',
  'diffTitle',
  'diffIntro',
  'diff1Title',
  'diff1Body',
  'diff2Title',
  'diff2Body',
  'diff3Title',
  'diff3Body',
  'investKicker',
  'investTitle',
  'investBody',
  'investPoint1',
  'investPoint2',
  'investPoint3',
  'investNote',
  'investImageAlt',
  'safetyKicker',
  'safetyTitle',
  'safety1Title',
  'safety1Body',
  'safety2Title',
  'safety2Body',
  'safety3Title',
  'safety3Body',
  'reportingKicker',
  'reportingTitle',
  'reportingBody',
  'reportingStep1Title',
  'reportingStep1Body',
  'reportingStep2Title',
  'reportingStep2Body',
  'reportingStep3Title',
  'reportingStep3Body',
  'imageReporting',
  'familyKicker',
  'familyTitle',
  'familyBody',
]

const PAGE_CONFIG = {
  HOME: {
    label: 'Home Page',
    keyOrder: [],
  },
  ABOUT: {
    label: 'About Page',
    keyOrder: ABOUT_KEY_ORDER,
  },
  FAQ: {
    label: 'FAQ Page',
    keyOrder: [],
  },
}

const PAGE_TABS = ['HOME', 'ABOUT', 'FAQ']

export default function ContentAdminClient({ records, fallbackByPage }) {
  const [activePage, setActivePage] = useState('HOME')
  const [previewLocale, setPreviewLocale] = useState('en')
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [highlightedFieldId, setHighlightedFieldId] = useState('')
  const iframeRef = useRef(null)

  const recordsMap = useMemo(() => {
    return records.reduce((acc, record) => {
      const pageKey = record.pageKey
      if (!acc[pageKey]) {
        acc[pageKey] = {}
      }
      acc[pageKey][record.locale] = record.content
      return acc
    }, {})
  }, [records])

  const [contentByPage, setContentByPage] = useState(() => {
    return PAGE_TABS.reduce((acc, pageKey) => {
      const fallback = fallbackByPage[pageKey] || { en: {}, es: {} }
      const saved = recordsMap[pageKey] || {}
      acc[pageKey] = {
        en: { ...(fallback.en || {}), ...(saved.en || {}) },
        es: { ...(fallback.es || {}), ...(saved.es || {}) },
      }
      return acc
    }, {})
  })

  const orderedKeys = useMemo(() => {
    const activeContent = contentByPage[activePage] || { en: {}, es: {} }
    const pageOrder = PAGE_CONFIG[activePage]?.keyOrder || []
    const enKeys = Object.keys(activeContent.en || {})
    const esKeys = Object.keys(activeContent.es || {})
    const allKeys = new Set([...enKeys, ...esKeys])
    const unknownKeys = Array.from(allKeys).filter((key) => !pageOrder.includes(key))
    return [...pageOrder, ...unknownKeys]
  }, [activePage, contentByPage])

  const isLongField = (key) => {
    const longKeyWords = ['Body', 'Subtitle', 'Description', 'Quote', 'Intro', 'Note']
    return longKeyWords.some((word) => key.includes(word))
  }

  const handleReset = () => {
    setStatus('')
    const fallback = fallbackByPage[activePage] || { en: {}, es: {} }
    const saved = recordsMap[activePage] || {}

    setContentByPage((prev) => ({
      ...prev,
      [activePage]: {
        en: { ...(fallback.en || {}), ...(saved.en || {}) },
        es: { ...(fallback.es || {}), ...(saved.es || {}) },
      },
    }))
  }

  const handleFieldChange = (locale, key, value) => {
    setContentByPage((prev) => ({
      ...prev,
      [activePage]: {
        ...(prev[activePage] || {}),
        [locale]: {
          ...((prev[activePage] && prev[activePage][locale]) || {}),
          [key]: value,
        },
      },
    }))
  }

  const handleSave = async () => {
    setStatus('')
    setIsLoading(true)

    try {
      const responseEn = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageKey: activePage,
          locale: 'en',
          content: contentByPage[activePage]?.en || {},
        }),
      })

      if (!responseEn.ok) {
        const error = await responseEn.json()
        setStatus(`English save failed: ${error.message}`)
        return
      }

      const responseEs = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageKey: activePage,
          locale: 'es',
          content: contentByPage[activePage]?.es || {},
        }),
      })

      if (!responseEs.ok) {
        const error = await responseEs.json()
        setStatus(`Spanish save failed: ${error.message}`)
        return
      }

      setStatus(`Saved ${PAGE_CONFIG[activePage].label} content for English and Spanish`)
    } catch (error) {
      console.error('Error saving content:', error)
      setStatus('Unexpected error while saving')
    } finally {
      setIsLoading(false)
    }
  }

  const renderField = (key) => {
    const useTextarea = isLongField(key)
    const enValue = contentByPage[activePage]?.en?.[key] ?? ''
    const esValue = contentByPage[activePage]?.es?.[key] ?? ''

    if (useTextarea) {
      return (
        <div key={key} className="rounded-lg border border-border p-4">
          <Label className="mb-3 block font-mono text-xs text-muted-foreground">{key}</Label>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`en-${key}`}>English (en)</Label>
              <Textarea
                id={`en-${key}`}
                value={enValue}
                onChange={(event) => handleFieldChange('en', key, event.target.value)}
                rows={4}
                className={highlightedFieldId === `en-${key}` ? 'ring-2 ring-main-gold ring-offset-1' : ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`es-${key}`}>Spanish (es)</Label>
              <Textarea
                id={`es-${key}`}
                value={esValue}
                onChange={(event) => handleFieldChange('es', key, event.target.value)}
                rows={4}
                className={highlightedFieldId === `es-${key}` ? 'ring-2 ring-main-gold ring-offset-1' : ''}
              />
            </div>
          </div>
        </div>
      )
    }

    return (
      <div key={key} className="rounded-lg border border-border p-4">
        <Label className="mb-3 block font-mono text-xs text-muted-foreground">{key}</Label>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`en-${key}`}>English (en)</Label>
            <Input
              id={`en-${key}`}
              value={enValue}
              onChange={(event) => handleFieldChange('en', key, event.target.value)}
              className={highlightedFieldId === `en-${key}` ? 'ring-2 ring-main-gold ring-offset-1' : ''}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`es-${key}`}>Spanish (es)</Label>
            <Input
              id={`es-${key}`}
              value={esValue}
              onChange={(event) => handleFieldChange('es', key, event.target.value)}
              className={highlightedFieldId === `es-${key}` ? 'ring-2 ring-main-gold ring-offset-1' : ''}
            />
          </div>
        </div>
      </div>
    )
  }

  const postPreviewState = () => {
    if (!iframeRef.current?.contentWindow) return
    iframeRef.current.contentWindow.postMessage(
      {
        type: 'ABOUT_PREVIEW_UPDATE',
        payload: {
          locale: previewLocale,
          contentByLocale: contentByPage.ABOUT || { en: {}, es: {} },
        },
      },
      window.location.origin
    )
  }

  useEffect(() => {
    if (activePage !== 'ABOUT') return
    postPreviewState()
  }, [activePage, previewLocale, contentByPage])

  useEffect(() => {
    const handlePreviewSelect = (event) => {
      if (event.origin !== window.location.origin) return
      if (event.data?.type !== 'ABOUT_PREVIEW_SELECT') return

      const key = event.data?.payload?.key
      const locale = event.data?.payload?.locale || previewLocale
      if (!key) return

      const fieldId = `${locale}-${key}`
      setHighlightedFieldId(fieldId)

      const target = document.getElementById(fieldId)
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' })
        target.focus()
      }

      window.setTimeout(() => {
        setHighlightedFieldId((prev) => (prev === fieldId ? '' : prev))
      }, 1400)
    }

    window.addEventListener('message', handlePreviewSelect)
    return () => window.removeEventListener('message', handlePreviewSelect)
  }, [previewLocale])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-heading text-4xl font-semibold text-primary">Content Management</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Edit static page copy without code changes. This section currently controls the About page content.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 border-b border-border pb-4">
          {PAGE_TABS.map((pageKey) => {
            const isActive = activePage === pageKey
            return (
              <Button
                key={pageKey}
                type="button"
                variant={isActive ? 'default' : 'outline'}
                onClick={() => {
                  setActivePage(pageKey)
                  setStatus('')
                }}
                disabled={isLoading}
              >
                {PAGE_CONFIG[pageKey].label}
              </Button>
            )
          })}
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <Card className="border-border/80 shadow-md">
            <CardHeader>
              <CardTitle>{PAGE_CONFIG[activePage].label} Content</CardTitle>
              <CardDescription>
                Manage content by page. Home and FAQ tabs are ready for future fields.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {orderedKeys.length > 0 ? (
                  orderedKeys.map((key) => renderField(key))
                ) : (
                  <Card className="border-dashed">
                    <CardContent className="pt-6 text-sm text-muted-foreground">
                      No editable fields configured yet for {PAGE_CONFIG[activePage].label}.
                    </CardContent>
                  </Card>
                )}
              </div>

              {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}

              <div className="flex justify-end gap-3 border-t border-border pt-4">
                <Button type="button" variant="outline" onClick={handleReset} disabled={isLoading}>
                  Reset
                </Button>
                <Button type="button" onClick={handleSave} disabled={isLoading || orderedKeys.length === 0}>
                  {isLoading ? 'Saving...' : 'Save Content'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="h-fit border-border/80 shadow-md xl:sticky xl:top-24">
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
              <CardDescription>Draft preview updates instantly before saving.</CardDescription>
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  size="sm"
                  variant={previewLocale === 'en' ? 'default' : 'outline'}
                  onClick={() => setPreviewLocale('en')}
                >
                  EN
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={previewLocale === 'es' ? 'default' : 'outline'}
                  onClick={() => setPreviewLocale('es')}
                >
                  ES
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {activePage === 'ABOUT' ? (
                <div className="mx-auto h-[70vh] w-full max-w-[390px] overflow-y-auto rounded-xl border border-border bg-background shadow-inner">
                  <iframe
                    ref={iframeRef}
                    title="About mobile preview"
                    src={`/en/admin/content/preview/about`}
                    className="h-full w-full border-0"
                    onLoad={postPreviewState}
                  />
                </div>
              ) : (
                <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  Live preview will appear here once {PAGE_CONFIG[activePage].label} fields are configured.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
