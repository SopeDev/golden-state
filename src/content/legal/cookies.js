export const cookiesEn = {
  metaTitle: 'Cookie Policy | Golden State Capital Management',
  metaDescription:
    'How Golden State Capital Management uses cookies and similar technologies, including session, language, authentication, and analytics cookies.',
  heroEyebrow: 'Legal',
  heroTitle: 'Cookie Policy',
  heroSubtitle:
    'This Policy explains the cookies and similar technologies we use on the Platform, why we use them, and how you can control them.',
  lastUpdated: 'August 17, 2026',
  intro:
    'This Cookie Policy supplements our Privacy Policy and, for Mexican data subjects, our Aviso de Privacidad. By continuing to use the Platform, you agree to the use of cookies as described here, except where applicable law requires a separate consent for non-essential cookies.',
  sections: [
    {
      id: 'what',
      title: '1. What cookies are',
      blocks: [
        {
          type: 'p',
          text: `Cookies are small text files stored on your device when you visit a website. They help the site remember your session, preferences, and (when analytics are enabled) how the site is used. Similar technologies include local storage and pixels.`,
        },
      ],
    },
    {
      id: 'who',
      title: '2. Who sets cookies',
      blocks: [
        {
          type: 'p',
          text: `**First-party cookies** are set by Golden State. **Third-party cookies** may be set by providers such as Google if you use Google sign-in or if analytics is enabled. WhatsApp and other sites you open from a link set their own cookies under their policies; those are not Golden State cookies.`,
        },
      ],
    },
    {
      id: 'types',
      title: '3. Types of cookies we use',
      blocks: [
        {
          type: 'p',
          text: `We group cookies as follows:`,
        },
        {
          type: 'ul',
          items: [
            `**Strictly necessary.** Required to operate the Platform: security, sign-in, load balancing, and remembering that you are in a session. The site cannot function properly without these.`,
            `**Preferences.** Remember choices such as language (NEXT_LOCALE). These are treated as reasonably necessary to deliver the bilingual site you requested.`,
            `**Analytics (when enabled).** Help us understand visits and navigation (for example Google Analytics 4). These are not required to use the core Platform. When a measurement ID is configured, GA4 cookies such as _ga and _ga_* may be set. We will update this table if cookie names or providers change.`,
          ],
        },
        {
          type: 'p',
          text: `We do not currently use advertising or cross-context behavioral advertising cookies.`,
        },
      ],
    },
    {
      id: 'table',
      title: '4. Cookies and similar technologies in use',
      blocks: [
        {
          type: 'p',
          text: `The following describes cookies and similar items we expect to use. Exact names may vary slightly by environment (development vs. production) and by our authentication provider.`,
        },
        {
          type: 'table',
          headers: ['Name / type', 'Provider', 'Purpose', 'Duration'],
          rows: [
            [
              'Authentication session cookies (for example next-auth.session-token or the secure equivalent)',
              'Golden State',
              'Keep you signed in and associate requests with your account',
              'Session or as configured by the authentication service (typically session or a limited number of days)',
            ],
            [
              'CSRF / callback cookies used during sign-in',
              'Golden State',
              'Protect the sign-in flow against cross-site request forgery',
              'Session or short-lived during the sign-in flow',
            ],
            [
              'NEXT_LOCALE',
              'Golden State',
              'Remember your English or Spanish language choice after the first visit',
              'Approximately 1 year',
            ],
            [
              'Language / locale detection on first visit',
              'Golden State',
              'Infer an initial language from Accept-Language (and related signals). This may use the request, not a marketing cookie',
              'Until you choose a language; then NEXT_LOCALE persists the choice',
            ],
            [
              'Google Analytics cookies (for example _ga, _ga_*) — when analytics is enabled',
              'Google',
              'Measure visits, pages, and aggregated usage of the public site',
              'Up to 2 years, depending on Google’s configuration at the time we enable it',
            ],
            [
              'Google account cookies',
              'Google',
              'If you choose "Continue with Google," Google sets its own cookies on google.com properties under Google’s policies',
              'Determined by Google',
            ],
          ],
        },
        {
          type: 'p',
          text: `We do not use cookies to sell your personal information or to serve third-party ads on this Platform.`,
        },
      ],
    },
    {
      id: 'control',
      title: '5. How you can control cookies',
      blocks: [
        {
          type: 'p',
          text: `You can control cookies through your browser settings (block, delete, or alert). Blocking strictly necessary cookies may prevent sign-in, language persistence, or other core features.`,
        },
        {
          type: 'p',
          text: `You can change language at any time using the language toggle in the header or footer; that updates NEXT_LOCALE.`,
        },
        {
          type: 'p',
          text: `When Google Analytics is enabled, Google may offer opt-out tools (including browser add-ons) described in Google's documentation. If we add a consent banner for non-essential cookies, that banner will be the primary in-product control.`,
        },
        {
          type: 'p',
          text: `Do-Not-Track signals are not consistently implemented across browsers. We currently do not respond to DNT as a substitute for the controls above.`,
        },
      ],
    },
    {
      id: 'updates',
      title: '6. Updates',
      blocks: [
        {
          type: 'p',
          text: `We may update this Policy when we add analytics, change providers, or change how cookies work. The "Last updated" date will change when we do. Material changes may also be noted in the [Privacy Policy](/privacy).`,
        },
      ],
    },
    {
      id: 'contact',
      title: '7. Contact',
      blocks: [
        {
          type: 'p',
          text: `Questions: Golden State Capital Management, 401 B Street, Suite 1850, San Diego, CA 92101, United States. [investors@goldenstatecap.com](mailto:investors@goldenstatecap.com). +1 (619) 769-4155. See also [Privacy Policy](/privacy) and [Aviso de Privacidad](/aviso-de-privacidad).`,
        },
      ],
    },
  ],
}

