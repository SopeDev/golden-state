const GA_ID_PATTERN = /^G-[A-Z0-9]+$/

export const getGaMeasurementId = () => {
  const id = String(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '').trim()
  if (!GA_ID_PATTERN.test(id)) return ''
  return id
}

export const trackGaEvent = (eventName, parameters = {}) => {
  if (typeof window === 'undefined' || !eventName) return

  window.dataLayer = window.dataLayer || []
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments)
  }
  window.gtag('event', eventName, parameters)
}

export const toGaPropertyItem = (property, extras = {}) => ({
  item_id: String(property?.investmentId ?? property?.id ?? ''),
  item_name: property?.name || 'Property',
  item_category:
    property?.type?.slug || property?.type?.code || property?.type || 'property',
  ...extras,
})
