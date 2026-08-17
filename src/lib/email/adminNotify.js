import { sendAdminEmail } from '@/lib/email/mailer'
import { buildAdminEmail } from '@/lib/email/adminEmail'
import { adminAppLinks } from '@/lib/email/appLinks'
import { meetingChannelPlainLabel } from '@/lib/investMeetingLinks'
import { formatUsd } from '@/lib/formatMoney'

const CORPORATE_ADMIN_EMAIL = 'admin@goldenstatecapitalmgt.com'

const investorName = (investor) => {
  const profile = investor?.profile && typeof investor.profile === 'object' ? investor.profile : {}
  return profile.fullName || investor?.email || '—'
}

const propertyLabel = (property) => {
  if (!property) return '—'
  if (property.investmentId != null && property.name) {
    return `#${property.investmentId} · ${property.name}`
  }
  return property.name || (property.investmentId != null ? `#${property.investmentId}` : '—')
}

const amountLabel = (amount) =>
  amount != null && Number.isFinite(Number(amount)) ? formatUsd(amount) : '—'

export function getAdminNotifyEmails() {
  const override =
    process.env.ADMIN_NOTIFY_EMAIL?.split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean) || []

  if (override.length > 0) {
    return [...new Set(override)]
  }

  return [CORPORATE_ADMIN_EMAIL]
}

async function deliverAdminEmail(locale, content) {
  const recipients = getAdminNotifyEmails()
  await Promise.all(
    recipients.map((to) =>
      sendAdminEmail({
        to,
        subject: content.subject,
        html: content.html,
        text: content.text,
      })
    )
  )
  return { ok: true, count: recipients.length }
}

export async function notifyAdminsInvestorPendingApproval({ investor, locale = 'en' }) {
  const name = investorName(investor)
  const links = adminAppLinks(locale, { userId: investor.id })
  const profile = investor.profile && typeof investor.profile === 'object' ? investor.profile : {}
  const locationLabel =
    profile.location === 'MX'
      ? locale === 'es'
        ? 'México'
        : 'Mexico'
      : profile.location === 'US'
        ? locale === 'es'
          ? 'Estados Unidos'
          : 'United States'
        : profile.location || '—'

  const content = buildAdminEmail({
    locale,
    subject:
      locale === 'es'
        ? `Nuevo inversionista pendiente de aprobación — ${name}`
        : `New investor pending approval — ${name}`,
    heading:
      locale === 'es' ? 'Inversionista pendiente de aprobación' : 'Investor pending approval',
    intro:
      locale === 'es'
        ? 'Un inversionista completó su perfil y está listo para revisión de cuenta.'
        : 'An investor completed their profile and is ready for account review.',
    fields: [
      { label: locale === 'es' ? 'Nombre' : 'Name', value: name },
      { label: locale === 'es' ? 'Correo' : 'Email', value: investor.email },
      { label: locale === 'es' ? 'Ubicación' : 'Location', value: locationLabel },
      { label: locale === 'es' ? 'Monto planeado' : 'Planned investment', value: profile.investmentRange },
      { label: locale === 'es' ? 'Objetivos' : 'Goals', value: profile.investmentGoals },
    ],
    primaryCta: {
      href: links.user,
      label: locale === 'es' ? 'Abrir ficha del inversionista' : 'Open investor record',
    },
  })

  return deliverAdminEmail(locale, content)
}

export async function notifyAdminsAccreditationSubmitted({
  investor,
  documentCount,
  locale = 'en',
}) {
  const name = investorName(investor)
  const links = adminAppLinks(locale, { userId: investor.id })
  const count = Number(documentCount) || 0

  const content = buildAdminEmail({
    locale,
    subject:
      locale === 'es'
        ? `Documentos de inversionista acreditado enviados — ${name}`
        : `Accredited investor documents submitted — ${name}`,
    heading:
      locale === 'es' ? 'Documentos de acreditación enviados' : 'Accreditation documents submitted',
    intro:
      locale === 'es'
        ? 'Revise los documentos en la ficha de este inversionista y apruebe, solicite reenvío o rechace.'
        : 'Review the documents on this investor’s record and approve, request a resubmit, or reject.',
    fields: [
      { label: locale === 'es' ? 'Nombre' : 'Name', value: name },
      { label: locale === 'es' ? 'Correo' : 'Email', value: investor.email },
      { label: locale === 'es' ? 'Documentos' : 'Documents', value: String(count) },
    ],
    primaryCta: {
      href: links.user,
      label: locale === 'es' ? 'Revisar documentos del inversionista' : 'Review investor documents',
    },
  })

  return deliverAdminEmail(locale, content)
}

