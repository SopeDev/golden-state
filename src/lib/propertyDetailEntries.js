/**
 * Ordered propertyFacts / investmentDetails helpers.
 * Entries may include sortOrder (number). Missing values keep insertion order last.
 */

export function getOrderedPropertyEntries(bag) {
  if (!bag || typeof bag !== 'object' || Array.isArray(bag)) return []

  return Object.entries(bag)
    .map(([key, value], index) => {
      const sortOrder =
        value && typeof value === 'object' && !Array.isArray(value) && Number.isFinite(value.sortOrder)
          ? Number(value.sortOrder)
          : index
      return { key, value, sortOrder, index }
    })
    .sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder
      return a.index - b.index
    })
    .map(({ key, value }) => [key, value])
}
