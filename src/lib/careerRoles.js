import { isCareersStructuredKey } from '@/lib/careersEditor'

export const GENERAL_INTEREST_VALUE = 'general'

const ROLE_FIELD_REGEX = /^role([A-Z][A-Za-z0-9]*)(Title|Location|Type|Summary|Body)$/

const fieldKeyFor = (id, field) => {
  const suffix = field.charAt(0).toUpperCase() + field.slice(1)
  return `role${id.charAt(0).toUpperCase()}${id.slice(1)}${suffix}`
}

const parseRoleKey = (key) => {
  const match = key.match(ROLE_FIELD_REGEX)
  if (!match) return null
  return match[1].charAt(0).toLowerCase() + match[1].slice(1)
}

/**
 * Public listing from a single-locale flat CMS record.
 * Roles without a title are omitted.
 */
export function buildRolesFromContent(content) {
  if (!content || typeof content !== 'object') return []

  const seen = new Set()
  const order = []
  const pushId = (id) => {
    if (!id || seen.has(id)) return
    seen.add(id)
    order.push(id)
  }

  String(content.roleOrder || '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .forEach(pushId)

  Object.keys(content).forEach((key) => {
    const id = parseRoleKey(key)
    if (id) pushId(id)
  })

  return order
    .map((id) => {
      const title = String(content[fieldKeyFor(id, 'title')] || '').trim()
      if (!title) return null
      return {
        id,
        title,
        location: String(content[fieldKeyFor(id, 'location')] || '').trim(),
        type: String(content[fieldKeyFor(id, 'type')] || '').trim(),
        summary: String(content[fieldKeyFor(id, 'summary')] || '').trim(),
        body: String(content[fieldKeyFor(id, 'body')] || '').trim(),
      }
    })
    .filter(Boolean)
}

export function stripCareersStructuredKeys(obj) {
  if (!obj) return {}
  const out = {}
  Object.entries(obj).forEach(([key, value]) => {
    if (!isCareersStructuredKey(key)) out[key] = value
  })
  return out
}
