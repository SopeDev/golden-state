import fs from 'fs'
import path from 'path'
import nodemailer from 'nodemailer'
import { Resend } from 'resend'
import {
  verificationEmailContent,
  pendingAdminEmailContent,
  passwordResetEmailContent,
  accountApprovedEmailContent,
  accreditationApprovedEmailContent,
  accreditationResubmitEmailContent,
  meetingRequestedEmailContent,
  awaitingWireEmailContent,
  EMAIL_LOGO_CID,
} from '@/lib/email/emailTemplates'
import { meetingChannelPlainLabel } from '@/lib/investMeetingLinks'

const getBaseUrl = () =>
  process.env.NEXTAUTH_URL || process.env.APP_URL || 'http://localhost:3000'

const NO_REPLY_ADDRESS = 'no-reply@goldenstatecapitalmgt.com'
const DEFAULT_FROM = `Golden State Capital <${NO_REPLY_ADDRESS}>`

let resendClient = null

const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  if (!apiKey) return null
  if (!resendClient) {
    resendClient = new Resend(apiKey)
  }
  return resendClient
}

/** All transactional mail sends from no-reply@. */
const getTransactionalFrom = () => {
  const configured = process.env.EMAIL_FROM?.trim()
  if (configured && configured.toLowerCase().includes(NO_REPLY_ADDRESS)) {
    return configured
  }

  if (configured) {
    console.warn(
      `[email] EMAIL_FROM must use ${NO_REPLY_ADDRESS} — ignoring misconfigured value`
    )
  }

  return DEFAULT_FROM
}

const getLogoPath = () => {
  const logoPath = path.join(process.cwd(), 'public', 'logo.png')
  if (!fs.existsSync(logoPath)) {
    console.warn('[email] public/logo.png not found — logo will not appear in emails')
    return null
  }
  return logoPath
}

const getResendLogoAttachment = () => {
  const logoPath = getLogoPath()
  if (!logoPath) return null
  return {
    filename: 'logo.png',
    content: fs.readFileSync(logoPath),
    contentId: EMAIL_LOGO_CID,
  }
}

const getSmtpLogoAttachment = () => {
  const logoPath = getLogoPath()
  if (!logoPath) return null
  return {
    filename: 'logo.png',
    path: logoPath,
    cid: EMAIL_LOGO_CID,
  }
}

const createSmtpTransport = () => {
  if (!process.env.SMTP_HOST?.trim()) return null

  const user = process.env.SMTP_USER?.trim()
  const pass = process.env.SMTP_PASS?.trim()

  if (!user || !pass) {
    console.warn('[email] SMTP_HOST is set but SMTP_USER or SMTP_PASS is missing')
    return null
  }

  const host = process.env.SMTP_HOST.trim().toLowerCase()

  if (host === 'smtp.gmail.com') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    })
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user, pass },
  })
}

const sendViaSmtp = async ({ to, subject, html, text }) => {
  const transport = createSmtpTransport()
  if (!transport) return null

  const logoAttachment = html ? getSmtpLogoAttachment() : null
  const from = getTransactionalFrom()
  const smtpUser = process.env.SMTP_USER?.trim() || ''

  const result = await transport.sendMail({
    from,
    sender: smtpUser || undefined,
    to,
    subject,
    html,
    text,
    attachments: logoAttachment ? [logoAttachment] : undefined,
  })

  console.info('[email:smtp] sent', {
    to,
    subject,
    from,
    messageId: result.messageId,
    response: result.response,
  })

  return { ok: true, provider: 'smtp', messageId: result.messageId }
}

const sendViaResend = async ({ to, subject, html, text }) => {
  const resend = getResendClient()
  if (!resend) return null

  const from = getTransactionalFrom()
  const logoAttachment = html ? getResendLogoAttachment() : null

  const { data, error } = await resend.emails.send({
    from,
    to: [to],
    subject,
    html,
    text,
    attachments: logoAttachment ? [logoAttachment] : undefined,
  })

  if (error) {
    console.warn('[email:resend] failed', { to, subject, error })
    return { ok: false, error }
  }

  console.info('[email:resend] sent', {
    to,
    subject,
    from,
    id: data?.id,
  })

  return { ok: true, provider: 'resend', id: data?.id }
}

/** Primary: Resend. Fallback: SMTP (if configured). Else log preview in dev. */
export async function sendEmail({ to, subject, html, text }) {
  const resendResult = await sendViaResend({ to, subject, html, text })
  if (resendResult?.ok) return resendResult

  if (resendResult && !resendResult.ok) {
    const smtpFallback = await sendViaSmtp({ to, subject, html, text })
    if (smtpFallback?.ok) {
      console.warn('[email] Resend failed — delivered via SMTP fallback')
      return smtpFallback
    }
    throw new Error(
      resendResult.error?.message ||
        'Resend send failed and SMTP fallback is not available'
    )
  }

  const smtpResult = await sendViaSmtp({ to, subject, html, text })
  if (smtpResult?.ok) return smtpResult

  const preview = text || html?.replace(/<[^>]+>/g, ' ').slice(0, 300)
  console.info(
    '[email:dev] RESEND_API_KEY (and SMTP) not configured — no email sent.\n',
    { to, subject, body: preview }
  )
  return { ok: true, dev: true }
}

