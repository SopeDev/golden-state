'use client'

import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

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
  const highlightRing = (id) =>
    highlightedFieldId === id ? 'ring-2 ring-main-gold ring-offset-1' : ''
  const categories = structure?.categories || []

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-heading text-lg font-semibold text-primary">Categories &amp; questions</h3>
          <p className="text-sm text-muted-foreground">
            Add or remove categories and questions. Each entry supports English and Spanish.
          </p>
        </div>
        <Button type="button" size="sm" onClick={onAddCategory} className="gap-1.5">
          <Plus className="size-4" aria-hidden />
          Add category
        </Button>
      </div>

      {categories.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-sm text-muted-foreground">
            No categories yet. Click <span className="font-medium">Add category</span> to create the first one.
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
                      aria-label="Move category up"
                    >
                      <ChevronUp className="size-4" aria-hidden />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      disabled={isLast}
                      onClick={() => onMoveCategory(category.id, 'down')}
                      aria-label="Move category down"
                    >
                      <ChevronDown className="size-4" aria-hidden />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => {
                        if (window.confirm(`Remove category "${previewLabel}" and all of its questions?`)) {
                          onRemoveCategory(category.id)
                        }
                      }}
                    >
                      <Trash2 className="size-4" aria-hidden />
                      Remove
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
                            Category title ({loc === 'en' ? 'English' : 'Spanish'})
                          </Label>
                          <Input
                            id={id}
                            value={(loc === 'en' ? category.title?.en : category.title?.es) || ''}
                            onChange={(event) => onCategoryTitleChange(category.id, loc, event.target.value)}
                            placeholder={loc === 'en' ? 'e.g. Investing' : 'p. ej. Inversión'}
                            className={highlightRing(id)}
                          />
                        </div>
                      )
                    })}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-primary">
                        Questions ({category.questions?.length || 0})
                      </p>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="gap-1.5 border-main-gold/50 text-main-gold hover:bg-main-gold/10"
                        onClick={() => onAddQuestion(category.id)}
                      >
                        <Plus className="size-4" aria-hidden />
                        Add question
                      </Button>
                    </div>

                    {(category.questions || []).length === 0 ? (
                      <div className="rounded-md border border-dashed border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                        No questions in this category yet.
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
                                  Question {qIndex + 1}
                                </p>
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="outline"
                                    disabled={isFirstQ}
                                    onClick={() => onMoveQuestion(category.id, qIndex, 'up')}
                                    aria-label="Move question up"
                                  >
                                    <ChevronUp className="size-4" aria-hidden />
                                  </Button>
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="outline"
                                    disabled={isLastQ}
                                    onClick={() => onMoveQuestion(category.id, qIndex, 'down')}
                                    aria-label="Move question down"
                                  >
                                    <ChevronDown className="size-4" aria-hidden />
                                  </Button>
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="outline"
                                    className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                    aria-label="Remove question"
                                    onClick={() => {
                                      if (
                                        window.confirm(
                                          `Remove question ${qIndex + 1} from "${previewLabel}"?`
                                        )
                                      ) {
                                        onRemoveQuestion(category.id, qIndex)
                                      }
                                    }}
                                  >
                                    <Trash2 className="size-4" aria-hidden />
                                  </Button>
                                </div>
                              </div>

                              <div className="grid gap-4 md:grid-cols-2">
                                {[
                                  { field: 'question', locale: 'en', long: false, labelText: 'Question (English)' },
                                  { field: 'question', locale: 'es', long: false, labelText: 'Question (Spanish)' },
                                  { field: 'answer', locale: 'en', long: true, labelText: 'Answer (English)' },
                                  { field: 'answer', locale: 'es', long: true, labelText: 'Answer (Spanish)' },
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
                                        {cfg.labelText}
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
