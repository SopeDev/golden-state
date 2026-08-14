/**
 * Property executive summary is bilingual: summaryEn / summaryEs.
 * Legacy `summary` string is treated as English when present.
 */

export function normalizePropertySummary(value, legacySummary = '') {
  if (typeof value === 'string') {
    const text = value.trim()
    const legacy = String(legacySummary || '').trim()
    return {
      en: text || legacy,
      es: text || legacy,
    }
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    const legacy = String(legacySummary || '').trim()
    return { en: legacy, es: legacy }
  }

  const en = value.en == null ? '' : String(value.en)
  const es = value.es == null ? '' : String(value.es)
  const legacy = String(legacySummary || '').trim()

  return {
    en: en.trim() || legacy,
    es: es.trim() || legacy,
  }
}

export function getLocalizedPropertySummary(propertyOrSummary, locale = 'en') {
  if (
    propertyOrSummary &&
    typeof propertyOrSummary === 'object' &&
    ('summaryEn' in propertyOrSummary ||
      'summaryEs' in propertyOrSummary ||
      'summary' in propertyOrSummary)
  ) {
    const normalized = normalizePropertySummary(
      {
        en: propertyOrSummary.summaryEn,
        es: propertyOrSummary.summaryEs,
      },
      propertyOrSummary.summary
    )
    return String(normalized[locale] || normalized.en || normalized.es || '').trim()
  }

  return String(
    normalizePropertySummary(propertyOrSummary)[locale] ||
      normalizePropertySummary(propertyOrSummary).en ||
      ''
  ).trim()
}

export function isPropertySummaryComplete(summary) {
  const normalized = normalizePropertySummary(summary)
  return Boolean(normalized.en.trim() && normalized.es.trim())
}

export function toSummaryFields(summary) {
  const normalized = normalizePropertySummary(summary)
  return {
    summaryEn: normalized.en.trim(),
    summaryEs: normalized.es.trim(),
    // Keep legacy summary in sync with English for older readers.
    summary: normalized.en.trim(),
  }
}