export async function notifyAdminsReviewRequested({ investor, scope, locale = 'en' }) {
  const name = investorName(investor)
  const links = adminAppLinks(locale, { userId: investor.id })
  const isAccount = scope === 'account'

  const content = buildAdminEmail({
    locale,
    subject:
      locale === 'es'
        ? isAccount
          ? `Solicitud de revisión de cuenta — ${name}`
          : `Solicitud de revisión de acreditación — ${name}`
        : isAccount
          ? `Account review requested — ${name}`
          : `Accreditation review requested — ${name}`,
    heading:
      locale === 'es'
        ? isAccount
          ? 'Revisión de cuenta solicitada'
          : 'Revisión de acreditación solicitada'
        : isAccount
          ? 'Account review requested'
          : 'Accreditation review requested',
    intro: isAccount
      ? locale === 'es'
        ? 'Un inversionista rechazado pidió una nueva revisión de su cuenta.'
        : 'A rejected investor asked for another review of their account.'
      : locale === 'es'
        ? 'Un inversionista pidió una nueva revisión de su verificación de inversionista acreditado.'
        : 'An investor asked for another review of their accredited investor verification.',
    fields: [
      { label: locale === 'es' ? 'Nombre' : 'Name', value: name },
      { label: locale === 'es' ? 'Correo' : 'Email', value: investor.email },
    ],
    primaryCta: {
      href: links.user,
      label: locale === 'es' ? 'Abrir ficha del inversionista' : 'Open investor record',
    },
  })

  return deliverAdminEmail(locale, content)
}

export async function notifyAdminsMeetingRequested({
  investor,
  property,
  channel,
  intendedAmount,
  intentId,
  locale = 'en',
}) {
  const name = investorName(investor)
  const links = adminAppLinks(locale, { userId: investor.id, intentId })
  const channelLabel = meetingChannelPlainLabel(channel, locale)

  const content = buildAdminEmail({
    locale,
    subject:
      locale === 'es' ? `Solicitud de inversión — ${name}` : `Investment request — ${name}`,
    heading: locale === 'es' ? 'Solicitud de inversión' : 'Investment request',
    intro:
      locale === 'es'
        ? 'Un inversionista acreditado envió una solicitud por WhatsApp. Confirme en WhatsApp que la reunión quedó agendada antes de aprobar para invertir.'
        : 'An accredited investor submitted an investment request via WhatsApp. Confirm in WhatsApp that a meeting is actually scheduled before approving them to invest.',
    fields: [
      { label: locale === 'es' ? 'Nombre' : 'Name', value: name },
      { label: locale === 'es' ? 'Correo' : 'Email', value: investor.email },
      { label: locale === 'es' ? 'Propiedad' : 'Property', value: propertyLabel(property) },
      { label: locale === 'es' ? 'Modalidad' : 'Modality', value: channelLabel },
      { label: locale === 'es' ? 'Monto estimado' : 'Intended amount', value: amountLabel(intendedAmount) },
    ],
    primaryCta: {
      href: links.intent,
      label: locale === 'es' ? 'Abrir esta solicitud' : 'Open this request',
    },
    secondaryCtas: [
      {
        href: links.user,
        label: locale === 'es' ? 'Ficha del inversionista' : 'Investor record',
      },
    ],
  })

  return deliverAdminEmail(locale, content)
}

export async function notifyAdminsDepositSubmitted({
  investor,
  property,
  amount,
  reference,
  depositId,
  locale = 'en',
}) {
  const name = investorName(investor)
  const links = adminAppLinks(locale, { userId: investor.id, depositId })

  const content = buildAdminEmail({
    locale,
    subject:
      locale === 'es'
        ? `Comprobante de depósito enviado — ${name}`
        : `Deposit proof submitted — ${name}`,
    heading: locale === 'es' ? 'Comprobante de depósito enviado' : 'Deposit proof submitted',
    intro:
      locale === 'es'
        ? 'Revise el comprobante y confirme o rechace el depósito. Confirmar crea el aporte en el portafolio.'
        : 'Review the receipt and confirm or reject the deposit. Confirming creates the portfolio contribution.',
    fields: [
      { label: locale === 'es' ? 'Nombre' : 'Name', value: name },
      { label: locale === 'es' ? 'Correo' : 'Email', value: investor.email },
      { label: locale === 'es' ? 'Propiedad' : 'Property', value: propertyLabel(property) },
      { label: locale === 'es' ? 'Monto' : 'Amount', value: amountLabel(amount) },
      { label: locale === 'es' ? 'Referencia' : 'Reference', value: reference || '—' },
    ],
    primaryCta: {
      href: links.deposit,
      label: locale === 'es' ? 'Revisar este depósito' : 'Review this deposit',
    },
    secondaryCtas: [
      {
        href: links.user,
        label: locale === 'es' ? 'Ficha del inversionista' : 'Investor record',
      },
    ],
  })

  return deliverAdminEmail(locale, content)
}

