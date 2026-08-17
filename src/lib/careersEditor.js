// Flat PageContent keys for Work with us roles:
// - roleOrder: comma-separated ids (e.g. "irAssociate,analyst")
// - role{Id}Title|Location|Type|Summary|Body
//   id "irAssociate" → roleIrAssociateTitle

const ROLE_FIELD_REGEX = /^role([A-Z][A-Za-z0-9]*)(Title|Location|Type|Summary|Body)$/

export const CAREERS_ROLE_FIELDS = ['title', 'location', 'type', 'summary', 'body']

export const isCareersStructuredKey = (key) => {
  if (key === 'roleOrder') return true
  return ROLE_FIELD_REGEX.test(key)
}

const fieldKeyFor = (id, field) => {
  const suffix = field.charAt(0).toUpperCase() + field.slice(1)
  return `role${id.charAt(0).toUpperCase()}${id.slice(1)}${suffix}`
}

const parseRoleKey = (key) => {
  const match = key.match(ROLE_FIELD_REGEX)
  if (!match) return null
  const id = match[1].charAt(0).toLowerCase() + match[1].slice(1)
  const field = match[2].charAt(0).toLowerCase() + match[2].slice(1)
  return { id, field }
}

const cleanOrder = (raw) => {
  if (!raw) return []
  return String(raw)
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
}

const nextRoleId = (existingIds) => {
  let n = 1
  while (existingIds.has(`role${n}`)) n += 1
  return `role${n}`
}

const emptyLocalized = () => ({ en: '', es: '' })

const emptyRole = (id) => ({
  id,
  title: emptyLocalized(),
  location: emptyLocalized(),
  type: emptyLocalized(),
  summary: emptyLocalized(),
  body: emptyLocalized(),
})

export const parseCareersRoles = (contentByLocale) => {
  const en = contentByLocale?.en || {}
  const es = contentByLocale?.es || {}

  const seen = new Set()
  const order = []
  const pushId = (id) => {
    if (!id || seen.has(id)) return
    seen.add(id)
    order.push(id)
  }

  cleanOrder(en.roleOrder).forEach(pushId)
  cleanOrder(es.roleOrder).forEach(pushId)

  const collectIds = (obj) => {
    Object.keys(obj).forEach((key) => {
      const parsed = parseRoleKey(key)
      if (parsed) pushId(parsed.id)
    })
  }
  collectIds(en)
  collectIds(es)

  const roles = order.map((id) => {
    const role = emptyRole(id)
    CAREERS_ROLE_FIELDS.forEach((field) => {
      const key = fieldKeyFor(id, field)
      role[field] = {
        en: en[key] || '',
        es: es[key] || '',
      }
    })
    return role
  })

  return { roles }
}

const stripStructuredKeys = (obj) => {
  const out = {}
  Object.entries(obj || {}).forEach(([key, value]) => {
    if (!isCareersStructuredKey(key)) out[key] = value
  })
  return out
}

export const composeCareersFlat = (structure, baseContentByLocale) => {
  const en = stripStructuredKeys(baseContentByLocale?.en)
  const es = stripStructuredKeys(baseContentByLocale?.es)
  const roles = structure?.roles || []
  const order = roles.map((role) => role.id).filter(Boolean)

  en.roleOrder = order.join(',')
  es.roleOrder = order.join(',')

  roles.forEach((role) => {
    CAREERS_ROLE_FIELDS.forEach((field) => {
      const key = fieldKeyFor(role.id, field)
      en[key] = role[field]?.en || ''
      es[key] = role[field]?.es || ''
    })
  })

  return { en, es }
}

export const addRole = (structure) => {
  const existingIds = new Set((structure?.roles || []).map((role) => role.id))
  const id = nextRoleId(existingIds)
  return {
    ...structure,
    roles: [...(structure?.roles || []), emptyRole(id)],
  }
}

export const removeRole = (structure, roleId) => ({
  ...structure,
  roles: (structure?.roles || []).filter((role) => role.id !== roleId),
})

export const moveRole = (structure, roleId, direction) => {
  const roles = [...(structure?.roles || [])]
  const idx = roles.findIndex((role) => role.id === roleId)
  if (idx < 0) return structure
  const target = direction === 'up' ? idx - 1 : idx + 1
  if (target < 0 || target >= roles.length) return structure
  ;[roles[idx], roles[target]] = [roles[target], roles[idx]]
  return { ...structure, roles }
}

export const updateRoleField = (structure, roleId, field, locale, value) => ({
  ...structure,
  roles: (structure?.roles || []).map((role) => {
    if (role.id !== roleId) return role
    return {
      ...role,
      [field]: { ...role[field], [locale]: value },
    }
  }),
})

export const roleInputId = ({ roleId, field, locale }) =>
  `careers-role-${roleId}-${field}-${locale}`
