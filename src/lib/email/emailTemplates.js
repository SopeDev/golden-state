const BRAND = {
  navy: '#0d2642',
  navyMid: '#224066',
  gold: '#ac8b49',
  goldLight: '#d1b378',
  offWhite: '#f7f5f0',
  white: '#ffffff',
  text: '#1d1d1d',
  muted: '#5c5c5c',
  border: '#e5e2db',
  company: 'Golden State Capital',
  tagline: 'Capital Management',
}

/** CID for inline logo attachment (see mailer.js). */
export const EMAIL_LOGO_CID = 'logo@goldenstate'

const defaultLogoSrc = () => `cid:${EMAIL_LOGO_CID}`

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const copy = {
  en: {
    footerRights: '© Golden State Capital Management. All rights reserved.',
    footerIgnore: 'If you did not request this email, you can safely ignore it.',
    linkFallback: 'If the button does not work, copy and paste this link into your browser:',
  },
  es: {
    footerRights: '© Golden State Capital Management. Todos los derechos reservados.',
    footerIgnore: 'Si no solicitó este correo, puede ignorarlo con seguridad.',
    linkFallback: 'Si el botón no funciona, copie y pegue este enlace en su navegador:',
  },
}

/**
 * Table-based layout with inline styles for broad email client support.
 */
export function buildTransactionalEmail({
  locale = 'en',
  preheader = '',
  eyebrow = '',
  heading,
  paragraphs = [],
  cta = null,
  footnotes = [],
  logoSrc = defaultLogoSrc(),
}) {
  const t = copy[locale] || copy.en
  const safePreheader = escapeHtml(preheader)
  const safeEyebrow = escapeHtml(eyebrow)
  const safeHeading = escapeHtml(heading)

  const bodyParagraphs = paragraphs
    .map(
      (p) =>
        `<p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:${BRAND.text};">${escapeHtml(p)}</p>`
    )
    .join('')

  const ctaBlock = cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:28px auto 8px;">
        <tr>
          <td align="center" style="border-radius:8px;background-color:${BRAND.navy};">
            <a href="${escapeHtml(cta.href)}" target="_blank" rel="noopener noreferrer"
              style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;text-decoration:none;color:${BRAND.white};">
              ${escapeHtml(cta.label)}
            </a>
          </td>
        </tr>
      </table>`
    : ''

  const footnoteBlock = footnotes
    .map(
      (note) =>
        `<p style="margin:0 0 10px;font-size:13px;line-height:1.55;color:${BRAND.muted};">${escapeHtml(note)}</p>`
    )
    .join('')

  const linkFallback = cta
    ? `<p style="margin:20px 0 8px;font-size:12px;line-height:1.5;color:${BRAND.muted};">${t.linkFallback}</p>
       <p style="margin:0 0 16px;font-size:12px;line-height:1.5;word-break:break-all;color:${BRAND.navyMid};">
         <a href="${escapeHtml(cta.href)}" style="color:${BRAND.navyMid};text-decoration:underline;">${escapeHtml(cta.href)}</a>
       </p>`
    : ''

  const logoUrl = escapeHtml(logoSrc)

  return `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <title>${safeHeading}</title>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.offWhite};font-family:Georgia,'Times New Roman',serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${safePreheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.offWhite};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:${BRAND.white};border:1px solid ${BRAND.border};border-radius:12px;overflow:hidden;">
          <tr>
            <td align="center" style="background-color:${BRAND.white};padding:28px 32px 24px;border-bottom:3px solid ${BRAND.gold};">
              <img
                src="${logoUrl}"
                alt="${escapeHtml(BRAND.company)} — ${escapeHtml(BRAND.tagline)}"
                width="260"
                style="display:block;margin:0 auto;max-width:260px;width:100%;height:auto;border:0;outline:none;text-decoration:none;"
              />
            </td>
          </tr>
          <tr>
            <td style="padding:36px 32px 8px;font-family:Arial,Helvetica,sans-serif;">
              ${
                safeEyebrow
                  ? `<p style="margin:0 0 10px;font-size:11px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:${BRAND.gold};font-family:Arial,Helvetica,sans-serif;">${safeEyebrow}</p>`
                  : ''
              }
              <h1 style="margin:0 0 20px;font-size:22px;font-weight:700;line-height:1.3;color:${BRAND.navy};font-family:Georgia,'Times New Roman',serif;">
                ${safeHeading}
              </h1>
              ${bodyParagraphs}
              ${ctaBlock}
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 32px;font-family:Arial,Helvetica,sans-serif;">
              ${footnoteBlock}
              ${linkFallback}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;background-color:${BRAND.offWhite};border-top:1px solid ${BRAND.border};font-family:Arial,Helvetica,sans-serif;">
              <p style="margin:0 0 6px;font-size:11px;line-height:1.5;color:${BRAND.muted};">${t.footerIgnore}</p>
              <p style="margin:0;font-size:11px;line-height:1.5;color:${BRAND.muted};">${t.footerRights}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function verificationEmailContent({ locale, link }) {
  if (locale === 'es') {
    return {
      subject: 'Confirme su correo electrónico | Golden State Capital',
      preheader: 'Complete la verificación de su cuenta de inversionista.',
      html: buildTransactionalEmail({
        locale: 'es',
        preheader: 'Complete la verificación de su cuenta de inversionista.',
        eyebrow: 'Cuenta de inversionista',
        heading: 'Verifique su correo electrónico',
        paragraphs: [
          'Gracias por registrarse en Golden State Capital.',
          'Para continuar con la configuración de su cuenta, confirme que esta dirección de correo le pertenece. A continuación podrá completar su perfil de inversionista.',
          'Nuestro equipo revisará su solicitud una vez finalizado el proceso.',
        ],
        cta: { href: link, label: 'Confirmar correo' },
        footnotes: [
          'Este enlace es válido durante 24 horas.',
          'Si no creó una cuenta con nosotros, ignore este mensaje.',
        ],
      }),
      text: [
        'Golden State Capital — Verifique su correo electrónico',
        '',
        'Gracias por registrarse. Para continuar, confirme su correo visitando el siguiente enlace:',
        link,
        '',
        'Este enlace es válido durante 24 horas.',
        'Si no creó una cuenta, ignore este mensaje.',
      ].join('\n'),
    }
  }

  return {
    subject: 'Confirm your email address | Golden State Capital',
    preheader: 'Complete verification for your investor account.',
    html: buildTransactionalEmail({
      locale: 'en',
      preheader: 'Complete verification for your investor account.',
      eyebrow: 'Investor account',
      heading: 'Verify your email address',
      paragraphs: [
        'Thank you for registering with Golden State Capital.',
        'To continue setting up your account, please confirm that this email address belongs to you. You will then be guided to complete your investor profile.',
        'Our team will review your application once onboarding is complete.',
      ],
      cta: { href: link, label: 'Confirm email' },
      footnotes: [
        'This link is valid for 24 hours.',
        'If you did not create an account with us, please disregard this message.',
      ],
    }),
    text: [
      'Golden State Capital — Verify your email address',
      '',
      'Thank you for registering. To continue, please confirm your email by visiting:',
      link,
      '',
      'This link is valid for 24 hours.',
      'If you did not create an account, please disregard this message.',
    ].join('\n'),
  }
}

