import { buildTransactionalEmail } from '@/lib/email/emailTemplates'

const es = (locale) => locale === 'es'

function branded({ locale, subject, preheader, eyebrow, heading, paragraphs, cta, footnotes, text }) {
  const language = es(locale) ? 'es' : 'en'
  return {
    subject: `${subject} | Golden State Capital`,
    html: buildTransactionalEmail({
      locale: language,
      preheader,
      eyebrow,
      heading,
      paragraphs,
      cta,
      footnotes,
    }),
    text,
  }
}

export function accountRejectedEmailContent({ locale, contactLink }) {
  if (es(locale)) {
    return branded({
      locale,
      subject: 'Actualización sobre su solicitud de cuenta',
      preheader: 'Su solicitud de inversionista no fue aprobada en este momento.',
      eyebrow: 'Cuenta de inversionista',
      heading: 'Su solicitud no fue aprobada',
      paragraphs: [
        'Revisamos su solicitud de cuenta de inversionista y, en este momento, no podemos aprobarla.',
        'Si considera que se trata de un error o desea más información, puede escribirnos desde la página de contacto. Nuestro equipo le indicará los siguientes pasos.',
      ],
      cta: { href: contactLink, label: 'Contactar al equipo' },
      footnotes: ['Gracias por su interés en Golden State Capital.'],
      text: [
        'Golden State Capital — Su solicitud no fue aprobada',
        '',
        'En este momento no podemos aprobar su cuenta de inversionista.',
        'Si desea más información, escríbanos:',
        contactLink,
      ].join('\n'),
    })
  }

  return branded({
    locale,
    subject: 'Update on your account application',
    preheader: 'Your investor account application was not approved at this time.',
    eyebrow: 'Investor account',
    heading: 'Your application was not approved',
    paragraphs: [
      'We reviewed your investor account application and are unable to approve it at this time.',
      'If you believe this is a mistake or would like more information, you can reach us through the contact page. Our team will advise on next steps.',
    ],
    cta: { href: contactLink, label: 'Contact the team' },
    footnotes: ['Thank you for your interest in Golden State Capital.'],
    text: [
      'Golden State Capital — Your application was not approved',
      '',
      'We are unable to approve your investor account at this time.',
      'If you would like more information, contact us:',
      contactLink,
    ].join('\n'),
  })
}

export function accreditationRejectedEmailContent({ locale, accreditationLink, reviewNote }) {
  const noteLine = reviewNote
    ? es(locale)
      ? `Nota del equipo: ${reviewNote}`
      : `Note from our team: ${reviewNote}`
    : null

  if (es(locale)) {
    return branded({
      locale,
      subject: 'Verificación de inversionista acreditado no aprobada',
      preheader: 'Su verificación de inversionista acreditado no fue aprobada.',
      eyebrow: 'Inversionista acreditado',
      heading: 'Verificación no aprobada',
      paragraphs: [
        'Revisamos su documentación de inversionista acreditado y, en este momento, no podemos aprobarla.',
        'Puede revisar el estado en su cuenta. Si tiene preguntas, nuestro equipo está a su disposición.',
      ],
      cta: { href: accreditationLink, label: 'Ver acreditación' },
      footnotes: [noteLine, 'Esta decisión se refiere al acceso a la plataforma y no constituye asesoría de inversión.'].filter(
        Boolean
      ),
      text: [
        'Golden State Capital — Verificación no aprobada',
        '',
        'Su verificación de inversionista acreditado no fue aprobada.',
        noteLine,
        accreditationLink,
      ]
        .filter(Boolean)
        .join('\n'),
    })
  }

  return branded({
    locale,
    subject: 'Accredited investor verification not approved',
    preheader: 'Your accredited investor verification was not approved.',
    eyebrow: 'Accredited investor',
    heading: 'Verification not approved',
    paragraphs: [
      'We reviewed your accredited investor documentation and are unable to approve it at this time.',
      'You can review the status in your account. If you have questions, our team is here to help.',
    ],
    cta: { href: accreditationLink, label: 'View accreditation' },
    footnotes: [noteLine, 'This decision relates to platform access and is not investment advice.'].filter(Boolean),
    text: [
      'Golden State Capital — Verification not approved',
      '',
      'Your accredited investor verification was not approved.',
      noteLine,
      accreditationLink,
    ]
      .filter(Boolean)
      .join('\n'),
  })
}

