'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import FaqStructuredEditor, { faqInputId } from './FaqStructuredEditor'
import {
  parseFaqStructure,
  composeFaqFlat,
  isFaqStructuredKey,
  addCategory as faqAddCategory,
  removeCategory as faqRemoveCategory,
  moveCategory as faqMoveCategory,
  updateCategoryTitle as faqUpdateCategoryTitle,
  addQuestion as faqAddQuestion,
  removeQuestion as faqRemoveQuestion,
  moveQuestion as faqMoveQuestion,
  updateQuestionField as faqUpdateQuestionField,
} from '@/lib/faqEditor'

const PREVIEW_CONFIG = {
  HOME: { src: '/en/admin/content/preview/home', updateType: 'HOME_PREVIEW_UPDATE', selectType: 'HOME_PREVIEW_SELECT' },
  ABOUT: { src: '/en/admin/content/preview/about', updateType: 'ABOUT_PREVIEW_UPDATE', selectType: 'ABOUT_PREVIEW_SELECT' },
  FAQ: { src: '/en/admin/content/preview/faq', updateType: 'FAQ_PREVIEW_UPDATE', selectType: 'FAQ_PREVIEW_SELECT' },
}

const stripFaqStructuredKeys = (obj) => {
  if (!obj) return {}
  const out = {}
  Object.entries(obj).forEach(([key, value]) => {
    if (!isFaqStructuredKey(key)) out[key] = value
  })
  return out
}

const mergeForPage = (pageKey, fallback, saved) => {
  if (pageKey === 'FAQ' && typeof saved?.categoryOrder === 'string') {
    // Saved FAQ record is authoritative for categories/items so deleted
    // entries don't resurrect from the bundled fallback.
    return {
      ...stripFaqStructuredKeys(fallback),
      ...saved,
    }
  }
  return { ...(fallback || {}), ...(saved || {}) }
}

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

const HOME_SECTIONS = [
  {
    label: 'Page metadata',
    keys: ['metaTitle', 'metaDescription'],
  },
  {
    label: '1. Hero',
    keys: [
      'heroEyebrow',
      'heroTitle',
      'heroSubtitle',
      'heroBullet1',
      'heroBullet2',
      'heroBullet3',
      'heroBullet4',
      'heroBullet5',
      'heroPrimaryCta',
      'heroSecondaryCta',
      'heroImageAlt',
    ],
  },
  {
    label: '2. Social proof — stats bar',
    keys: [
      'statsKicker',
      'statsTitle',
      'stat1Value',
      'stat1Label',
      'stat2Value',
      'stat2Label',
      'stat3Value',
      'stat3Label',
      'stat4Value',
      'stat4Label',
    ],
  },
  {
    label: '3. What is real estate syndication',
    keys: ['whatIsKicker', 'whatIsTitle', 'whatIsBody1', 'whatIsBody2', 'whatIsBody3'],
  },
  {
    label: '4. Why investors choose Golden State',
    keys: [
      'whyUsKicker',
      'whyUsTitle',
      'whyUsBody1',
      'whyUsBody2',
      'whyUsVideoUrl',
      'whyUsVideoCaption',
    ],
  },
  {
    label: '5. Investment strategies / types',
    keys: [
      'strategiesKicker',
      'strategiesTitle',
      'strategiesSubtitle',
      'strategyBuildToSellTitle',
      'strategyBuildToSellTimeline',
      'strategyBuildToSellBody',
      'strategyBuildToRentTitle',
      'strategyBuildToRentTimeline',
      'strategyBuildToRentBody',
      'strategyFliphouseTitle',
      'strategyFliphouseTimeline',
      'strategyFliphouseBody',
      'strategyMexToUsTitle',
      'strategyMexToUsTimeline',
      'strategyMexToUsBody',
      'strategyUsToMexTitle',
      'strategyUsToMexTimeline',
      'strategyUsToMexBody',
      'strategyAllProjectsTitle',
      'strategyAllProjectsBody',
      'strategyAllProjectsCta',
    ],
  },
  {
    label: '6. Live investment opportunities',
    keys: [
      'liveKicker',
      'liveTitle',
      'liveSubtitle',
      'liveEmpty',
      'liveCardOpens',
      'liveCardRoi',
      'liveCardTimeline',
      'liveCta',
    ],
  },
  {
    label: '7. How it works',
    keys: [
      'howKicker',
      'howTitle',
      'howSubtitle',
      'how1Title',
      'how1Body',
      'how2Title',
      'how2Body',
      'how3Title',
      'how3Body',
      'how4Title',
      'how4Body',
      'how5Title',
      'how5Body',
      'how6Title',
      'how6Body',
      'how7Title',
      'how7Body',
      'howCtaLead',
      'howCtaBody',
      'howCta',
    ],
  },
  {
    label: '8. 10 reasons to invest with us',
    keys: [
      'reasonsKicker',
      'reasonsTitle',
      'reasonsSubtitle',
      ...Array.from({ length: 10 }, (_, i) => [`reason${i + 1}Title`, `reason${i + 1}Body`]).flat(),
    ],
  },
  {
    label: '9. Completed deal highlights',
    keys: [
      'trackKicker',
      'trackTitle',
      'trackSubtitle',
      'trackEmpty',
      'trackCardReturn',
      'trackCardTimeline',
      'trackCta',
    ],
  },
  {
    label: '10. Why add real estate to your portfolio',
    keys: [
      'portfolioKicker',
      'portfolioTitle',
      'portfolioSubtitle',
      'portfolioColumn1Title',
      'portfolioColumn1Stat1Label',
      'portfolioColumn1Stat1Value',
      'portfolioColumn1Stat2Label',
      'portfolioColumn1Stat2Value',
      'portfolioColumn1Stat3Label',
      'portfolioColumn1Stat3Value',
      'portfolioColumn2Title',
      'portfolioColumn2Stat1Label',
      'portfolioColumn2Stat1Value',
      'portfolioColumn2Stat2Label',
      'portfolioColumn2Stat2Value',
      'portfolioColumn2Stat3Label',
      'portfolioColumn2Stat3Value',
      'portfolioDisclaimer',
    ],
  },
  {
    label: '11. Final CTA',
    keys: ['finalCtaKicker', 'finalCtaTitle', 'finalCtaBody', 'finalCtaPrimary', 'finalCtaSecondary'],
  },
]

