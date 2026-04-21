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