export function depositConfirmedEmailContent({ locale, propertyName, amountLabel, portfolioLink }) {
  if (es(locale)) {
    return branded({
      locale,
      subject: `Depósito confirmado — ${propertyName}`,
      preheader: 'Su aporte fue confirmado y ya aparece en su portafolio.',
      eyebrow: 'Inversión',
      heading: 'Depósito confirmado',
      paragraphs: [
        `Confirmamos su depósito para ${propertyName}${amountLabel ? ` por ${amountLabel}` : ''}.`,
        'El aporte ya forma parte de su portafolio. Puede consultar documentos y el avance del proyecto desde su panel.',
      ],
      cta: { href: portfolioLink, label: 'Ver portafolio' },
      footnotes: ['Gracias por confiar en Golden State Capital.'],
      text: [
        'Golden State Capital — Depósito confirmado',
        '',
        `Propiedad: ${propertyName}`,
        amountLabel ? `Monto: ${amountLabel}` : '',
        portfolioLink,
      ]
        .filter(Boolean)
        .join('\n'),
    })
  }

  return branded({
    locale,
    subject: `Deposit confirmed — ${propertyName}`,
    preheader: 'Your contribution was confirmed and now appears in your portfolio.',
    eyebrow: 'Investment',
    heading: 'Deposit confirmed',
    paragraphs: [
      `We confirmed your deposit for ${propertyName}${amountLabel ? ` in the amount of ${amountLabel}` : ''}.`,
      'The contribution is now part of your portfolio. You can review documents and project progress from your dashboard.',
    ],
    cta: { href: portfolioLink, label: 'View portfolio' },
    footnotes: ['Thank you for choosing Golden State Capital.'],
    text: [
      'Golden State Capital — Deposit confirmed',
      '',
      `Property: ${propertyName}`,
      amountLabel ? `Amount: ${amountLabel}` : '',
      portfolioLink,
    ]
      .filter(Boolean)
      .join('\n'),
  })
}

export function depositRejectedEmailContent({ locale, propertyName, investLink, adminNote }) {
  const noteLine = adminNote
    ? es(locale)
      ? `Nota del equipo: ${adminNote}`
      : `Note from our team: ${adminNote}`
    : null

  if (es(locale)) {
    return branded({
      locale,
      subject: `Comprobante de depósito no confirmado — ${propertyName}`,
      preheader: 'Necesitamos que revise su comprobante de depósito.',
      eyebrow: 'Inversión',
      heading: 'No pudimos confirmar su depósito',
      paragraphs: [
        `Revisamos el comprobante enviado para ${propertyName} y no pudimos confirmarlo.`,
        'Puede volver a la página de inversión para cargar un comprobante actualizado. Use únicamente las instrucciones de transferencia compartidas en su llamada o en persona.',
      ],
      cta: { href: investLink, label: 'Actualizar comprobante' },
      footnotes: [noteLine, 'Los datos bancarios nunca se envían por correo ni se muestran en la app.'].filter(Boolean),
      text: [
        'Golden State Capital — Depósito no confirmado',
        '',
        `Propiedad: ${propertyName}`,
        noteLine,
        investLink,
      ]
        .filter(Boolean)
        .join('\n'),
    })
  }

  return branded({
    locale,
    subject: `Deposit proof not confirmed — ${propertyName}`,
    preheader: 'Please review and update your deposit proof.',
    eyebrow: 'Investment',
    heading: 'We could not confirm your deposit',
    paragraphs: [
      `We reviewed the proof submitted for ${propertyName} and could not confirm it.`,
      'You can return to the invest page to upload an updated receipt. Use only the wire instructions shared on your call or in person.',
    ],
    cta: { href: investLink, label: 'Update deposit proof' },
    footnotes: [noteLine, 'Bank and wire details are never emailed or shown in the app.'].filter(Boolean),
    text: [
      'Golden State Capital — Deposit not confirmed',
      '',
      `Property: ${propertyName}`,
      noteLine,
      investLink,
    ]
      .filter(Boolean)
      .join('\n'),
  })
}