export function pendingAdminEmailContent({ locale, pendingLink }) {
  if (locale === 'es') {
    return {
      subject: 'Correo confirmado — solicitud en revisión | Golden State Capital',
      html: buildTransactionalEmail({
        locale: 'es',
        preheader: 'Su correo fue confirmado correctamente.',
        eyebrow: 'Cuenta de inversionista',
        heading: 'Correo confirmado',
        paragraphs: [
          'Su dirección de correo ha sido verificada correctamente.',
          'Nuestro equipo revisará su perfil de inversionista y le notificaremos cuando su cuenta esté activa.',
        ],
        cta: pendingLink ? { href: pendingLink, label: 'Ver estado de la cuenta' } : null,
        footnotes: ['Gracias por su paciencia.'],
      }),
      text: [
        'Su correo fue confirmado. Revisaremos su perfil y le avisaremos cuando su cuenta esté activa.',
        pendingLink || '',
      ]
        .filter(Boolean)
        .join('\n'),
    }
  }

  return {
    subject: 'Email confirmed — application under review | Golden State Capital',
    html: buildTransactionalEmail({
      locale: 'en',
      preheader: 'Your email address has been verified.',
      eyebrow: 'Investor account',
      heading: 'Email confirmed',
      paragraphs: [
        'Your email address has been successfully verified.',
        'Our team will review your investor profile and notify you when your account is active.',
      ],
      cta: pendingLink ? { href: pendingLink, label: 'View account status' } : null,
      footnotes: ['Thank you for your patience.'],
    }),
    text: [
      'Your email is confirmed. We will review your profile and notify you when your account is active.',
      pendingLink || '',
    ]
      .filter(Boolean)
      .join('\n'),
  }
}

