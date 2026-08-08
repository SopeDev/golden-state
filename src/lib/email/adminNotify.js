import { sendAdminEmail } from '@/lib/email/mailer'
import { meetingChannelPlainLabel } from '@/lib/investMeetingLinks'

const CORPORATE_ADMIN_EMAIL = 'admin@goldenstatecapitalmgt.com'

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const getBaseUrl = () =>
  process.env.NEXTAUTH_URL || process.env.APP_URL || 'http://localhost:3000'

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

export async function notifyAdminsInvestorPendingApproval({ investor, locale = 'en' }) {
  const recipients = getAdminNotifyEmails()

  const adminUrl = `${getBaseUrl()}/${locale}/admin/users`
  const profile = investor.profile && typeof investor.profile === 'object' ? investor.profile : {}
  const name = escapeHtml(profile.fullName || investor.email)
  const email = escapeHtml(investor.email)
  const investmentRange = escapeHtml(profile.investmentRange || '—')
  const investmentGoals = escapeHtml(profile.investmentGoals || '—')
  const locationLabel =
    profile.location === 'MX' ? (locale === 'es' ? 'México' : 'Mexico') : profile.location === 'US' ? (locale === 'es' ? 'Estados Unidos' : 'United States') : '—'
  const visaInterest =
    profile.location === 'MX'
      ? profile.interestedInInvestorVisa
        ? locale === 'es'
          ? 'Sí'
          : 'Yes'
        : locale === 'es'
          ? 'No'
          : 'No'
      : null
  const projectTypes = escapeHtml(
    Array.isArray(profile.projectTypes) ? profile.projectTypes.join(', ') : '—'
  )

  const subject =
    locale === 'es'
      ? `Nuevo inversionista pendiente de aprobación — ${name}`
      : `New investor pending approval — ${name}`

  const html =
    locale === 'es'
      ? `<p>Un inversionista completó su perfil y está listo para revisión:</p>
<ul>
<li><strong>Nombre:</strong> ${name}</li>
<li><strong>Correo:</strong> ${email}</li>
<li><strong>Ubicación:</strong> ${escapeHtml(locationLabel)}</li>
${visaInterest ? `<li><strong>Visa de inversionista:</strong> ${visaInterest}</li>` : ''}
<li><strong>Monto planeado:</strong> ${investmentRange}</li>
<li><strong>Objetivos:</strong> ${investmentGoals}</li>
<li><strong>Tipos de proyecto:</strong> ${projectTypes}</li>
</ul>
<p><a href="${adminUrl}">Abrir gestión de usuarios</a></p>`
      : `<p>An investor completed their profile and is ready for your review:</p>
<ul>
<li><strong>Name:</strong> ${name}</li>
<li><strong>Email:</strong> ${email}</li>
<li><strong>Location:</strong> ${escapeHtml(locationLabel)}</li>
${visaInterest ? `<li><strong>Investor Visa interest:</strong> ${visaInterest}</li>` : ''}
<li><strong>Planned investment:</strong> ${investmentRange}</li>
<li><strong>Goals:</strong> ${investmentGoals}</li>
<li><strong>Project interests:</strong> ${projectTypes}</li>
</ul>
<p><a href="${adminUrl}">Open user management</a></p>`

  const text = `${subject}\n${adminUrl}`

  await Promise.all(recipients.map((to) => sendAdminEmail({ to, subject, html, text })))

  return { ok: true, count: recipients.length }
}