export function contributionAssignedEmailContent({ locale, propertyName, amountLabel, portfolioLink }) {
  if (es(locale)) {
    return branded({
      locale,
      subject: `Inversión registrada — ${propertyName}`,
      preheader: 'Se registró un aporte a su nombre en el portafolio.',
      eyebrow: 'Portafolio',
      heading: 'Inversión registrada en su cuenta',
      paragraphs: [
        `Nuestro equipo registró un aporte a su nombre en ${propertyName}${amountLabel ? ` por ${amountLabel}` : ''}.`,
        'Ya puede verlo en su portafolio, junto con el avance y los documentos del proyecto cuando estén disponibles.',
      ],
      cta: { href: portfolioLink, label: 'Ver portafolio' },
      footnotes: ['Si no esperaba este movimiento, contacte a nuestro equipo.'],
      text: [
        'Golden State Capital — Inversión registrada',
        '',
        `Propiedad: ${propertyName}`,
        amountLabel ? `Monto: ${amountLabel}` : '',
        portfolioLink,
      ]
        .filter(Boolean)
        .join('\n'),
    })
  }

  return branded({
    locale,
    subject: `Investment recorded — ${propertyName}`,
    preheader: 'A contribution was recorded in your portfolio.',
    eyebrow: 'Portfolio',
    heading: 'An investment was recorded in your account',
    paragraphs: [
      `Our team recorded a contribution in your name for ${propertyName}${amountLabel ? ` in the amount of ${amountLabel}` : ''}.`,
      'It now appears in your portfolio, along with project progress and documents when they are available.',
    ],
    cta: { href: portfolioLink, label: 'View portfolio' },
    footnotes: ['If you did not expect this entry, please contact our team.'],
    text: [
      'Golden State Capital — Investment recorded',
      '',
      `Property: ${propertyName}`,
      amountLabel ? `Amount: ${amountLabel}` : '',
      portfolioLink,
    ]
      .filter(Boolean)
      .join('\n'),
  })
}

export function returnCreditedEmailContent({
  locale,
  propertyName,
  amountLabel,
  concept,
  walletLink,
}) {
  if (es(locale)) {
    return branded({
      locale,
      subject: `Retorno acreditado — ${propertyName}`,
      preheader: 'Se acreditó un retorno en su billetera de inversionista.',
      eyebrow: 'Retornos',
      heading: 'Retorno acreditado',
      paragraphs: [
        `Acreditamos ${amountLabel} en su billetera, asociado a ${propertyName}.`,
        concept ? `Concepto: ${concept}.` : 'El monto ya está disponible para retiro o reinversión, sujeto a revisión de nuestro equipo.',
        'Puede ver el movimiento y solicitar un retiro o una reinversión desde Actividad.',
      ].filter(Boolean),
      cta: { href: walletLink, label: 'Ver billetera' },
      footnotes: ['Los retornos acreditados no constituyen una garantía de resultados futuros.'],
      text: [
        'Golden State Capital — Retorno acreditado',
        '',
        `Propiedad: ${propertyName}`,
        `Monto: ${amountLabel}`,
        concept ? `Concepto: ${concept}` : '',
        walletLink,
      ]
        .filter(Boolean)
        .join('\n'),
    })
  }

  return branded({
    locale,
    subject: `Return credited — ${propertyName}`,
    preheader: 'A return was credited to your investor wallet.',
    eyebrow: 'Returns',
    heading: 'Return credited',
    paragraphs: [
      `We credited ${amountLabel} to your wallet, attributed to ${propertyName}.`,
      concept ? `Concept: ${concept}.` : 'The amount is available for cash-out or reinvestment, subject to our team’s review.',
      'You can review the activity and request a cash-out or reinvestment from Activity.',
    ].filter(Boolean),
    cta: { href: walletLink, label: 'View wallet' },
    footnotes: ['Credited returns are not a guarantee of future results.'],
    text: [
      'Golden State Capital — Return credited',
      '',
      `Property: ${propertyName}`,
      `Amount: ${amountLabel}`,
      concept ? `Concept: ${concept}` : '',
      walletLink,
    ]
      .filter(Boolean)
      .join('\n'),
  })
}

