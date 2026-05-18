// Utilities to convert between the flat FAQ content stored in `PageContent`
// (categoryOrder + category{Id}Title + item{N}{Category,Question,Answer})
// and a structured shape consumed by the admin editor:
//
// {
//   categories: [
//     {
//       id: 'general',
//       title: { en, es },
//       questions: [{ question: { en, es }, answer: { en, es } }],
//     },
//   ],
// }

const TITLE_KEY_REGEX = /^category(.+)Title$/
const ITEM_KEY_REGEX = /^item(\d+)(Category|Question|Answer)$/

const titleKeyFor = (id) => `category${id.charAt(0).toUpperCase()}${id.slice(1)}Title`

const idFromTitleKey = (titleKey) => {
  const match = titleKey.match(TITLE_KEY_REGEX)
  if (!match) return ''
  return match[1].charAt(0).toLowerCase() + match[1].slice(1)
}

const cleanOrder = (raw) => {
  if (!raw) return []
  return String(raw)
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
}

export const isFaqStructuredKey = (key) => {
  if (key === 'categoryOrder') return true
  if (TITLE_KEY_REGEX.test(key)) return true
  if (ITEM_KEY_REGEX.test(key)) return true
  return false
}

const nextCategoryId = (existingIds) => {
  let n = 1
  while (existingIds.has(`cat${n}`)) n += 1
  return `cat${n}`
}

export const parseFaqStructure = (contentByLocale) => {
  const en = contentByLocale?.en || {}
  const es = contentByLocale?.es || {}

  const seen = new Set()
  const order = []
  const pushId = (id) => {
    if (!id || seen.has(id)) return
    seen.add(id)
    order.push(id)
  }

  cleanOrder(en.categoryOrder).forEach(pushId)
  cleanOrder(es.categoryOrder).forEach(pushId)

  Object.keys(en).forEach((key) => pushId(idFromTitleKey(key)))
  Object.keys(es).forEach((key) => pushId(idFromTitleKey(key)))

  const categories = order.map((id) => ({
    id,
    title: {
      en: en[titleKeyFor(id)] || '',
      es: es[titleKeyFor(id)] || '',
    },
    questions: [],
  }))

  const catIndex = new Map(categories.map((cat, i) => [cat.id, i]))

  const indices = new Set()
  const collect = (obj) => {
    Object.keys(obj).forEach((key) => {
      const match = key.match(ITEM_KEY_REGEX)
      if (match) indices.add(Number(match[1]))
    })
  }
  collect(en)
  collect(es)

  const sortedIndices = [...indices].sort((a, b) => a - b)
  const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key)

  sortedIndices.forEach((i) => {
    // A question "slot" exists for index `i` as long as any of its keys are
    // present on either locale. This keeps brand-new empty questions added
    // by the admin alive across re-parses; truly orphaned indices are
    // ignored.
    const slotExists =
      has(en, `item${i}Question`) ||
      has(en, `item${i}Answer`) ||
      has(en, `item${i}Category`) ||
      has(es, `item${i}Question`) ||
      has(es, `item${i}Answer`) ||
      has(es, `item${i}Category`)

    if (!slotExists) return

    const questionEn = en[`item${i}Question`] || ''
    const answerEn = en[`item${i}Answer`] || ''
    const questionEs = es[`item${i}Question`] || ''
    const answerEs = es[`item${i}Answer`] || ''

    const rawCat = en[`item${i}Category`] || es[`item${i}Category`] || (categories[0]?.id ?? '')

    let targetCat = rawCat
    if (!catIndex.has(targetCat)) {
      if (!targetCat) {
        targetCat = nextCategoryId(catIndex)
      }
      categories.push({
        id: targetCat,
        title: { en: '', es: '' },
        questions: [],
      })
      catIndex.set(targetCat, categories.length - 1)
    }

    categories[catIndex.get(targetCat)].questions.push({
      question: { en: questionEn, es: questionEs },
      answer: { en: answerEn, es: answerEs },
    })
  })

  return { categories }
}

const stripStructuredKeys = (obj) => {
  const out = {}
  Object.entries(obj).forEach(([key, value]) => {
    if (!isFaqStructuredKey(key)) {
      out[key] = value
    }
  })
  return out
}

