import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { getServerSession } from "next-auth"
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

import "./globals.css"

import SessionProvider from "../components/SessionProvider"
import NavMenuServer from "../components/NavMenuServer"
import FooterServer from "../components/FooterServer"
import { MessagingProvider } from "@/components/Messaging/MessagingProvider"

export const metadata = {
  title: 'Golden State Capital',
  description:
    'Premium California real estate investment opportunities from Golden State Capital Management.',
  applicationName: 'Golden State Capital',
  appleWebApp: {
    capable: true,
    title: 'Golden State Capital',
    statusBarStyle: 'default',
  },
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0d2642',
}

export default async function RootLayout({ children, params }) {
  const { locale } = await params
  const session = await getServerSession(authOptions)

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)
  const messages = await getMessages()

  return (
    <html lang={locale} className="h-full">
      <body className="flex min-h-full flex-col antialiased">
        <SessionProvider session={session}>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <MessagingProvider>
              <NavMenuServer session={session} />
              <main className="flex flex-1 flex-col pt-[76px]">
                <div id="content" className="flex flex-1 flex-col">
                  {children}
                </div>
                <FooterServer />
              </main>
            </MessagingProvider>
          </NextIntlClientProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