export function returnVoidedEmailContent({ locale, propertyName, amountLabel, walletLink }) {
  if (es(locale)) {
    return branded({
      locale,
      subject: `Ajuste en un retorno — ${propertyName}`,
      preheader: 'Un retorno previamente acreditado fue anulado.',
      eyebrow: 'Retornos',
      heading: 'Retorno anulado',
      paragraphs: [
        `Anulamos un retorno de ${amountLabel} asociado a ${propertyName}. El saldo disponible de su billetera se actualizó en consecuencia.`,
        'Puede revisar el detalle en Actividad. Si tiene preguntas, nuestro equipo está a su disposición.',
      ],
      cta: { href: walletLink, label: 'Ver actividad' },
      footnotes: ['Gracias por confiar en Golden State Capital.'],
      text: [
        'Golden State Capital — Retorno anulado',
        '',
        `Propiedad: ${propertyName}`,
        `Monto: ${amountLabel}`,
        walletLink,
      ].join('\n'),
    })
  }

  return branded({
    locale,
    subject: `Return adjustment — ${propertyName}`,
    preheader: 'A previously credited return was voided.',
    eyebrow: 'Returns',
    heading: 'Return voided',
    paragraphs: [
      `We voided a return of ${amountLabel} attributed to ${propertyName}. Your available wallet balance has been updated accordingly.`,
      'You can review the details in Activity. If you have questions, our team is here to help.',
    ],
    cta: { href: walletLink, label: 'View activity' },
    footnotes: ['Thank you for choosing Golden State Capital.'],
    text: [
      'Golden State Capital — Return voided',
      '',
      `Property: ${propertyName}`,
      `Amount: ${amountLabel}`,
      walletLink,
    ].join('\n'),
  })
}

export function cashOutReviewedEmailContent({ locale, confirmed, amountLabel, walletLink, adminNote }) {
  const noteLine = adminNote
    ? es(locale)
      ? `Nota del equipo: ${adminNote}`
      : `Note from our team: ${adminNote}`
    : null

  if (es(locale)) {
    return branded({
      locale,
      subject: confirmed ? 'Solicitud de retiro confirmada' : 'Solicitud de retiro no confirmada',
      preheader: confirmed
        ? 'Su solicitud de retiro fue confirmada.'
        : 'Su solicitud de retiro no fue confirmada.',
      eyebrow: 'Billetera',
      heading: confirmed ? 'Retiro confirmado' : 'Retiro no confirmado',
      paragraphs: confirmed
        ? [
            `Confirmamos su solicitud de retiro por ${amountLabel}.`,
            'El movimiento queda registrado en la actividad de su billetera, junto con el aviso bancario del pago. La liquidación usa las instrucciones ya compartidas con nuestro equipo.',
          ]
        : [
            `No pudimos confirmar su solicitud de retiro por ${amountLabel}. El monto vuelve a estar disponible en su billetera.`,
            'Puede revisar el estado en Actividad o enviar una nueva solicitud si corresponde.',
          ],
      cta: { href: walletLink, label: 'Ver billetera' },
      footnotes: [noteLine].filter(Boolean),
      text: [
        confirmed
          ? 'Golden State Capital — Retiro confirmado'
          : 'Golden State Capital — Retiro no confirmado',
        '',
        `Monto: ${amountLabel}`,
        noteLine,
        walletLink,
      ]
        .filter(Boolean)
        .join('\n'),
    })
  }

  return branded({
    locale,
    subject: confirmed ? 'Cash-out request confirmed' : 'Cash-out request not confirmed',
    preheader: confirmed
      ? 'Your cash-out request was confirmed.'
      : 'Your cash-out request was not confirmed.',
    eyebrow: 'Wallet',
    heading: confirmed ? 'Cash-out confirmed' : 'Cash-out not confirmed',
    paragraphs: confirmed
        ? [
          `We confirmed your cash-out request for ${amountLabel}.`,
          'The movement is recorded in your wallet activity, along with the bank notice for this payout. Settlement uses the instructions already shared with our team.',
        ]
      : [
          `We could not confirm your cash-out request for ${amountLabel}. The amount is available again in your wallet.`,
          'You can review the status in Activity or submit a new request if appropriate.',
        ],
    cta: { href: walletLink, label: 'View wallet' },
    footnotes: [noteLine].filter(Boolean),
    text: [
      confirmed
        ? 'Golden State Capital — Cash-out confirmed'
        : 'Golden State Capital — Cash-out not confirmed',
      '',
      `Amount: ${amountLabel}`,
      noteLine,
      walletLink,
    ]
      .filter(Boolean)
      .join('\n'),
  })
}