export async function notifyAdminsCashOutRequested({ investor, amount, cashOutId, locale = 'en' }) {
  const name = investorName(investor)
  const links = adminAppLinks(locale, { userId: investor.id, cashOutId })

  const content = buildAdminEmail({
    locale,
    subject: locale === 'es' ? `Solicitud de retiro — ${name}` : `Cash-out request — ${name}`,
    heading: locale === 'es' ? 'Solicitud de retiro pendiente' : 'Pending cash-out request',
    intro:
      locale === 'es'
        ? 'Un inversionista pidió un retiro de retornos. Confirme cuando el pago esté hecho, o rechace para liberar el saldo.'
        : 'An investor requested a cash-out of returns. Confirm when the payment is made, or reject to release the balance.',
    fields: [
      { label: locale === 'es' ? 'Nombre' : 'Name', value: name },
      { label: locale === 'es' ? 'Correo' : 'Email', value: investor.email },
      { label: locale === 'es' ? 'Monto' : 'Amount', value: amountLabel(amount) },
    ],
    primaryCta: {
      href: links.cashOut,
      label: locale === 'es' ? 'Abrir esta solicitud de retiro' : 'Open this cash-out request',
    },
    secondaryCtas: [
      {
        href: links.user,
        label: locale === 'es' ? 'Ficha del inversionista' : 'Investor record',
      },
    ],
  })

  return deliverAdminEmail(locale, content)
}

export async function notifyAdminsReinvestRequested({
  investor,
  property,
  amount,
  reinvestId,
  locale = 'en',
}) {
  const name = investorName(investor)
  const links = adminAppLinks(locale, { userId: investor.id, reinvestId })

  const content = buildAdminEmail({
    locale,
    subject: locale === 'es' ? `Solicitud de reinversión — ${name}` : `Reinvestment request — ${name}`,
    heading: locale === 'es' ? 'Solicitud de reinversión pendiente' : 'Pending reinvestment request',
    intro:
      locale === 'es'
        ? 'Un inversionista pidió asignar retornos a una propiedad. Confirmar crea el aporte; rechazar libera el saldo.'
        : 'An investor asked to allocate returns to a property. Confirming creates the contribution; rejecting releases the balance.',
    fields: [
      { label: locale === 'es' ? 'Nombre' : 'Name', value: name },
      { label: locale === 'es' ? 'Correo' : 'Email', value: investor.email },
      { label: locale === 'es' ? 'Propiedad destino' : 'Destination property', value: propertyLabel(property) },
      { label: locale === 'es' ? 'Monto' : 'Amount', value: amountLabel(amount) },
    ],
    primaryCta: {
      href: links.reinvest,
      label: locale === 'es' ? 'Abrir esta reinversión' : 'Open this reinvestment',
    },
    secondaryCtas: [
      {
        href: links.user,
        label: locale === 'es' ? 'Ficha del inversionista' : 'Investor record',
      },
    ],
  })

  return deliverAdminEmail(locale, content)
}

export async function notifyAdminsMeetingCancelled({
  investor,
  property,
  intentId,
  locale = 'en',
}) {
  const name = investorName(investor)
  const links = adminAppLinks(locale, { userId: investor.id, intentId })

  const content = buildAdminEmail({
    locale,
    subject:
      locale === 'es'
        ? `Solicitud de inversión cancelada — ${name}`
        : `Investment request cancelled — ${name}`,
    heading:
      locale === 'es' ? 'El inversionista canceló la solicitud' : 'Investor cancelled the request',
    intro:
      locale === 'es'
        ? 'Un inversionista canceló una solicitud de inversión pendiente. No se requiere acción salvo seguimiento si la reunión ya estaba agendada.'
        : 'An investor cancelled a pending investment request. No action is required unless a meeting was already scheduled.',
    fields: [
      { label: locale === 'es' ? 'Nombre' : 'Name', value: name },
      { label: locale === 'es' ? 'Correo' : 'Email', value: investor.email },
      { label: locale === 'es' ? 'Propiedad' : 'Property', value: propertyLabel(property) },
    ],
    primaryCta: {
      href: links.intent,
      label: locale === 'es' ? 'Ver la solicitud cancelada' : 'View the cancelled request',
    },
    secondaryCtas: [
      {
        href: links.user,
        label: locale === 'es' ? 'Ficha del inversionista' : 'Investor record',
      },
    ],
  })

  return deliverAdminEmail(locale, content)
}

export async function notifyAdminsWorkWithUsInquiry({
  name,
  email,
  phone,
  message,
  roleTitle,
  locale = 'en',
}) {
  const content = buildAdminEmail({
    locale,
    subject:
      locale === 'es'
        ? `Consulta de Trabaja con nosotros — ${name}`
        : `Work with us inquiry — ${name}`,
    heading: locale === 'es' ? 'Consulta de Trabaja con nosotros' : 'Work with us inquiry',
    intro:
      locale === 'es'
        ? 'Alguien envió el formulario de Trabaja con nosotros.'
        : 'Someone submitted the Work with us form.',
    fields: [
      { label: locale === 'es' ? 'Nombre' : 'Name', value: name },
      { label: locale === 'es' ? 'Correo' : 'Email', value: email },
      { label: locale === 'es' ? 'Teléfono' : 'Phone', value: phone || '—' },
      { label: locale === 'es' ? 'Interés' : 'Interest', value: roleTitle },
    ],
    note: message,
  })

  return deliverAdminEmail(locale, content)
}