export function accountApprovedEmailContent({ locale, dashboardLink }) {
  if (locale === 'es') {
    return {
      subject: 'Su cuenta de inversionista está aprobada | Golden State Capital',
      html: buildTransactionalEmail({
        locale: 'es',
        preheader: 'Su solicitud fue aprobada. Ya puede acceder a su panel.',
        eyebrow: 'Cuenta de inversionista',
        heading: 'Bienvenido — su cuenta está activa',
        paragraphs: [
          'Nos complace informarle que su solicitud de inversionista ha sido aprobada.',
          'Ya puede acceder a su panel, revisar oportunidades y continuar con los siguientes pasos en su perfil de inversionista.',
          'Si tiene preguntas, nuestro equipo está a su disposición.',
        ],
        cta: { href: dashboardLink, label: 'Ir al panel' },
        footnotes: ['Gracias por confiar en Golden State Capital.'],
      }),
      text: [
        'Golden State Capital — Su cuenta está activa',
        '',
        'Su solicitud de inversionista ha sido aprobada. Acceda a su panel:',
        dashboardLink,
      ].join('\n'),
    }
  }

  return {
    subject: 'Your investor account is approved | Golden State Capital',
    html: buildTransactionalEmail({
      locale: 'en',
      preheader: 'Your application was approved. You can access your dashboard.',
      eyebrow: 'Investor account',
      heading: 'Welcome — your account is active',
      paragraphs: [
        'We are pleased to let you know that your investor application has been approved.',
        'You can now access your dashboard, review opportunities, and continue with the next steps in your investor profile.',
        'If you have any questions, our team is here to help.',
      ],
      cta: { href: dashboardLink, label: 'Go to dashboard' },
      footnotes: ['Thank you for choosing Golden State Capital.'],
    }),
    text: [
      'Golden State Capital — Your account is active',
      '',
      'Your investor application has been approved. Access your dashboard:',
      dashboardLink,
    ].join('\n'),
  }
}

export function accreditationApprovedEmailContent({ locale, dashboardLink }) {
  if (locale === 'es') {
    return {
      subject: 'Verificación de inversionista acreditado aprobada | Golden State Capital',
      html: buildTransactionalEmail({
        locale: 'es',
        preheader: 'Su documentación de inversionista acreditado fue aprobada.',
        eyebrow: 'Inversionista acreditado',
        heading: 'Verificación aprobada',
        paragraphs: [
          'Nos complace informarle que su verificación de inversionista acreditado ha sido aprobada.',
          'Ya puede continuar con oportunidades de inversión disponibles en su panel.',
          'Si tiene preguntas, nuestro equipo está a su disposición.',
        ],
        cta: { href: dashboardLink, label: 'Ir al panel' },
        footnotes: [
          'Esta aprobación otorga acceso a la plataforma según nuestra revisión. No constituye asesoría de inversión ni garantiza rendimientos.',
          'Gracias por confiar en Golden State Capital.',
        ],
      }),
      text: [
        'Golden State Capital — Verificación de inversionista acreditado aprobada',
        '',
        'Su verificación ha sido aprobada. Acceda a su panel:',
        dashboardLink,
        '',
        'Esta aprobación otorga acceso a la plataforma según nuestra revisión. No constituye asesoría de inversión ni garantiza rendimientos.',
      ].join('\n'),
    }
  }

  return {
    subject: 'Accredited investor verification approved | Golden State Capital',
    html: buildTransactionalEmail({
      locale: 'en',
      preheader: 'Your accredited investor documentation has been approved.',
      eyebrow: 'Accredited investor',
      heading: 'Verification approved',
      paragraphs: [
        'We are pleased to let you know that your accredited investor verification has been approved.',
        'You can now proceed with investment opportunities available through your dashboard.',
        'If you have any questions, our team is here to help.',
      ],
      cta: { href: dashboardLink, label: 'Go to dashboard' },
      footnotes: [
        'This approval grants platform access based on our review. It is not investment advice and does not guarantee returns.',
        'Thank you for choosing Golden State Capital.',
      ],
    }),
    text: [
      'Golden State Capital — Accredited investor verification approved',
      '',
      'Your verification has been approved. Access your dashboard:',
      dashboardLink,
      '',
      'This approval grants platform access based on our review. It is not investment advice and does not guarantee returns.',
    ].join('\n'),
  }
}

