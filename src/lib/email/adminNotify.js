import { sendEmail } from '@/lib/email/mailer'

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
<li><strong>Monto planeado:</strong> ${investmentRange}</li>
<li><strong>Objetivos:</strong> ${investmentGoals}</li>
<li><strong>Tipos de proyecto:</strong> ${projectTypes}</li>
</ul>
<p><a href="${adminUrl}">Abrir gestión de usuarios</a></p>`
      : `<p>An investor completed their profile and is ready for your review:</p>
<ul>
<li><strong>Name:</strong> ${name}</li>
<li><strong>Email:</strong> ${email}</li>
<li><strong>Planned investment:</strong> ${investmentRange}</li>
<li><strong>Goals:</strong> ${investmentGoals}</li>
<li><strong>Project interests:</strong> ${projectTypes}</li>
</ul>
<p><a href="${adminUrl}">Open user management</a></p>`

  const text = `${subject}\n${adminUrl}`

  await Promise.all(recipients.map((to) => sendEmail({ to, subject, html, text })))

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

  await Promise.all(recipients.map((to) => sendEmail({ to, subject, html, text })))

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

  await Promise.all(recipients.map((to) => sendEmail({ to, subject, html, text })))

  return { ok: true, count: recipients.length }
}