/** Same transport as sendEmail (Resend-first). Kept for adminNotify call sites. */
export async function sendAdminEmail(args) {
  return sendEmail(args)
}

export function verificationEmailLink(token, locale = 'en') {
  return `${getBaseUrl()}/api/auth/verify-email?token=${encodeURIComponent(token)}&locale=${locale}`
}

export function passwordResetLink(token, locale = 'en') {
  return `${getBaseUrl()}/${locale}/reset-password?token=${encodeURIComponent(token)}`
}

export async function sendVerificationEmail({ to, token, locale }) {
  const link = verificationEmailLink(token, locale)
  const content = verificationEmailContent({ locale, link })

  if (process.env.NODE_ENV === 'development') {
    console.info('[email:dev] verification link (use if inbox does not arrive):', link)
  }

  return sendEmail({
    to,
    subject: content.subject,
    html: content.html,
    text: content.text,
  })
}

export async function sendPendingAdminEmail({ to, locale }) {
  const content = pendingAdminEmailContent({ locale })
  return sendEmail({
    to,
    subject: content.subject,
    html: content.html,
    text: content.text,
  })
}

export async function sendPasswordResetEmail({ to, token, locale }) {
  const link = passwordResetLink(token, locale)
  const content = passwordResetEmailContent({ locale, link })
  return sendEmail({
    to,
    subject: content.subject,
    html: content.html,
    text: content.text,
  })
}

export function dashboardLink(locale = 'en') {
  return `${getBaseUrl()}/${locale}/dashboard`
}

export function accountInvestmentRequestsLink(locale = 'en') {
  return `${getBaseUrl()}/${locale}/dashboard/activity`
}

export function propertyInvestLink(locale = 'en', investmentId) {
  return `${getBaseUrl()}/${locale}/properties/${investmentId}/invest`
}

export function accreditationLink(locale = 'en') {
  return `${getBaseUrl()}/${locale}/dashboard/account/accreditation`
}

export async function sendAccountApprovedEmail({ to, locale }) {
  const link = dashboardLink(locale)
  const content = accountApprovedEmailContent({ locale, dashboardLink: link })
  return sendEmail({
    to,
    subject: content.subject,
    html: content.html,
    text: content.text,
  })
}

export async function sendAccreditationApprovedEmail({ to, locale }) {
  const link = dashboardLink(locale)
  const content = accreditationApprovedEmailContent({ locale, dashboardLink: link })
  return sendEmail({
    to,
    subject: content.subject,
    html: content.html,
    text: content.text,
  })
}

export async function sendAccreditationResubmitEmail({
  to,
  locale,
  documentLabels,
  reviewNote,
}) {
  const link = accreditationLink(locale)
  const content = accreditationResubmitEmailContent({
    locale,
    accreditationLink: link,
    documentLabels,
    reviewNote,
  })
  return sendEmail({
    to,
    subject: content.subject,
    html: content.html,
    text: content.text,
  })
}

export async function sendMeetingRequestedEmail({
  to,
  locale,
  propertyName,
  investmentId,
  channel,
  intendedAmount,
}) {
  const accountLink = accountInvestmentRequestsLink(locale)
  const investLink = investmentId ? propertyInvestLink(locale, investmentId) : accountLink
  const channelLabel = meetingChannelPlainLabel(channel, locale)
  const amountLabel =
    intendedAmount != null && Number.isFinite(Number(intendedAmount))
      ? `$${Number(intendedAmount).toLocaleString('en-US')}`
      : null

  const content = meetingRequestedEmailContent({
    locale,
    propertyName,
    accountLink,
    investLink,
    channelLabel,
    amountLabel,
  })
  return sendEmail({
    to,
    subject: content.subject,
    html: content.html,
    text: content.text,
  })
}

export async function sendAwaitingWireEmail({ to, locale, propertyName, investmentId }) {
  const investLink = investmentId
    ? propertyInvestLink(locale, investmentId)
    : accountInvestmentRequestsLink(locale)
  const accountLink = accountInvestmentRequestsLink(locale)
  const content = awaitingWireEmailContent({
    locale,
    propertyName,
    investLink,
    accountLink,
  })
  return sendEmail({
    to,
    subject: content.subject,
    html: content.html,
    text: content.text,
  })
}
