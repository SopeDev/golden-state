'use client'

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  formatFormattedInteger,
  looksLikeIntegerString,
  parseFormattedInteger,
} from '@/lib/admin/numberFormat'
import { cn } from '@/lib/utils'

function KeyValueLocaleInput({ value, onChange, formatAsInteger = false, required = false }) {
  const displayValue =
    formatAsInteger && looksLikeIntegerString(value)
      ? formatFormattedInteger(value)
      : value

  const handleChange = (event) => {
    const nextValue =
      formatAsInteger && looksLikeIntegerString(event.target.value)
        ? parseFormattedInteger(event.target.value)
        : event.target.value
    onChange(nextValue)
  }

  return <Input value={displayValue} onChange={handleChange} required={required} />
}

function SortableKeyValueRow({ row, onChange, onRemove }) {
  const te = useTranslations('Admin.properties.editor')
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: row.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'rounded-lg border border-border/70 bg-background p-4',
        isDragging && 'z-10 shadow-lg ring-1 ring-main-gold/40'
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <button
          type="button"
          className="inline-flex cursor-grab items-center gap-1.5 rounded-md border border-border/70 bg-muted/40 px-2 py-1.5 text-xs text-muted-foreground active:cursor-grabbing"
          aria-label={te('dragToReorder')}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" aria-hidden />
          {te('dragToReorder')}
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2 md:gap-8">
        <div className="space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            English
          </p>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-muted-foreground">{te('labelEn')}</Label>
              <Input
                value={row.labelEn}
                onChange={(event) => onChange('labelEn', event.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-muted-foreground">{te('valueEn')}</Label>
              <KeyValueLocaleInput
                value={row.valueEn}
                formatAsInteger
                required
                onChange={(value) => onChange('valueEn', value)}
              />
            </div>
          </div>
        </div>
        <div className="space-y-3 md:border-l md:border-border/60 md:pl-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Español
          </p>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-muted-foreground">{te('labelEs')}</Label>
              <Input
                value={row.labelEs}
                onChange={(event) => onChange('labelEs', event.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-muted-foreground">{te('valueEs')}</Label>
              <KeyValueLocaleInput
                value={row.valueEs}
                formatAsInteger
                required
                onChange={(value) => onChange('valueEs', value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={Boolean(row.showOnCard)}
            onChange={(event) => onChange('showOnCard', event.target.checked)}
            className="size-4 rounded border-border accent-main-gold"
          />
          <span>{te('showOnCard')}</span>
        </label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={onRemove}
        >
          <Trash2 className="size-4" aria-hidden />
          {te('removeRow')}
        </Button>
      </div>
    </div>
  )
}

export default function SortableKeyValueList({ rows, onChangeRow, onRemoveRow, onReorder }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = rows.findIndex((row) => row.id === active.id)
    const newIndex = rows.findIndex((row) => row.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    onReorder(arrayMove(rows, oldIndex, newIndex))
  }

  if (!rows.length) return null

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={rows.map((row) => row.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {rows.map((row) => (
            <SortableKeyValueRow
              key={row.id}
              row={row}
              onChange={(field, value) => onChangeRow(row.id, field, value)}
              onRemove={() => onRemoveRow(row.id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