export async function notifyAdminsAccreditationSubmitted({
  investor,
  documentCount,
  locale = 'en',
}) {
  const recipients = getAdminNotifyEmails()

  const adminUrl = `${getBaseUrl()}/${locale}/admin/users`
  const profile = investor.profile && typeof investor.profile === 'object' ? investor.profile : {}
  const name = escapeHtml(profile.fullName || investor.email)
  const email = escapeHtml(investor.email)
  const count = Number(documentCount) || 0

  const subject =
    locale === 'es'
      ? `Documentos de inversionista acreditado enviados — ${name}`
      : `Accredited investor documents submitted — ${name}`

  const html =
    locale === 'es'
      ? `<p>Un inversionista envió documentación para verificación de inversionista acreditado:</p>
<ul>
<li><strong>Nombre:</strong> ${name}</li>
<li><strong>Correo:</strong> ${email}</li>
<li><strong>Documentos cargados:</strong> ${count}</li>
</ul>
<p><a href="${adminUrl}">Abrir gestión de usuarios</a></p>`
      : `<p>An investor submitted documentation for accredited investor verification:</p>
<ul>
<li><strong>Name:</strong> ${name}</li>
<li><strong>Email:</strong> ${email}</li>
<li><strong>Documents uploaded:</strong> ${count}</li>
</ul>
<p><a href="${adminUrl}">Open user management</a></p>`

  const text = `${subject}\n${adminUrl}`

  await Promise.all(recipients.map((to) => sendAdminEmail({ to, subject, html, text })))

  return { ok: true, count: recipients.length }
}

export async function notifyAdminsReviewRequested({ investor, scope, locale = 'en' }) {
  const recipients = getAdminNotifyEmails()

  const adminUrl = `${getBaseUrl()}/${locale}/admin/users`
  const profile = investor.profile && typeof investor.profile === 'object' ? investor.profile : {}
  const name = escapeHtml(profile.fullName || investor.email)
  const email = escapeHtml(investor.email)

  const isAccount = scope === 'account'
  const subject =
    locale === 'es'
      ? isAccount
        ? `Solicitud de revisión de cuenta — ${name}`
        : `Solicitud de revisión de acreditación — ${name}`
      : isAccount
        ? `Account review requested — ${name}`
        : `Accreditation review requested — ${name}`

  const html =
    locale === 'es'
      ? isAccount
        ? `<p>Un inversionista rechazado solicitó una nueva revisión de su cuenta:</p>
<ul>
<li><strong>Nombre:</strong> ${name}</li>
<li><strong>Correo:</strong> ${email}</li>
</ul>
<p><a href="${adminUrl}">Abrir gestión de usuarios</a></p>`
        : `<p>Un inversionista solicitó una nueva revisión de su verificación de inversionista acreditado:</p>
<ul>
<li><strong>Nombre:</strong> ${name}</li>
<li><strong>Correo:</strong> ${email}</li>
</ul>
<p><a href="${adminUrl}">Abrir gestión de usuarios</a></p>`
      : isAccount
        ? `<p>A rejected investor requested another review of their account:</p>
<ul>
<li><strong>Name:</strong> ${name}</li>
<li><strong>Email:</strong> ${email}</li>
</ul>
<p><a href="${adminUrl}">Open user management</a></p>`
        : `<p>An investor requested another review of their accredited investor verification:</p>
<ul>
<li><strong>Name:</strong> ${name}</li>
<li><strong>Email:</strong> ${email}</li>
</ul>
<p><a href="${adminUrl}">Open user management</a></p>`

  const text = `${subject}\n${adminUrl}`

  await Promise.all(recipients.map((to) => sendAdminEmail({ to, subject, html, text })))

  return { ok: true, count: recipients.length }
}