const HOME_KEY_ORDER = HOME_SECTIONS.flatMap((section) => section.keys)

const PAGE_CONFIG = {
  HOME: {
    label: 'Home Page',
    keyOrder: HOME_KEY_ORDER,
    sections: HOME_SECTIONS,
  },
  ABOUT: {
    label: 'About Page',
    keyOrder: ABOUT_KEY_ORDER,
  },
  FAQ: {
    label: 'FAQ Page',
    keyOrder: [
      'metaTitle',
      'metaDescription',
      'heroTitle',
      'heroSubtitle',
      'intro',
      'highlight1Title',
      'highlight1Body',
      'highlight2Title',
      'highlight2Body',
      'highlight3Title',
      'highlight3Body',
      'bottomCtaTitle',
      'bottomCtaBody',
      'bottomCtaPrimary',
      'bottomCtaSecondary',
    ],
  },
}

const FAQ_STRUCTURED_KEY_REGEX = /^(?:categoryOrder|category.+Title|item\d+(?:Category|Question|Answer))$/

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
        en: mergeForPage(pageKey, fallback.en, saved.en),
        es: mergeForPage(pageKey, fallback.es, saved.es),
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
    const unknownKeys = Array.from(allKeys).filter((key) => {
      if (pageOrder.includes(key)) return false
      // FAQ categories/items are edited via the structured editor below.
      if (activePage === 'FAQ' && FAQ_STRUCTURED_KEY_REGEX.test(key)) return false
      return true
    })
    return [...pageOrder, ...unknownKeys]
  }, [activePage, contentByPage])

  const faqStructure = useMemo(() => {
    if (activePage !== 'FAQ') return null
    return parseFaqStructure(contentByPage.FAQ)
  }, [activePage, contentByPage])

  const applyFaqUpdate = (producer) => {
    setContentByPage((prev) => {
      const baseFaq = prev.FAQ || { en: {}, es: {} }
      const currentStructure = parseFaqStructure(baseFaq)
      const nextStructure = producer(currentStructure)
      const recomposed = composeFaqFlat(nextStructure, baseFaq)
      return {
        ...prev,
        FAQ: recomposed,
      }
    })
  }

  const faqHandlers = {
    onAddCategory: () => applyFaqUpdate((s) => faqAddCategory(s)),
    onRemoveCategory: (categoryId) =>
      applyFaqUpdate((s) => faqRemoveCategory(s, categoryId)),
    onMoveCategory: (categoryId, direction) =>
      applyFaqUpdate((s) => faqMoveCategory(s, categoryId, direction)),
    onCategoryTitleChange: (categoryId, locale, value) =>
      applyFaqUpdate((s) => faqUpdateCategoryTitle(s, categoryId, locale, value)),
    onAddQuestion: (categoryId) =>
      applyFaqUpdate((s) => faqAddQuestion(s, categoryId)),
    onRemoveQuestion: (categoryId, questionIndex) =>
      applyFaqUpdate((s) => faqRemoveQuestion(s, categoryId, questionIndex)),
    onMoveQuestion: (categoryId, questionIndex, direction) =>
      applyFaqUpdate((s) => faqMoveQuestion(s, categoryId, questionIndex, direction)),
    onQuestionFieldChange: (categoryId, questionIndex, field, locale, value) =>
      applyFaqUpdate((s) =>
        faqUpdateQuestionField(s, categoryId, questionIndex, field, locale, value)
      ),
  }

  const isLongField = (key) => {
    const longKeyWords = ['Body', 'Subtitle', 'Description', 'Quote', 'Intro', 'Note', 'Disclaimer']
    return longKeyWords.some((word) => key.includes(word))
  }

  const activeSections = PAGE_CONFIG[activePage]?.sections || null

  const handleReset = () => {
    setStatus('')
    const fallback = fallbackByPage[activePage] || { en: {}, es: {} }
    const saved = recordsMap[activePage] || {}

    setContentByPage((prev) => ({
      ...prev,
      [activePage]: {
        en: mergeForPage(activePage, fallback.en, saved.en),
        es: mergeForPage(activePage, fallback.es, saved.es),
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
    const cfg = PREVIEW_CONFIG[activePage]
    if (!cfg) return
    iframeRef.current.contentWindow.postMessage(
      {
        type: cfg.updateType,
        payload: {
          locale: previewLocale,
          contentByLocale: contentByPage[activePage] || { en: {}, es: {} },
        },
      },
      window.location.origin
    )
  }

  useEffect(() => {
    if (!PREVIEW_CONFIG[activePage]) return
    postPreviewState()
  }, [activePage, previewLocale, contentByPage])

  const focusInputId = (fieldId) => {
    if (!fieldId) return
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

  useEffect(() => {
    const handlePreviewSelect = (event) => {
      if (event.origin !== window.location.origin) return

      const eventType = event.data?.type
      if (eventType === 'ABOUT_PREVIEW_SELECT' || eventType === 'HOME_PREVIEW_SELECT') {
        const key = event.data?.payload?.key
        const locale = event.data?.payload?.locale || previewLocale
        if (!key) return
        focusInputId(`${locale}-${key}`)
        return
      }

      if (eventType === 'FAQ_PREVIEW_SELECT') {
        const payload = event.data?.payload || {}
        const locale = payload.locale || previewLocale
        const fieldId = faqInputId({
          kind: payload.kind,
          locale,
          key: payload.key,
          categoryId: payload.categoryId,
          index: payload.index,
          field: payload.field,
        })
        focusInputId(fieldId)
      }
    }

    window.addEventListener('message', handlePreviewSelect)
    return () => window.removeEventListener('message', handlePreviewSelect)
  }, [previewLocale])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-heading text-4xl font-semibold text-primary">Content Management</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Edit static page copy without code changes. Choose a page tab to edit Home, About, or FAQ content.
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
            <CardContent className="space-y-6">
              {activeSections ? (
                <div className="space-y-8">
                  {activeSections.map((section) => {
                    const sectionKeys = section.keys.filter((key) => orderedKeys.includes(key))
                    if (sectionKeys.length === 0) return null
                    return (
                      <div key={section.label} className="space-y-3">
                        <h3 className="font-heading text-base font-semibold uppercase tracking-wide text-main-gold">
                          {section.label}
                        </h3>
                        <div className="space-y-4">
                          {sectionKeys.map((key) => renderField(key))}
                        </div>
                      </div>
                    )
                  })}
                  {(() => {
                    const knownKeys = new Set(activeSections.flatMap((s) => s.keys))
                    const extras = orderedKeys.filter((key) => !knownKeys.has(key))
                    if (extras.length === 0) return null
                    return (
                      <div className="space-y-3">
                        <h3 className="font-heading text-base font-semibold uppercase tracking-wide text-muted-foreground">
                          Other fields
                        </h3>
                        <div className="space-y-4">
                          {extras.map((key) => renderField(key))}
                        </div>
                      </div>
                    )
                  })()}
                </div>
              ) : (
                <div className="space-y-4">
                  {orderedKeys.length > 0 ? (
                    orderedKeys.map((key) => renderField(key))
                  ) : activePage === 'FAQ' ? null : (
                    <Card className="border-dashed">
                      <CardContent className="pt-6 text-sm text-muted-foreground">
                        No editable fields configured yet for {PAGE_CONFIG[activePage].label}.
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {activePage === 'FAQ' && faqStructure ? (
                <div className="border-t border-border pt-6">
                  <FaqStructuredEditor
                    structure={faqStructure}
                    highlightedFieldId={highlightedFieldId}
                    {...faqHandlers}
                  />
                </div>
              ) : null}

              {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}

              <div className="flex justify-end gap-3 border-t border-border pt-4">
                <Button type="button" variant="outline" onClick={handleReset} disabled={isLoading}>
                  Reset
                </Button>
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={
                    isLoading || (orderedKeys.length === 0 && activePage !== 'FAQ')
                  }
                >
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
              {PREVIEW_CONFIG[activePage] ? (
                <div className="mx-auto h-[70vh] w-full max-w-[390px] overflow-y-auto rounded-xl border border-border bg-background shadow-inner">
                  <iframe
                    key={activePage}
                    ref={iframeRef}
                    title={`${PAGE_CONFIG[activePage].label} mobile preview`}
                    src={PREVIEW_CONFIG[activePage].src}
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