export function accreditationResubmitEmailContent({
  locale,
  accreditationLink,
  documentLabels,
  reviewNote,
}) {
  const footnotes = documentLabels.map((label) => `• ${label}`)

  if (reviewNote) {
    footnotes.push(
      locale === 'es' ? `Nota del equipo: ${reviewNote}` : `Note from our team: ${reviewNote}`
    )
  }

  if (locale === 'es') {
    return {
      subject: 'Actualice sus documentos de acreditación | Golden State Capital',
      html: buildTransactionalEmail({
        locale: 'es',
        preheader: 'Necesitamos que vuelva a cargar documentos específicos.',
        eyebrow: 'Inversionista acreditado',
        heading: 'Documentos por actualizar',
        paragraphs: [
          'Revisamos su verificación de inversionista acreditado y necesitamos que cargue versiones actualizadas de los documentos indicados a continuación.',
          'Solo debe volver a enviar los documentos solicitados. Cuando termine, nuestro equipo continuará con la revisión.',
        ],
        cta: { href: accreditationLink, label: 'Cargar documentos' },
        footnotes,
      }),
      text: [
        'Golden State Capital — Documentos por actualizar',
        '',
        'Vuelva a cargar los siguientes documentos:',
        ...documentLabels.map((label) => `- ${label}`),
        '',
        reviewNote ? `Nota del equipo: ${reviewNote}` : '',
        '',
        `Cargar documentos: ${accreditationLink}`,
      ]
        .filter(Boolean)
        .join('\n'),
    }
  }

  return {
    subject: 'Please update your accreditation documents | Golden State Capital',
    html: buildTransactionalEmail({
      locale: 'en',
      preheader: 'We need you to re-upload specific documents.',
      eyebrow: 'Accredited investor',
      heading: 'Documents to update',
      paragraphs: [
        'We reviewed your accredited investor verification and need you to upload updated versions of the documents listed below.',
        'You only need to re-submit the documents we have requested. Once complete, our team will continue the review.',
      ],
      cta: { href: accreditationLink, label: 'Upload documents' },
      footnotes,
    }),
    text: [
      'Golden State Capital — Documents to update',
      '',
      'Please re-upload the following documents:',
      ...documentLabels.map((label) => `- ${label}`),
      '',
      reviewNote ? `Note from our team: ${reviewNote}` : '',
      '',
      `Upload documents: ${accreditationLink}`,
    ]
      .filter(Boolean)
      .join('\n'),
  }
}

export function passwordResetEmailContent({ locale, link }) {
  if (locale === 'es') {
    return {
      subject: 'Restablecer contraseña | Golden State Capital',
      html: buildTransactionalEmail({
        locale: 'es',
        preheader: 'Solicitud para restablecer su contraseña.',
        eyebrow: 'Seguridad de la cuenta',
        heading: 'Restablecer contraseña',
        paragraphs: [
          'Recibimos una solicitud para restablecer la contraseña de su cuenta de inversionista.',
          'Si usted realizó esta solicitud, utilice el botón a continuación para elegir una nueva contraseña.',
        ],
        cta: { href: link, label: 'Restablecer contraseña' },
        footnotes: ['Este enlace expira en 1 hora.', 'Si no solicitó este cambio, ignore este correo.'],
      }),
      text: `Restablezca su contraseña visitando: ${link}\n\nEste enlace expira en 1 hora.`,
    }
  }

  return {
    subject: 'Reset your password | Golden State Capital',
    html: buildTransactionalEmail({
      locale: 'en',
      preheader: 'Password reset request for your investor account.',
      eyebrow: 'Account security',
      heading: 'Reset your password',
      paragraphs: [
        'We received a request to reset the password for your investor account.',
        'If you made this request, use the button below to choose a new password.',
      ],
      cta: { href: link, label: 'Reset password' },
      footnotes: ['This link expires in 1 hour.', 'If you did not request this change, please ignore this email.'],
    }),
    text: `Reset your password by visiting: ${link}\n\nThis link expires in 1 hour.`,
  }
}

