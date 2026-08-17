import { PrismaClient } from '@prisma/client'
import enMessages from '../../messages/en.json'
import esMessages from '../../messages/es.json'

const prisma = new PrismaClient()

const ABOUT_FALLBACK = {
  en: enMessages.About,
  es: esMessages.About,
}

const normalizeLocale = (locale) => {
  if (!locale) return 'en'
  return locale.toLowerCase().split('-')[0]
}

export const getAboutContent = async (locale) => {
  const normalizedLocale = normalizeLocale(locale)
  const fallback = ABOUT_FALLBACK[normalizedLocale] || ABOUT_FALLBACK.en

  try {
    const record = await prisma.pageContent.findUnique({
      where: {
        pageKey_locale: {
          pageKey: 'ABOUT',
          locale: normalizedLocale,
        },
      },
    })

    if (!record?.content || typeof record.content !== 'object' || Array.isArray(record.content)) {
      return fallback
    }

    return {
      ...fallback,
      ...record.content,
    }
  } catch (error) {
    console.error('Error loading About content:', error)
    return fallback
  } finally {
    await prisma.$disconnect()
  }
}

export const getAboutFallbackByLocale = () => ABOUT_FALLBACK

const FAQ_FALLBACK = {
  en: enMessages.FAQ || {},
  es: esMessages.FAQ || {},
}

export const getFaqFallbackByLocale = () => FAQ_FALLBACK

const FAQ_STRUCTURED_KEY_REGEX = /^(?:categoryOrder|category.+Title|item\d+(?:Category|Question|Answer))$/

const HOME_FALLBACK = {
  en: enMessages.Home || {},
  es: esMessages.Home || {},
}

export const getHomeFallbackByLocale = () => HOME_FALLBACK

export const getHomeContent = async (locale) => {
  const normalizedLocale = normalizeLocale(locale)
  const fallback = HOME_FALLBACK[normalizedLocale] || HOME_FALLBACK.en

  try {
    const record = await prisma.pageContent.findUnique({
      where: {
        pageKey_locale: {
          pageKey: 'HOME',
          locale: normalizedLocale,
        },
      },
    })

    if (!record?.content || typeof record.content !== 'object' || Array.isArray(record.content)) {
      return fallback
    }

    return {
      ...fallback,
      ...record.content,
    }
  } catch (error) {
    console.error('Error loading Home content:', error)
    return fallback
  } finally {
    await prisma.$disconnect()
  }
}

const CONTACT_FALLBACK = {
  en: enMessages.Contact || {},
  es: esMessages.Contact || {},
}

export const getContactFallbackByLocale = () => CONTACT_FALLBACK

export const getContactContent = async (locale) => {
  const normalizedLocale = normalizeLocale(locale)
  const fallback = CONTACT_FALLBACK[normalizedLocale] || CONTACT_FALLBACK.en

  try {
    const record = await prisma.pageContent.findUnique({
      where: {
        pageKey_locale: {
          pageKey: 'CONTACT',
          locale: normalizedLocale,
        },
      },
    })

    if (!record?.content || typeof record.content !== 'object' || Array.isArray(record.content)) {
      return fallback
    }

    return {
      ...fallback,
      ...record.content,
    }
  } catch (error) {
    console.error('Error loading Contact content:', error)
    return fallback
  } finally {
    await prisma.$disconnect()
  }
}

const WORK_WITH_US_FALLBACK = {
  en: enMessages.WorkWithUs || {},
  es: esMessages.WorkWithUs || {},
}

const CAREERS_STRUCTURED_KEY_REGEX =
  /^(?:roleOrder|role[A-Z][A-Za-z0-9]*(?:Title|Location|Type|Summary|Body))$/

export const getWorkWithUsFallbackByLocale = () => WORK_WITH_US_FALLBACK

export const getWorkWithUsContent = async (locale) => {
  const normalizedLocale = normalizeLocale(locale)
  const fallback = WORK_WITH_US_FALLBACK[normalizedLocale] || WORK_WITH_US_FALLBACK.en

  try {
    const record = await prisma.pageContent.findUnique({
      where: {
        pageKey_locale: {
          pageKey: 'WORK_WITH_US',
          locale: normalizedLocale,
        },
      },
    })

    if (!record?.content || typeof record.content !== 'object' || Array.isArray(record.content)) {
      return fallback
    }

    const savedHasOrder = typeof record.content.roleOrder === 'string'

    if (savedHasOrder) {
      const fallbackStatic = {}
      Object.entries(fallback).forEach(([key, value]) => {
        if (!CAREERS_STRUCTURED_KEY_REGEX.test(key)) {
          fallbackStatic[key] = value
        }
      })
      return {
        ...fallbackStatic,
        ...record.content,
      }
    }

    return {
      ...fallback,
      ...record.content,
    }
  } catch (error) {
    console.error('Error loading Work with us content:', error)
    return fallback
  } finally {
    await prisma.$disconnect()
  }
}

export const getFaqContent = async (locale) => {
  const normalizedLocale = normalizeLocale(locale)
  const fallback = FAQ_FALLBACK[normalizedLocale] || FAQ_FALLBACK.en

  try {
    const record = await prisma.pageContent.findUnique({
      where: {
        pageKey_locale: {
          pageKey: 'FAQ',
          locale: normalizedLocale,
        },
      },
    })

    if (!record?.content || typeof record.content !== 'object' || Array.isArray(record.content)) {
      return fallback
    }

    // When the admin has saved FAQ content with an explicit categoryOrder,
    // treat the saved record as authoritative for categories and items
    // (otherwise deleted categories/questions would leak back from the
    // bundled JSON fallback). Static fields still fall back to the JSON
    // bundle for missing values.
    const savedHasOrder = typeof record.content.categoryOrder === 'string'

    if (savedHasOrder) {
      const fallbackStatic = {}
      Object.entries(fallback).forEach(([key, value]) => {
        if (!FAQ_STRUCTURED_KEY_REGEX.test(key)) {
          fallbackStatic[key] = value
        }
      })
      return {
        ...fallbackStatic,
        ...record.content,
      }
    }

    return {
      ...fallback,
      ...record.content,
    }
  } catch (error) {
    console.error('Error loading FAQ content:', error)
    return fallback
  } finally {
    await prisma.$disconnect()
  }
}
