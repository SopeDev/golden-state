"use client"
import { SessionProvider } from "next-auth/react"

export default function AppSessionProvider({ children, session }) {
  return (
    <SessionProvider session={session} refetchInterval={30} refetchOnWindowFocus>
      {children}
    </SessionProvider>
  )
}