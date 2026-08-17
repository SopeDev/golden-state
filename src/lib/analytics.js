const GA_ID_PATTERN = /^G-[A-Z0-9]+$/

export const getGaMeasurementId = () => {
  const id = String(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '').trim()
  if (!GA_ID_PATTERN.test(id)) return ''
  return id
}
