const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

/**
 * Ops-first admin email: facts, then the most specific follow-up link.
 * Branding is intentionally light compared with investor mail.
 */
export function buildAdminEmail({
  locale = 'en',
  subject,
  heading,
  intro,
  fields = [],
  primaryCta,
  secondaryCtas = [],
  note,
}) {
  const fieldRows = fields
    .filter((field) => field && field.value)
    .map(
      (field) =>
        `<tr>
          <td style="padding:6px 0;font-size:13px;color:#555;vertical-align:top;width:140px;">${escapeHtml(field.label)}</td>
          <td style="padding:6px 0;font-size:13px;color:#111;">${escapeHtml(field.value)}</td>
        </tr>`
    )
    .join('')

  const ctaButton = (cta, primary) =>
    `<p style="margin:16px 0 0;">
      <a href="${escapeHtml(cta.href)}" style="display:inline-block;padding:10px 16px;background:${primary ? '#0d2642' : '#fff'};color:${primary ? '#fff' : '#0d2642'};border:1px solid #0d2642;text-decoration:none;font-size:13px;font-weight:600;">
        ${escapeHtml(cta.label)}
      </a>
    </p>
    <p style="margin:8px 0 0;font-size:12px;word-break:break-all;">
      <a href="${escapeHtml(cta.href)}" style="color:#0d2642;">${escapeHtml(cta.href)}</a>
    </p>`

  const html = `<!DOCTYPE html>
<html lang="${locale === 'es' ? 'es' : 'en'}">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:24px;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;color:#111;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #ddd;padding:24px;">
    <tr>
      <td>
        <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#666;">Golden State Capital — Admin</p>
        <h1 style="margin:0 0 12px;font-size:18px;line-height:1.3;">${escapeHtml(heading)}</h1>
        <p style="margin:0 0 16px;font-size:14px;line-height:1.5;">${escapeHtml(intro)}</p>
        ${
          fieldRows
            ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 8px;">${fieldRows}</table>`
            : ''
        }
        ${note ? `<p style="margin:12px 0 0;font-size:13px;color:#333;">${escapeHtml(note)}</p>` : ''}
        ${primaryCta ? ctaButton(primaryCta, true) : ''}
        ${secondaryCtas.map((cta) => ctaButton(cta, false)).join('')}
      </td>
    </tr>
  </table>
</body>
</html>`

  const textLines = [
    subject,
    '',
    intro,
    '',
    ...fields.filter((field) => field?.value).map((field) => `${field.label}: ${field.value}`),
    note ? `\n${note}` : '',
    primaryCta ? `\n${primaryCta.label}: ${primaryCta.href}` : '',
    ...secondaryCtas.map((cta) => `${cta.label}: ${cta.href}`),
  ]

  return {
    subject,
    html,
    text: textLines.filter((line) => line !== '').join('\n'),
  }
}