export function reinvestReviewedEmailContent({
  locale,
  confirmed,
  propertyName,
  amountLabel,
  activityLink,
  adminNote,
}) {
  const noteLine = adminNote
    ? es(locale)
      ? `Nota del equipo: ${adminNote}`
      : `Note from our team: ${adminNote}`
    : null

  if (es(locale)) {
    return branded({
      locale,
      subject: confirmed
        ? `Reinversión confirmada — ${propertyName}`
        : `Reinversión no confirmada — ${propertyName}`,
      preheader: confirmed
        ? 'Su reinversión fue confirmada y ya aparece en el portafolio.'
        : 'Su solicitud de reinversión no fue confirmada.',
      eyebrow: 'Reinversión',
      heading: confirmed ? 'Reinversión confirmada' : 'Reinversión no confirmada',
      paragraphs: confirmed
        ? [
            `Confirmamos su reinversión de ${amountLabel} en ${propertyName}.`,
            'El aporte ya forma parte de su portafolio. Puede seguir el estado en Actividad.',
          ]
        : [
            `No pudimos confirmar su reinversión de ${amountLabel} en ${propertyName}. El monto vuelve a estar disponible en su billetera.`,
            'Puede revisar el detalle en Actividad o enviar una nueva solicitud si hay propiedades abiertas.',
          ],
      cta: { href: activityLink, label: confirmed ? 'Ver portafolio y actividad' : 'Ver billetera' },
      footnotes: [noteLine].filter(Boolean),
      text: [
        confirmed
          ? 'Golden State Capital — Reinversión confirmada'
          : 'Golden State Capital — Reinversión no confirmada',
        '',
        `Propiedad: ${propertyName}`,
        `Monto: ${amountLabel}`,
        noteLine,
        activityLink,
      ]
        .filter(Boolean)
        .join('\n'),
    })
  }

  return branded({
    locale,
    subject: confirmed
      ? `Reinvestment confirmed — ${propertyName}`
      : `Reinvestment not confirmed — ${propertyName}`,
    preheader: confirmed
      ? 'Your reinvestment was confirmed and now appears in your portfolio.'
      : 'Your reinvestment request was not confirmed.',
    eyebrow: 'Reinvestment',
    heading: confirmed ? 'Reinvestment confirmed' : 'Reinvestment not confirmed',
    paragraphs: confirmed
      ? [
          `We confirmed your reinvestment of ${amountLabel} into ${propertyName}.`,
          'The contribution is now part of your portfolio. You can track status in Activity.',
        ]
      : [
          `We could not confirm your reinvestment of ${amountLabel} into ${propertyName}. The amount is available again in your wallet.`,
          'You can review the details in Activity or submit a new request if properties are open.',
        ],
    cta: { href: activityLink, label: confirmed ? 'View portfolio and activity' : 'View wallet' },
    footnotes: [noteLine].filter(Boolean),
    text: [
      confirmed
        ? 'Golden State Capital — Reinvestment confirmed'
        : 'Golden State Capital — Reinvestment not confirmed',
      '',
      `Property: ${propertyName}`,
      `Amount: ${amountLabel}`,
      noteLine,
      activityLink,
    ]
      .filter(Boolean)
      .join('\n'),
  })
}

