'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import PropertyImageLightbox from '@/components/invest/PropertyImageLightbox'

export default function PropertyImageGallery({ images = [], propertyName = '' }) {
  const t = useTranslations('PropertyDetails')
  const [activeIndex, setActiveIndex] = useState(null)
  const list = Array.isArray(images) ? images.filter(Boolean) : []

  if (!list.length) return null

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {list.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={cn(
              'group h-64 cursor-pointer overflow-hidden rounded-xl border border-border/80 bg-muted text-left',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-main-gold/60'
            )}
            aria-label={t('viewImage', { index: index + 1 })}
          >
            <img
              src={image}
              alt={`${propertyName} - ${index + 1}`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </button>
        ))}
      </div>

      {activeIndex != null ? (
        <PropertyImageLightbox
          images={list}
          index={activeIndex}
          altPrefix={propertyName || t('propertyImage')}
          closeLabel={t('closeImage')}
          previousLabel={t('previousImage')}
          nextLabel={t('nextImage')}
          zoomInLabel={t('zoomIn')}
          zoomOutLabel={t('zoomOut')}
          resetZoomLabel={t('resetZoom')}
          onClose={() => setActiveIndex(null)}
          onIndexChange={setActiveIndex}
        />
      ) : null}
    </>
  )
}
