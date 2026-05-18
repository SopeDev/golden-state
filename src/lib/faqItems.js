const DEFAULT_CATEGORY_ORDER = ['general', 'investing', 'legal', 'taxes', 'accreditation', 'support']
const TITLE_KEY_REGEX = /^category(.+)Title$/
const ITEM_KEY_REGEX = /^item(\d+)(Category|Question|Answer)$/

const cleanId = (value) => {
  if (!value) return ''
  return String(value).trim()
}

/**
 * Build grouped FAQ sections from flat CMS keys.
 *
 * Expected keys:
 * - categoryOrder: comma-separated list of category ids (e.g. "general,investing,cat1")
 * - category{Id}Title with first letter of the id capitalized (e.g. categoryGeneralTitle, categoryCat1Title)
 * - item{N}Category, item{N}Question, item{N}Answer (N >= 1)
 */
export function buildFaqSectionsFromContent(content) {
  if (!content || typeof content !== 'object') return []

  const requestedOrder = String(content.categoryOrder || '')
    .split(',')
    .map(cleanId)
    .filter(Boolean)

  const categoryOrder = requestedOrder.length > 0 ? requestedOrder : DEFAULT_CATEGORY_ORDER

  // Build a case-insensitive lookup of titles by id, so reorderings/casing
  // mismatches between `categoryOrder` and the `category{Id}Title` keys don't
  // drop categories from the output.
  const titleByLowerId = new Map()
  Object.keys(content).forEach((key) => {
    const match = key.match(TITLE_KEY_REGEX)
    if (!match) return
    const id = match[1].charAt(0).toLowerCase() + match[1].slice(1)
    titleByLowerId.set(id.toLowerCase(), content[key])
  })

  const grouped = new Map()
  categoryOrder.forEach((id) => grouped.set(id, []))

  const indices = new Set()
  Object.keys(content).forEach((key) => {
    const match = key.match(ITEM_KEY_REGEX)
    if (match) indices.add(Number(match[1]))
  })

  ;[...indices]
    .sort((a, b) => a - b)
    .forEach((i) => {
      const question = content[`item${i}Question`]
      const answer = content[`item${i}Answer`]
      if (!question || !answer) return

      const category = cleanId(content[`item${i}Category`]) || categoryOrder[0]
      if (!grouped.has(category)) grouped.set(category, [])
      grouped.get(category).push({
        question: String(question),
        answer: String(answer),
      })
    })

  return [...grouped.entries()]
    .map(([id, items]) => {
      const title = titleByLowerId.get(String(id).toLowerCase())
      return {
        id,
        title: String(title || id),
        items,
      }
    })
    .filter((section) => section.items.length > 0)
}
