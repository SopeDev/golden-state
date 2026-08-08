'use client'

import { useTranslations } from 'next-intl'
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useMessaging } from '@/hooks/useMessaging'

const labelClass = 'text-main-gold'

export const faqInputId = ({ kind, locale, key, categoryId, index, field }) => {
  if (kind === 'static') return `${locale}-${key}`
  if (kind === 'categoryTitle') return `faq-cat-${categoryId}-title-${locale}`
  if (kind === 'question') return `faq-q-${categoryId}-${index}-${field}-${locale}`
  return ''
}

export default function FaqStructuredEditor({
  structure,
  highlightedFieldId,
  onAddCategory,
  onRemoveCategory,
  onMoveCategory,
  onCategoryTitleChange,
  onAddQuestion,
  onRemoveQuestion,
  onMoveQuestion,
  onQuestionFieldChange,
}) {
  const t = useTranslations('Admin.content.faq')
  const tc = useTranslations('Admin.common')
  const { confirm } = useMessaging()
  const highlightRing = (id) =>
    highlightedFieldId === id ? 'ring-2 ring-main-gold ring-offset-1' : ''
  const categories = structure?.categories || []

  const handleRemoveCategory = async (categoryId, previewLabel) => {
    const confirmed = await confirm({
      message: t('confirmRemoveCategory', { name: previewLabel }),
      variant: 'destructive',
      confirmLabel: t('remove'),
    })
    if (confirmed) onRemoveCategory(categoryId)
  }

  const handleRemoveQuestion = async (categoryId, qIndex, previewLabel) => {
    const confirmed = await confirm({
      message: t('confirmRemoveQuestion', {
        number: qIndex + 1,
        name: previewLabel,
      }),
      variant: 'destructive',
      confirmLabel: t('remove'),
    })
    if (confirmed) onRemoveQuestion(categoryId, qIndex)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-heading text-lg font-semibold text-primary">{t('heading')}</h3>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>
        <Button type="button" size="sm" onClick={onAddCategory} className="gap-1.5">
          <Plus className="size-4" aria-hidden />
          {t('addCategory')}
        </Button>
      </div>

      {categories.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-sm text-muted-foreground">
            {t('emptyCategories')}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {categories.map((category, index) => {
            const isFirst = index === 0
            const isLast = index === categories.length - 1
            const previewLabel = category.title?.en || category.title?.es || category.id

            return (
              <Card key={category.id} className="border-border/80 shadow-sm">
                <CardHeader className="flex flex-col gap-3 border-b border-border/60 pb-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base text-primary">{previewLabel}</CardTitle>
                    <p className="font-mono text-xs text-muted-foreground">id: {category.id}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      disabled={isFirst}
                      onClick={() => onMoveCategory(category.id, 'up')}
                      aria-label={t('moveCategoryUp')}
                    >
                      <ChevronUp className="size-4" aria-hidden />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      disabled={isLast}
                      onClick={() => onMoveCategory(category.id, 'down')}
                      aria-label={t('moveCategoryDown')}
                    >
                      <ChevronDown className="size-4" aria-hidden />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleRemoveCategory(category.id, previewLabel)}
                    >
                      <Trash2 className="size-4" aria-hidden />
                      {t('remove')}
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-5 pt-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    {['en', 'es'].map((loc) => {
                      const id = faqInputId({ kind: 'categoryTitle', locale: loc, categoryId: category.id })
                      return (
                        <div key={loc} className="space-y-2">
                          <Label className={labelClass} htmlFor={id}>
                            {t('categoryTitle', {
                              locale: loc === 'en' ? tc('english') : tc('spanish'),
                            })}
                          </Label>
                          <Input
                            id={id}
                            value={(loc === 'en' ? category.title?.en : category.title?.es) || ''}
                            onChange={(event) => onCategoryTitleChange(category.id, loc, event.target.value)}
                            placeholder={
                              loc === 'en'
                                ? t('categoryTitlePlaceholderEn')
                                : t('categoryTitlePlaceholderEs')
                            }
                            className={highlightRing(id)}
                          />
                        </div>
                      )
                    })}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-primary">
                        {t('questionsCount', { count: category.questions?.length || 0 })}
                      </p>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="gap-1.5 border-main-gold/50 text-main-gold hover:bg-main-gold/10"
                        onClick={() => onAddQuestion(category.id)}
                      >
                        <Plus className="size-4" aria-hidden />
                        {t('addQuestion')}
                      </Button>
                    </div>

                    {(category.questions || []).length === 0 ? (
                      <div className="rounded-md border border-dashed border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                        {t('noQuestions')}
                      </div>
                    ) : (
                      <ul className="space-y-3">
                        {category.questions.map((q, qIndex) => {
                          const isFirstQ = qIndex === 0
                          const isLastQ = qIndex === category.questions.length - 1
                          return (
                            <li
                              key={`${category.id}-q-${qIndex}`}
                              className="rounded-lg border border-border/80 bg-card/60 p-4"
                            >
                              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                  {t('questionNumber', { number: qIndex + 1 })}
                                </p>
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="outline"
                                    disabled={isFirstQ}
                                    onClick={() => onMoveQuestion(category.id, qIndex, 'up')}
                                    aria-label={t('moveQuestionUp')}
                                  >
                                    <ChevronUp className="size-4" aria-hidden />
                                  </Button>
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="outline"
                                    disabled={isLastQ}
                                    onClick={() => onMoveQuestion(category.id, qIndex, 'down')}
                                    aria-label={t('moveQuestionDown')}
                                  >
                                    <ChevronDown className="size-4" aria-hidden />
                                  </Button>
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="outline"
                                    className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                    aria-label={t('removeQuestion')}
                                    onClick={() =>
                                      handleRemoveQuestion(category.id, qIndex, previewLabel)
                                    }
                                  >
                                    <Trash2 className="size-4" aria-hidden />
                                  </Button>
                                </div>
                              </div>

                              <div className="grid gap-4 md:grid-cols-2">
                                {[
                                  { field: 'question', locale: 'en', long: false, labelKey: 'questionEn' },
                                  { field: 'question', locale: 'es', long: false, labelKey: 'questionEs' },
                                  { field: 'answer', locale: 'en', long: true, labelKey: 'answerEn' },
                                  { field: 'answer', locale: 'es', long: true, labelKey: 'answerEs' },
                                ].map((cfg) => {
                                  const id = faqInputId({
                                    kind: 'question',
                                    locale: cfg.locale,
                                    categoryId: category.id,
                                    index: qIndex,
                                    field: cfg.field,
                                  })
                                  const value = q[cfg.field]?.[cfg.locale] || ''
                                  const Control = cfg.long ? Textarea : Input
                                  return (
                                    <div key={`${cfg.field}-${cfg.locale}`} className="space-y-2">
                                      <Label className={labelClass} htmlFor={id}>
                                        {t(cfg.labelKey)}
                                      </Label>
                                      <Control
                                        id={id}
                                        rows={cfg.long ? 3 : undefined}
                                        value={value}
                                        onChange={(event) =>
                                          onQuestionFieldChange(
                                            category.id,
                                            qIndex,
                                            cfg.field,
                                            cfg.locale,
                                            event.target.value
                                          )
                                        }
                                        className={highlightRing(id)}
                                      />
                                    </div>
                                  )
                                })}
                              </div>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
