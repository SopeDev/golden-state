'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Minus, Plus, RotateCcw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const MIN_ZOOM = 1
const MAX_ZOOM = 4
const ZOOM_STEP = 0.5

export default function PropertyImageLightbox({
  images = [],
  index = 0,
  altPrefix = 'Property image',
  closeLabel = 'Close',
  previousLabel = 'Previous image',
  nextLabel = 'Next image',
  zoomInLabel = 'Zoom in',
  zoomOutLabel = 'Zoom out',
  resetZoomLabel = 'Reset zoom',
  onClose,
  onIndexChange,
}) {
  const total = images.length
  const current = images[index]
  const hasMultiple = total > 1
  const [zoom, setZoom] = useState(MIN_ZOOM)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const dragRef = useRef(null)
  const stageRef = useRef(null)

  useEffect(() => {
    setZoom(MIN_ZOOM)
    setOffset({ x: 0, y: 0 })
  }, [index, current])

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return undefined

    const onWheel = (event) => {
      event.preventDefault()
      if (event.deltaY < 0) {
        setZoom((value) => Math.min(MAX_ZOOM, value + ZOOM_STEP))
      } else {
        setZoom((value) => {
          const next = Math.max(MIN_ZOOM, value - ZOOM_STEP)
          if (next === MIN_ZOOM) setOffset({ x: 0, y: 0 })
          return next
        })
      }
    }

    stage.addEventListener('wheel', onWheel, { passive: false })
    return () => stage.removeEventListener('wheel', onWheel)
  }, [current])

  useEffect(() => {
    if (!current) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.()
        return
      }
      if (event.key === '+' || event.key === '=') {
        event.preventDefault()
        setZoom((value) => Math.min(MAX_ZOOM, value + ZOOM_STEP))
        return
      }
      if (event.key === '-') {
        event.preventDefault()
        setZoom((value) => {
          const next = Math.max(MIN_ZOOM, value - ZOOM_STEP)
          if (next === MIN_ZOOM) setOffset({ x: 0, y: 0 })
          return next
        })
        return
      }
      if (event.key === '0') {
        setZoom(MIN_ZOOM)
        setOffset({ x: 0, y: 0 })
        return
      }
      if (!hasMultiple) return
      if (event.key === 'ArrowLeft') {
        onIndexChange?.((index - 1 + total) % total)
      }
      if (event.key === 'ArrowRight') {
        onIndexChange?.((index + 1) % total)
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [current, hasMultiple, index, onClose, onIndexChange, total])

  if (!current) return null

  const goPrev = () => {
    if (!hasMultiple) return
    onIndexChange?.((index - 1 + total) % total)
  }

  const goNext = () => {
    if (!hasMultiple) return
    onIndexChange?.((index + 1) % total)
  }

  const zoomIn = () => setZoom((value) => Math.min(MAX_ZOOM, value + ZOOM_STEP))
  const zoomOut = () => {
    setZoom((value) => {
      const next = Math.max(MIN_ZOOM, value - ZOOM_STEP)
      if (next === MIN_ZOOM) setOffset({ x: 0, y: 0 })
      return next
    })
  }
  const resetZoom = () => {
    setZoom(MIN_ZOOM)
    setOffset({ x: 0, y: 0 })
  }

  const handlePointerDown = (event) => {
    if (zoom <= MIN_ZOOM) return
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: offset.x,
      originY: offset.y,
    }
  }

  const handlePointerMove = (event) => {
    if (!dragRef.current || zoom <= MIN_ZOOM) return
    const dx = event.clientX - dragRef.current.startX
    const dy = event.clientY - dragRef.current.startY
    setOffset({
      x: dragRef.current.originX + dx,
      y: dragRef.current.originY + dy,
    })
  }

  const handlePointerUp = (event) => {
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    dragRef.current = null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={altPrefix}
    >
      <button
        type="button"
        className="absolute inset-0 bg-muted/95"
        onClick={onClose}
        aria-label={closeLabel}
      />

      <div className="relative z-10 flex w-full max-w-5xl items-center gap-2 sm:gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={!hasMultiple}
          className={cn(
            'shrink-0 border-border/80 bg-background shadow-md',
            !hasMultiple && 'invisible'
          )}
          onClick={goPrev}
          aria-label={previousLabel}
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </Button>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-border/80 bg-background shadow-2xl">
          <div className="flex items-center justify-between gap-4 border-b border-border/80 px-4 py-3 sm:px-5">
            <p className="text-sm text-muted-foreground">
              {index + 1} / {total}
            </p>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={zoomOut}
                disabled={zoom <= MIN_ZOOM}
                aria-label={zoomOutLabel}
              >
                <Minus className="h-4 w-4" aria-hidden="true" />
              </Button>
              <span className="min-w-12 text-center text-xs tabular-nums text-muted-foreground">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={zoomIn}
                disabled={zoom >= MAX_ZOOM}
                aria-label={zoomInLabel}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={resetZoom}
                disabled={zoom <= MIN_ZOOM}
                aria-label={resetZoomLabel}
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button type="button" variant="ghost" size="icon-sm" onClick={onClose} aria-label={closeLabel}>
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>

          <div
            ref={stageRef}
            className={cn(
              'flex flex-1 items-center justify-center overflow-hidden bg-muted/30 p-4 sm:p-6',
              zoom > MIN_ZOOM ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'
            )}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onDoubleClick={() => {
              if (zoom > MIN_ZOOM) resetZoom()
              else zoomIn()
            }}
          >
            <img
              src={current}
              alt={`${altPrefix} ${index + 1}`}
              draggable={false}
              className="max-h-[72vh] w-auto max-w-full rounded-md object-contain select-none"
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                transformOrigin: 'center center',
                transition: dragRef.current ? 'none' : 'transform 120ms ease-out',
              }}
            />
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={!hasMultiple}
          className={cn(
            'shrink-0 border-border/80 bg-background shadow-md',
            !hasMultiple && 'invisible'
          )}
          onClick={goNext}
          aria-label={nextLabel}
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}
