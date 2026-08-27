const isDev = process.env.NODE_ENV !== 'production'

const cspDirectives = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' blob:${isDev ? " 'unsafe-eval'" : ''} https://calendly.com https://assets.calendly.com`,
  "style-src 'self' 'unsafe-inline' https://assets.calendly.com",
  "img-src 'self' blob: data: https:",
  "font-src 'self' data: https://assets.calendly.com",
  `connect-src 'self' https://accounts.google.com https://www.googleapis.com https://calendly.com https://assets.calendly.com${isDev ? ' ws: wss:' : ''}`,
  "frame-src 'self' https://accounts.google.com https://calendly.com https://www.youtube.com https://youtube.com https://www.youtube-nocookie.com https://player.vimeo.com",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "worker-src 'self' blob:",
  "base-uri 'self'",
  "form-action 'self' https://accounts.google.com",
]

if (!isDev) {
  cspDirectives.push('upgrade-insecure-requests')
}

export const CONTENT_SECURITY_POLICY = cspDirectives.join('; ')

export const SECURITY_HEADERS = [
  { key: 'Content-Security-Policy', value: CONTENT_SECURITY_POLICY },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
]

// Private document streams are rendered inside the app's preview iframe. They
// may be framed only by this same origin; all other routes remain DENY/none.
export const SAME_ORIGIN_DOCUMENT_HEADERS = [
  { key: 'Content-Security-Policy', value: "default-src 'none'; frame-ancestors 'self'" },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
]

// Content-editor previews run the normal application UI inside a same-origin
// iframe, so retain the full page policy while allowing only this site to frame it.
export const SAME_ORIGIN_PREVIEW_HEADERS = SECURITY_HEADERS.map((header) => {
  if (header.key === 'Content-Security-Policy') {
    return {
      ...header,
      value: CONTENT_SECURITY_POLICY.replace("frame-ancestors 'none'", "frame-ancestors 'self'"),
    }
  }
  if (header.key === 'X-Frame-Options') return { ...header, value: 'SAMEORIGIN' }
  return header
})