export function meetingRequestedEmailContent({
  locale,
  propertyName,
  accountLink,
  investLink,
  channelLabel,
  amountLabel,
}) {
  if (locale === 'es') {
    return {
      subject: `Solicitud de inversión registrada — ${propertyName} | Golden State Capital`,
      html: buildTransactionalEmail({
        locale: 'es',
        preheader: 'Recibimos su solicitud de inversión.',
        eyebrow: 'Solicitud de inversión',
        heading: 'Solicitud de inversión guardada',
        paragraphs: [
          `Registramos su interés en invertir en ${propertyName}.`,
          amountLabel
            ? `Monto estimado indicado: ${amountLabel}.`
            : 'Nuestro equipo recibió su solicitud.',
          channelLabel
            ? `Modalidad seleccionada: ${channelLabel}. Abrir WhatsApp no confirma por sí solo una reunión; complete el mensaje ahí para coordinar.`
            : 'Abrir WhatsApp no confirma por sí solo una reunión.',
          'Puede seguir el estado en Mi cuenta → Solicitudes de inversión. La confirmación de depósito se habilita después de la reunión y cuando nuestro equipo lo apruebe para invertir.',
        ].filter(Boolean),
        cta: { href: accountLink, label: 'Ver solicitudes' },
        footnotes: [
          'Los datos bancarios nunca se envían por correo ni se muestran en la app.',
          'Gracias por confiar en Golden State Capital.',
        ],
      }),
      text: [
        'Golden State Capital — Solicitud de inversión guardada',
        '',
        `Propiedad: ${propertyName}`,
        amountLabel ? `Monto estimado: ${amountLabel}` : '',
        channelLabel ? `Modalidad: ${channelLabel}` : '',
        '',
        'Abrir WhatsApp no confirma una reunión por sí solo.',
        accountLink,
        investLink ? `Continuar: ${investLink}` : '',
      ]
        .filter(Boolean)
        .join('\n'),
    }
  }

  return {
    subject: `Investment request saved — ${propertyName} | Golden State Capital`,
    html: buildTransactionalEmail({
      locale: 'en',
      preheader: 'We received your investment request.',
      eyebrow: 'Investment request',
      heading: 'Investment request saved',
      paragraphs: [
        `We recorded your interest in investing in ${propertyName}.`,
        amountLabel
          ? `Intended amount noted: ${amountLabel}.`
          : 'Our team received your request.',
        channelLabel
          ? `Selected modality: ${channelLabel}. Opening WhatsApp does not by itself confirm a meeting — finish messaging there to arrange one.`
          : 'Opening WhatsApp does not by itself confirm a meeting.',
        'You can track status under My account → Investment requests. Deposit confirmation unlocks after your meeting and once our team approves you to invest.',
      ].filter(Boolean),
      cta: { href: accountLink, label: 'View requests' },
      footnotes: [
        'Bank and wire details are never emailed or shown in the app.',
        'Thank you for choosing Golden State Capital.',
      ],
    }),
    text: [
      'Golden State Capital — Investment request saved',
      '',
      `Property: ${propertyName}`,
      amountLabel ? `Intended amount: ${amountLabel}` : '',
      channelLabel ? `Modality: ${channelLabel}` : '',
      '',
      'Opening WhatsApp does not by itself confirm a meeting.',
      accountLink,
      investLink ? `Continue: ${investLink}` : '',
    ]
      .filter(Boolean)
      .join('\n'),
  }
}

export function awaitingWireEmailContent({
  locale,
  propertyName,
  investLink,
  accountLink,
}) {
  if (locale === 'es') {
    return {
      subject: `Listo para confirmar su depósito — ${propertyName} | Golden State Capital`,
      html: buildTransactionalEmail({
        locale: 'es',
        preheader: 'Nuestro equipo lo aprobó para continuar con el depósito.',
        eyebrow: 'Siguiente paso',
        heading: 'Puede confirmar su depósito',
        paragraphs: [
          `Nuestro equipo lo aprobó para continuar con la inversión en ${propertyName}.`,
          'Use únicamente las instrucciones de transferencia compartidas en su llamada o en persona. Luego abra la página de inversión y suba su comprobante.',
          'Los datos bancarios no se incluyen en este correo ni en la app.',
        ],
        cta: { href: investLink, label: 'Confirmar depósito' },
        footnotes: [
          'También puede ver el estado en Mi cuenta → Solicitudes de inversión.',
          'Gracias por confiar en Golden State Capital.',
        ],
      }),
      text: [
        'Golden State Capital — Listo para confirmar su depósito',
        '',
        `Propiedad: ${propertyName}`,
        investLink,
        accountLink,
      ].join('\n'),
    }
  }

  return {
    subject: `Ready to confirm your deposit — ${propertyName} | Golden State Capital`,
    html: buildTransactionalEmail({
      locale: 'en',
      preheader: 'Our team approved you to proceed with your deposit.',
      eyebrow: 'Next step',
      heading: 'You can confirm your deposit',
      paragraphs: [
        `Our team approved you to proceed with the investment in ${propertyName}.`,
        'Use only the wire instructions shared on your call or in person. Then open the invest page and upload your receipt.',
        'Bank details are not included in this email or in the app.',
      ],
      cta: { href: investLink, label: 'Confirm deposit' },
      footnotes: [
        'You can also track status under My account → Investment requests.',
        'Thank you for choosing Golden State Capital.',
      ],
    }),
    text: [
      'Golden State Capital — Ready to confirm your deposit',
      '',
      `Property: ${propertyName}`,
      investLink,
      accountLink,
    ].join('\n'),
  }
}