export const cookiesEs = {
  metaTitle: 'Política de Cookies | Golden State Capital Management',
  metaDescription:
    'Cómo Golden State Capital Management usa cookies y tecnologías similares, incluidas cookies de sesión, idioma, autenticación y analítica.',
  heroEyebrow: 'Legal',
  heroTitle: 'Política de Cookies',
  heroSubtitle:
    'Esta Política explica las cookies y tecnologías similares que usamos en la Plataforma, para qué las usamos y cómo puede controlarlas.',
  lastUpdated: '17 de agosto de 2026',
  intro:
    'Esta Política de Cookies complementa nuestra Política de Privacidad y, para titulares en México, nuestro Aviso de Privacidad. Al continuar usando la Plataforma, usted acepta el uso de cookies aquí descrito, salvo cuando la ley aplicable exija un consentimiento separado para cookies no esenciales.',
  sections: [
    {
      id: 'what',
      title: '1. Qué son las cookies',
      blocks: [
        {
          type: 'p',
          text: `Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita un sitio. Ayudan a recordar su sesión, preferencias y (cuando la analítica está habilitada) cómo se usa el sitio. Tecnologías similares incluyen el almacenamiento local y los píxeles.`,
        },
      ],
    },
    {
      id: 'who',
      title: '2. Quién establece las cookies',
      blocks: [
        {
          type: 'p',
          text: `Las **cookies de primera parte** las establece Golden State. Las **cookies de terceros** pueden ser establecidas por proveedores como Google si usa inicio de sesión con Google o si la analítica está habilitada. WhatsApp y otros sitios que abra desde un enlace establecen sus propias cookies bajo sus políticas; esas no son cookies de Golden State.`,
        },
      ],
    },
    {
      id: 'types',
      title: '3. Tipos de cookies que usamos',
      blocks: [
        {
          type: 'p',
          text: `Agrupamos las cookies así:`,
        },
        {
          type: 'ul',
          items: [
            `**Estrictamente necesarias.** Requeridas para operar la Plataforma: seguridad, inicio de sesión, balanceo de carga y recordar que está en una sesión. El sitio no puede funcionar correctamente sin ellas.`,
            `**Preferencias.** Recuerdan elecciones como el idioma (NEXT_LOCALE). Las tratamos como razonablemente necesarias para entregar el sitio bilingüe que usted solicita.`,
            `**Analítica (cuando esté habilitada).** Nos ayudan a entender visitas y navegación (por ejemplo Google Analytics 4). No son necesarias para usar el núcleo de la Plataforma. Cuando hay un identificador de medición configurado, pueden establecerse cookies de GA4 como _ga y _ga_*. Actualizaremos esta tabla si cambian nombres o proveedores.`,
          ],
        },
        {
          type: 'p',
          text: `No usamos actualmente cookies de publicidad ni de publicidad conductual de contexto cruzado.`,
        },
      ],
    },
    {
      id: 'table',
      title: '4. Cookies y tecnologías similares en uso',
      blocks: [
        {
          type: 'p',
          text: `Lo siguiente describe cookies y elementos similares que esperamos usar. Los nombres exactos pueden variar ligeramente según el entorno (desarrollo vs. producción) y el proveedor de autenticación.`,
        },
        {
          type: 'table',
          headers: ['Nombre / tipo', 'Proveedor', 'Finalidad', 'Duración'],
          rows: [
            [
              'Cookies de sesión de autenticación (por ejemplo next-auth.session-token o el equivalente seguro)',
              'Golden State',
              'Mantenerle conectado y asociar solicitudes a su cuenta',
              'Sesión o según configure el servicio de autenticación (habitualmente sesión o un número limitado de días)',
            ],
            [
              'Cookies CSRF / de callback usadas durante el inicio de sesión',
              'Golden State',
              'Proteger el flujo de inicio de sesión contra falsificación de solicitudes entre sitios',
              'Sesión o de corta duración durante el flujo de inicio de sesión',
            ],
            [
              'NEXT_LOCALE',
              'Golden State',
              'Recordar su elección de idioma (inglés o español) después de la primera visita',
              'Aproximadamente 1 año',
            ],
            [
              'Detección de idioma / locale en la primera visita',
              'Golden State',
              'Inferir un idioma inicial a partir de Accept-Language (y señales relacionadas). Puede usar la solicitud, no una cookie de marketing',
              'Hasta que elija un idioma; entonces NEXT_LOCALE persiste la elección',
            ],
            [
              'Cookies de Google Analytics (por ejemplo _ga, _ga_*) — cuando la analítica esté habilitada',
              'Google',
              'Medir visitas, páginas y uso agregado del sitio público',
              'Hasta 2 años, según la configuración de Google cuando las habilitemos',
            ],
            [
              'Cookies de cuenta de Google',
              'Google',
              'Si elige "Continuar con Google," Google establece sus propias cookies en propiedades de google.com bajo las políticas de Google',
              'Determinada por Google',
            ],
          ],
        },
        {
          type: 'p',
          text: `No usamos cookies para vender su información personal ni para mostrar anuncios de terceros en esta Plataforma.`,
        },
      ],
    },
    {
      id: 'control',
      title: '5. Cómo puede controlar las cookies',
      blocks: [
        {
          type: 'p',
          text: `Puede controlar las cookies en la configuración de su navegador (bloquear, eliminar o alertar). Bloquear cookies estrictamente necesarias puede impedir el inicio de sesión, la persistencia del idioma u otras funciones centrales.`,
        },
        {
          type: 'p',
          text: `Puede cambiar el idioma en cualquier momento con el selector del encabezado o del pie; eso actualiza NEXT_LOCALE.`,
        },
        {
          type: 'p',
          text: `Cuando Google Analytics esté habilitado, Google puede ofrecer herramientas de exclusión (incluidos complementos del navegador) descritas en su documentación. Si añadimos un banner de consentimiento para cookies no esenciales, ese banner será el control principal dentro del producto.`,
        },
        {
          type: 'p',
          text: `Las señales Do-Not-Track no se implementan de forma uniforme entre navegadores. Actualmente no respondemos a DNT como sustituto de los controles anteriores.`,
        },
      ],
    },
    {
      id: 'updates',
      title: '6. Actualizaciones',
      blocks: [
        {
          type: 'p',
          text: `Podemos actualizar esta Política cuando añadamos analítica, cambiemos de proveedor o cambiemos el funcionamiento de las cookies. La fecha de "Última actualización" cambiará cuando lo hagamos. Los cambios materiales también pueden indicarse en la [Política de Privacidad](/privacy).`,
        },
      ],
    },
    {
      id: 'contact',
      title: '7. Contacto',
      blocks: [
        {
          type: 'p',
          text: `Preguntas: Golden State Capital Management, 401 B Street, Suite 1850, San Diego, CA 92101, Estados Unidos. [investors@goldenstatecap.com](mailto:investors@goldenstatecap.com). +1 (619) 769-4155. Véase también la [Política de Privacidad](/privacy) y el [Aviso de Privacidad](/aviso-de-privacidad).`,
        },
      ],
    },
  ],
}

export const cookiesContent = {
  en: cookiesEn,
  es: cookiesEs,
}