export const composeFaqFlat = (structure, baseContentByLocale) => {
  const baseEn = baseContentByLocale?.en || {}
  const baseEs = baseContentByLocale?.es || {}

  const en = stripStructuredKeys(baseEn)
  const es = stripStructuredKeys(baseEs)

  const cats = structure?.categories || []
  const order = cats.map((cat) => cat.id).filter(Boolean)

  en.categoryOrder = order.join(',')
  es.categoryOrder = order.join(',')

  cats.forEach((cat) => {
    en[titleKeyFor(cat.id)] = cat.title?.en || ''
    es[titleKeyFor(cat.id)] = cat.title?.es || ''
  })

  let itemIndex = 0
  cats.forEach((cat) => {
    ;(cat.questions || []).forEach((q) => {
      itemIndex += 1
      en[`item${itemIndex}Category`] = cat.id
      en[`item${itemIndex}Question`] = q.question?.en || ''
      en[`item${itemIndex}Answer`] = q.answer?.en || ''
      es[`item${itemIndex}Category`] = cat.id
      es[`item${itemIndex}Question`] = q.question?.es || ''
      es[`item${itemIndex}Answer`] = q.answer?.es || ''
    })
  })

  return { en, es }
}

export const addCategory = (structure) => {
  const existingIds = new Set((structure?.categories || []).map((c) => c.id))
  const id = nextCategoryId(existingIds)
  return {
    ...structure,
    categories: [
      ...(structure?.categories || []),
      { id, title: { en: '', es: '' }, questions: [] },
    ],
  }
}

export const removeCategory = (structure, categoryId) => {
  return {
    ...structure,
    categories: (structure?.categories || []).filter((cat) => cat.id !== categoryId),
  }
}

export const moveCategory = (structure, categoryId, direction) => {
  const cats = [...(structure?.categories || [])]
  const idx = cats.findIndex((cat) => cat.id === categoryId)
  if (idx < 0) return structure
  const target = direction === 'up' ? idx - 1 : idx + 1
  if (target < 0 || target >= cats.length) return structure
  ;[cats[idx], cats[target]] = [cats[target], cats[idx]]
  return { ...structure, categories: cats }
}

export const updateCategoryTitle = (structure, categoryId, locale, value) => {
  return {
    ...structure,
    categories: (structure?.categories || []).map((cat) => {
      if (cat.id !== categoryId) return cat
      return {
        ...cat,
        title: { ...cat.title, [locale]: value },
      }
    }),
  }
}

export const addQuestion = (structure, categoryId) => {
  return {
    ...structure,
    categories: (structure?.categories || []).map((cat) => {
      if (cat.id !== categoryId) return cat
      return {
        ...cat,
        questions: [
          ...(cat.questions || []),
          { question: { en: '', es: '' }, answer: { en: '', es: '' } },
        ],
      }
    }),
  }
}

export const removeQuestion = (structure, categoryId, questionIndex) => {
  return {
    ...structure,
    categories: (structure?.categories || []).map((cat) => {
      if (cat.id !== categoryId) return cat
      return {
        ...cat,
        questions: (cat.questions || []).filter((_, i) => i !== questionIndex),
      }
    }),
  }
}

export const moveQuestion = (structure, categoryId, questionIndex, direction) => {
  return {
    ...structure,
    categories: (structure?.categories || []).map((cat) => {
      if (cat.id !== categoryId) return cat
      const questions = [...(cat.questions || [])]
      const target = direction === 'up' ? questionIndex - 1 : questionIndex + 1
      if (target < 0 || target >= questions.length) return cat
      ;[questions[questionIndex], questions[target]] = [questions[target], questions[questionIndex]]
      return { ...cat, questions }
    }),
  }
}

export const updateQuestionField = (structure, categoryId, questionIndex, field, locale, value) => {
  return {
    ...structure,
    categories: (structure?.categories || []).map((cat) => {
      if (cat.id !== categoryId) return cat
      return {
        ...cat,
        questions: (cat.questions || []).map((q, i) => {
          if (i !== questionIndex) return q
          return {
            ...q,
            [field]: { ...q[field], [locale]: value },
          }
        }),
      }
    }),
  }
}
