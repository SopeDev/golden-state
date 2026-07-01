import fs from 'fs'
import path from 'path'
import nodemailer from 'nodemailer'
import {
  verificationEmailContent,
  pendingAdminEmailContent,
  passwordResetEmailContent,
  accountApprovedEmailContent,
  accreditationApprovedEmailContent,
  accreditationResubmitEmailContent,
  EMAIL_LOGO_CID,
} from '@/lib/email/emailTemplates'

const getBaseUrl = () =>
  process.env.NEXTAUTH_URL || process.env.APP_URL || 'http://localhost:3000'

const getFrom = () =>
  process.env.EMAIL_FROM || 'Golden State Capital <no-reply@goldenstatecapitalmgt.com>'

const getSmtpUser = () => process.env.SMTP_USER?.trim() || ''

const getReplyTo = () =>
  process.env.EMAIL_REPLY_TO?.trim() || 'admin@goldenstatecapitalmgt.com'

const getLogoAttachment = () => {
  const logoPath = path.join(process.cwd(), 'public', 'logo.png')

  if (!fs.existsSync(logoPath)) {
    console.warn('[email] public/logo.png not found — logo will not appear in emails')
    return null
  }

  return {
    filename: 'logo.png',
    path: logoPath,
    cid: EMAIL_LOGO_CID,
  }
}

const createTransport = () => {
  if (!process.env.SMTP_HOST) {
    return null
  }

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

export async function sendEmail({ to, subject, html, text }) {
  const transport = createTransport()
  const smtpConfigured = Boolean(process.env.SMTP_HOST?.trim())

  if (!transport) {
    if (smtpConfigured) {
      throw new Error(
        'SMTP_HOST is set but SMTP_USER or SMTP_PASS is missing — email not sent. Restart the dev server after updating .env.local.'
      )
    }

    const preview = text || html?.replace(/<[^>]+>/g, ' ').slice(0, 300)
    console.info(
      '[email:dev] SMTP not configured — no email sent. Add SMTP_HOST (and related vars) to .env.local to deliver mail.\n',
      { to, subject, body: preview }
    )
    return { ok: true, dev: true }
  }

  const logoAttachment = html ? getLogoAttachment() : null
  const smtpUser = getSmtpUser()

  const result = await transport.sendMail({
    from: getFrom(),
    sender: smtpUser || undefined,
    replyTo: getReplyTo(),
    to,
    subject,
    html,
    text,
    attachments: logoAttachment ? [logoAttachment] : undefined,
  })

  console.info('[email] sent', {
    to,
    subject,
    from: getFrom(),
    sender: smtpUser || undefined,
    messageId: result.messageId,
    response: result.response,
  })

  return { ok: true }
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