export async function notifyAdminsMeetingRequested({
  investor,
  property,
  channel,
  intendedAmount,
  locale = 'en',
}) {
  const recipients = getAdminNotifyEmails()
  const adminUrl = `${getBaseUrl()}/${locale}/admin/investments`
  const profile = investor.profile && typeof investor.profile === 'object' ? investor.profile : {}
  const name = escapeHtml(profile.fullName || investor.email)
  const email = escapeHtml(investor.email)
  const propertyLabel = escapeHtml(
    property?.investmentId
      ? `#${property.investmentId} · ${property.name}`
      : property?.name || '—'
  )
  const channelLabel = meetingChannelPlainLabel(channel, locale)
  const amountLabel =
    intendedAmount != null && Number.isFinite(Number(intendedAmount))
      ? `$${Number(intendedAmount).toLocaleString('en-US')}`
      : '—'

  const subject =
    locale === 'es'
      ? `Solicitud de reunión de inversión — ${name}`
      : `Investment meeting request — ${name}`

  const html =
    locale === 'es'
      ? `<p>Un inversionista acreditado solicitó una reunión de inversión por WhatsApp. Confirme en WhatsApp que la reunión quedó agendada antes de aprobar para invertir:</p>
<ul>
<li><strong>Nombre:</strong> ${name}</li>
<li><strong>Correo:</strong> ${email}</li>
<li><strong>Propiedad:</strong> ${propertyLabel}</li>
<li><strong>Modalidad:</strong> ${escapeHtml(channelLabel)}</li>
<li><strong>Monto estimado:</strong> ${escapeHtml(amountLabel)}</li>
</ul>
<p><a href="${adminUrl}">Abrir solicitudes de reunión</a></p>`
      : `<p>An accredited investor requested an investment meeting via WhatsApp. Confirm in WhatsApp that a meeting is actually scheduled before approving for investment:</p>
<ul>
<li><strong>Name:</strong> ${name}</li>
<li><strong>Email:</strong> ${email}</li>
<li><strong>Property:</strong> ${propertyLabel}</li>
<li><strong>Modality:</strong> ${escapeHtml(channelLabel)}</li>
<li><strong>Intended amount:</strong> ${escapeHtml(amountLabel)}</li>
</ul>
<p><a href="${adminUrl}">Open meeting requests</a></p>`

  const text = `${subject}\n${adminUrl}`

  await Promise.all(recipients.map((to) => sendAdminEmail({ to, subject, html, text })))

  return { ok: true, count: recipients.length }
}

export async function notifyAdminsDepositSubmitted({
  investor,
  property,
  amount,
  reference,
  locale = 'en',
}) {
  const recipients = getAdminNotifyEmails()
  const adminUrl = `${getBaseUrl()}/${locale}/admin/investments`
  const profile = investor.profile && typeof investor.profile === 'object' ? investor.profile : {}
  const name = escapeHtml(profile.fullName || investor.email)
  const email = escapeHtml(investor.email)
  const propertyLabel = escapeHtml(
    property?.investmentId
      ? `#${property.investmentId} · ${property.name}`
      : property?.name || '—'
  )
  const amountLabel =
    amount != null && Number.isFinite(Number(amount))
      ? `$${Number(amount).toLocaleString('en-US')}`
      : '—'
  const referenceLabel = escapeHtml(reference || '—')

  const subject =
    locale === 'es'
      ? `Comprobante de depósito enviado — ${name}`
      : `Deposit proof submitted — ${name}`

  const html =
    locale === 'es'
      ? `<p>Un inversionista acreditado envió comprobante de depósito para revisión:</p>
<ul>
<li><strong>Nombre:</strong> ${name}</li>
<li><strong>Correo:</strong> ${email}</li>
<li><strong>Propiedad:</strong> ${propertyLabel}</li>
<li><strong>Monto:</strong> ${escapeHtml(amountLabel)}</li>
<li><strong>Referencia:</strong> ${referenceLabel}</li>
</ul>
<p><a href="${adminUrl}">Abrir solicitudes de inversión</a></p>`
      : `<p>An accredited investor submitted deposit proof for review:</p>
<ul>
<li><strong>Name:</strong> ${name}</li>
<li><strong>Email:</strong> ${email}</li>
<li><strong>Property:</strong> ${propertyLabel}</li>
<li><strong>Amount:</strong> ${escapeHtml(amountLabel)}</li>
<li><strong>Reference:</strong> ${referenceLabel}</li>
</ul>
<p><a href="${adminUrl}">Open investment requests</a></p>`

  const text = `${subject}\n${adminUrl}`

  await Promise.all(recipients.map((to) => sendAdminEmail({ to, subject, html, text })))

  return { ok: true, count: recipients.length }
}
