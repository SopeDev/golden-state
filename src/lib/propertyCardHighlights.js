/**
 * Featured propertyFacts / investmentDetails rows marked showOnCard.
 */

import { getOrderedPropertyEntries } from '@/lib/propertyDetailEntries'

export function getPropertyCardHighlights(property, locale = 'en') {
  const items = []

  const collect = (bag, source) => {
    for (const [key, entry] of getOrderedPropertyEntries(bag)) {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) continue
      if (!entry.showOnCard) continue

      const localized = entry[locale] || entry.en || entry.es || {}
      const label = localized.label || key
      const value = localized.value
      if (value == null || String(value).trim() === '') continue

      items.push({
        key: `${source}-${key}`,
        label: String(label).trim() || key,
        value: String(value).trim(),
      })
    }
  }

  collect(property?.propertyFacts, 'fact')
  collect(property?.investmentDetails, 'detail')
  return items
}
