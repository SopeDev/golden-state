'use client'

import { useEffect } from 'react'
import Script from 'next/script'
import { usePathname } from 'next/navigation'

export default function GoogleAnalytics({ gaId }) {
  const pathname = usePathname()

  useEffect(() => {
    if (!gaId || typeof window.gtag !== 'function') return

    window.gtag('config', gaId, {
      page_path: pathname,
      ...(process.env.NODE_ENV === 'development' ? { debug_mode: true } : {}),
    })
  }, [gaId, pathname])

  if (!gaId) return null

  const debugConfig =
    process.env.NODE_ENV === 'development' ? ", { debug_mode: true }" : ''

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${gaId}'${debugConfig});
        `}
      </Script>
    </>
  )
}