export function propertyStatusUpdateEmailContent({
  locale,
  propertyName,
  fromLabel,
  toLabel,
  progressPercent,
  documentsLink,
}) {
  const percent = Number.isFinite(Number(progressPercent)) ? Number(progressPercent) : 0

  if (es(locale)) {
    return branded({
      locale,
      subject: `Actualización de estado — ${propertyName}`,
      preheader: `${propertyName} pasó de ${fromLabel} a ${toLabel}.`,
      eyebrow: 'Actualización del proyecto',
      heading: 'Cambio de estado del proyecto',
      paragraphs: [
        `El estado de ${propertyName} cambió de ${fromLabel} a ${toLabel}.`,
        `El avance de obra está actualmente en ${percent}%.`,
        'Puede revisar los documentos del proyecto en su portafolio.',
      ],
      cta: { href: documentsLink, label: 'Ver documentos del proyecto' },
      footnotes: ['Este aviso se envía a inversionistas con participación activa en el proyecto.'],
      text: [
        'Golden State Capital — Actualización de estado',
        '',
        `Propiedad: ${propertyName}`,
        `Estado: ${fromLabel} → ${toLabel}`,
        `Avance: ${percent}%`,
        documentsLink,
      ].join('\n'),
    })
  }

  return branded({
    locale,
    subject: `Status update — ${propertyName}`,
    preheader: `${propertyName} moved from ${fromLabel} to ${toLabel}.`,
    eyebrow: 'Project update',
    heading: 'Project status change',
    paragraphs: [
      `The status of ${propertyName} changed from ${fromLabel} to ${toLabel}.`,
      `Construction progress is currently at ${percent}%.`,
      'You can review project documents in your portfolio.',
    ],
    cta: { href: documentsLink, label: 'View project documents' },
    footnotes: ['This notice is sent to investors with an active holding in the project.'],
    text: [
      'Golden State Capital — Status update',
      '',
      `Property: ${propertyName}`,
      `Status: ${fromLabel} → ${toLabel}`,
      `Progress: ${percent}%`,
      documentsLink,
    ].join('\n'),
  })
}

export function propertyDocumentsUpdateEmailContent({
  locale,
  propertyName,
  documentCount,
  kindLabels,
  progressPercent,
  documentsLink,
}) {
  const count = Number(documentCount) || 0
  const kinds = Array.isArray(kindLabels) && kindLabels.length
    ? kindLabels.join(', ')
    : es(locale)
      ? 'documentos del proyecto'
      : 'project documents'
  const percent = Number.isFinite(Number(progressPercent)) ? Number(progressPercent) : 0

  if (es(locale)) {
    return branded({
      locale,
      subject: `Nuevos documentos — ${propertyName}`,
      preheader: `Se compartieron ${count} documento${count === 1 ? '' : 's'} de ${propertyName}.`,
      eyebrow: 'Documentos del proyecto',
      heading: 'Nuevos documentos disponibles',
      paragraphs: [
        `Compartimos ${count} documento${count === 1 ? '' : 's'} nuevo${count === 1 ? '' : 's'} de ${propertyName}.`,
        `Tipos: ${kinds}.`,
        `El avance de obra está actualmente en ${percent}%.`,
      ],
      cta: { href: documentsLink, label: 'Ver documentos' },
      footnotes: ['Este aviso se envía a inversionistas con participación activa en el proyecto.'],
      text: [
        'Golden State Capital — Nuevos documentos',
        '',
        `Propiedad: ${propertyName}`,
        `Documentos: ${count}`,
        `Tipos: ${kinds}`,
        `Avance: ${percent}%`,
        documentsLink,
      ].join('\n'),
    })
  }

  return branded({
    locale,
    subject: `New documents — ${propertyName}`,
    preheader: `${count} new document${count === 1 ? '' : 's'} ${count === 1 ? 'was' : 'were'} shared for ${propertyName}.`,
    eyebrow: 'Project documents',
    heading: 'New documents available',
    paragraphs: [
      `We shared ${count} new document${count === 1 ? '' : 's'} for ${propertyName}.`,
      `Types: ${kinds}.`,
      `Construction progress is currently at ${percent}%.`,
    ],
    cta: { href: documentsLink, label: 'View documents' },
    footnotes: ['This notice is sent to investors with an active holding in the project.'],
    text: [
      'Golden State Capital — New documents',
      '',
      `Property: ${propertyName}`,
      `Documents: ${count}`,
      `Types: ${kinds}`,
      `Progress: ${percent}%`,
      documentsLink,
    ].join('\n'),
  })
}

