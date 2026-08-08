/**
 * Public WhatsApp contact links for post-accreditation invest meetings.
 * Bank / wire details must never appear here or in emails.
 */

import { formatMoneyAmount } from '@/lib/formatMoney'

/** Active meeting request channels (all open WhatsApp with a modality). */
export const MEETING_CHANNELS = ['VIDEO_CALL', 'PHONE_CALL', 'IN_PERSON']

export function getInvestWhatsappPhone() {
  // Digits only, country code included (e.g. 15205551234)
  return (process.env.NEXT_PUBLIC_INVEST_WHATSAPP_PHONE || '').replace(/\D/g, '')
}

const MODE_COPY = {
  VIDEO_CALL: {
    en: 'a video call',
    es: 'una videollamada',
  },
  PHONE_CALL: {
    en: 'a phone call',
    es: 'una llamada telefónica',
  },
  IN_PERSON: {
    en: 'an in-person meeting',
    es: 'una reunión en persona',
  },
}

export function buildWhatsappInvestUrl({
  propertyName,
  investmentId,
  intendedAmount,
  locale,
  channel = 'VIDEO_CALL',
}) {
  const phone = getInvestWhatsappPhone()
  if (!phone) return ''

  const mode = MODE_COPY[channel] || MODE_COPY.VIDEO_CALL
  const modePhrase = locale === 'es' ? mode.es : mode.en

  const amountPart =
    intendedAmount && Number(intendedAmount) > 0
      ? locale === 'es'
        ? ` Monto estimado: $${formatMoneyAmount(intendedAmount)}.`
        : ` Intended amount: $${formatMoneyAmount(intendedAmount)}.`
      : ''

  const text =
    locale === 'es'
      ? `Hola, soy inversionista acreditado y quiero invertir en ${propertyName} (#${investmentId}).${amountPart} Me gustaría agendar ${modePhrase}.`
      : `Hi, I'm an accredited investor and want to invest in ${propertyName} (#${investmentId}).${amountPart} I'd like to schedule ${modePhrase}.`

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
}

export function getInvestMeetingLinks(context = {}) {
  const phoneConfigured = Boolean(getInvestWhatsappPhone())
  return {
    whatsappConfigured: phoneConfigured,
    videoCallUrl: phoneConfigured
      ? buildWhatsappInvestUrl({ ...context, channel: 'VIDEO_CALL' })
      : '',
    phoneCallUrl: phoneConfigured
      ? buildWhatsappInvestUrl({ ...context, channel: 'PHONE_CALL' })
      : '',
    inPersonUrl: phoneConfigured
      ? buildWhatsappInvestUrl({ ...context, channel: 'IN_PERSON' })
      : '',
  }
}

/** i18n key under Invest / Admin.Investments for a stored channel value */
export function meetingChannelLabelKey(channel) {
  switch (channel) {
    case 'VIDEO_CALL':
      return 'channelVideoCall'
    case 'PHONE_CALL':
      return 'channelPhoneCall'
    case 'IN_PERSON':
      return 'channelInPerson'
    case 'CALENDLY':
      return 'channelCalendly'
    case 'WHATSAPP':
      return 'channelWhatsapp'
    default:
      return null
  }
}

/** Plain label for emails / non-i18n surfaces */
export function meetingChannelPlainLabel(channel, locale = 'en') {
  const es = locale === 'es'
  switch (channel) {
    case 'VIDEO_CALL':
      return es ? 'Videollamada (WhatsApp)' : 'Video call (WhatsApp)'
    case 'PHONE_CALL':
      return es ? 'Llamada telefónica (WhatsApp)' : 'Phone call (WhatsApp)'
    case 'IN_PERSON':
      return es ? 'En persona (WhatsApp)' : 'In person (WhatsApp)'
    case 'CALENDLY':
      return 'Calendly'
    case 'WHATSAPP':
      return 'WhatsApp'
    default:
      return channel || '—'
  }
}