export function investmentRequestCancelledEmailContent({ locale, propertyName, activityLink }) {
  if (es(locale)) {
    return branded({
      locale,
      subject: `Solicitud de inversión cancelada — ${propertyName}`,
      preheader: 'Nuestro equipo canceló su solicitud de inversión.',
      eyebrow: 'Solicitud de inversión',
      heading: 'Solicitud cancelada',
      paragraphs: [
        `Nuestro equipo canceló su solicitud de inversión en ${propertyName}.`,
        'Puede revisar el estado en Actividad. Si aún desea participar, puede iniciar una nueva solicitud cuando la propiedad esté abierta.',
      ],
      cta: { href: activityLink, label: 'Ver solicitudes' },
      footnotes: ['Si tiene preguntas, nuestro equipo está a su disposición.'],
      text: [
        'Golden State Capital — Solicitud cancelada',
        '',
        `Propiedad: ${propertyName}`,
        activityLink,
      ].join('\n'),
    })
  }

  return branded({
    locale,
    subject: `Investment request cancelled — ${propertyName}`,
    preheader: 'Our team cancelled your investment request.',
    eyebrow: 'Investment request',
    heading: 'Request cancelled',
    paragraphs: [
      `Our team cancelled your investment request for ${propertyName}.`,
      'You can review the status in Activity. If you still wish to participate, you may start a new request while the property is open.',
    ],
    cta: { href: activityLink, label: 'View requests' },
    footnotes: ['If you have questions, our team is here to help.'],
    text: [
      'Golden State Capital — Request cancelled',
      '',
      `Property: ${propertyName}`,
      activityLink,
    ].join('\n'),
  })
}

export function passwordChangedEmailContent({ locale, contactLink }) {
  if (es(locale)) {
    return branded({
      locale,
      subject: 'Su contraseña fue actualizada',
      preheader: 'Confirmación de cambio de contraseña en su cuenta de inversionista.',
      eyebrow: 'Seguridad de la cuenta',
      heading: 'Contraseña actualizada',
      paragraphs: [
        'La contraseña de su cuenta de inversionista en Golden State Capital acaba de cambiarse.',
        'Si usted realizó este cambio, no necesita hacer nada más.',
        'Si no cambió su contraseña, contacte a nuestro equipo de inmediato para proteger su cuenta.',
      ],
      cta: { href: contactLink, label: 'Contactar al equipo' },
      footnotes: ['Nunca le pediremos su contraseña por correo.'],
      text: [
        'Golden State Capital — Contraseña actualizada',
        '',
        'La contraseña de su cuenta de inversionista acaba de cambiarse.',
        'Si no realizó este cambio, escríbanos de inmediato:',
        contactLink,
      ].join('\n'),
    })
  }

  return branded({
    locale,
    subject: 'Your password was updated',
    preheader: 'Confirmation that the password on your investor account was changed.',
    eyebrow: 'Account security',
    heading: 'Password updated',
    paragraphs: [
      'The password on your Golden State Capital investor account was just changed.',
      'If you made this change, no further action is needed.',
      'If you did not change your password, contact our team immediately so we can help secure your account.',
    ],
    cta: { href: contactLink, label: 'Contact the team' },
    footnotes: ['We will never ask for your password by email.'],
    text: [
      'Golden State Capital — Password updated',
      '',
      'The password on your investor account was just changed.',
      'If you did not make this change, contact us immediately:',
      contactLink,
    ].join('\n'),
  })
}

