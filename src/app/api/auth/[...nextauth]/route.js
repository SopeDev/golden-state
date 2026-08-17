import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { sessionUserSelect } from '@/lib/auth/prismaUserSelect'
import {
  consumeRateLimit,
  enforceRateLimit,
  RATE_LIMITS,
} from '@/lib/security/rateLimit'

const prisma = new PrismaClient()

const mapDbUserToToken = (dbUser) => ({
  id: dbUser.id,
  email: dbUser.email,
  type: dbUser.type,
  provider: dbUser.provider || 'credentials',
  accountStatus: dbUser.accountStatus,
  accreditedStatus: dbUser.accreditedStatus,
  profileComplete: Boolean(dbUser.profile?.completedAt),
  emailVerified: Boolean(dbUser.emailVerifiedAt) || dbUser.provider === 'google',
  sessionEpoch: dbUser.sessionEpoch ?? 0,
})

export const authOptions = {
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = credentials.email.trim().toLowerCase()
        const emailLimit = consumeRateLimit(
          `login-email:${email}`,
          RATE_LIMITS.loginEmail.limit,
          RATE_LIMITS.loginEmail.windowMs
        )
        if (!emailLimit.ok) {
          return null
        }

        const user = await prisma.user.findUnique({ where: { email } })

        if (!user || !user.password) {
          return null
        }

        const passwordCorrect = await compare(credentials.password, user.password)
        if (!passwordCorrect) {
          return null
        }

        return mapDbUserToToken(user)
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== 'google' || !profile?.email) {
        return true
      }

      const email = profile.email.toLowerCase()
      let dbUser = await prisma.user.findUnique({ where: { email } })

      if (!dbUser) {
        const emailVerified = profile.email_verified === true
        try {
          dbUser = await prisma.user.create({
            data: {
              email,
              password: null,
              type: 'INVESTOR',
              provider: 'google',
              accountStatus: emailVerified ? 'PENDING_ADMIN' : 'PENDING_EMAIL',
              emailVerifiedAt: emailVerified ? new Date() : null,
            },
          })
        } catch {
          return false
        }
      }

      return true
    },
    async jwt({ token, user }) {
      if (user?.email && !token.email) {
        token.email = user.email
      }

      if (!token.email) {
        return { invalid: true }
      }

      const dbUser = await prisma.user.findUnique({
        where: { email: token.email },
        select: sessionUserSelect,
      })

      if (!dbUser) {
        return { invalid: true }
      }

      const currentEpoch = dbUser.sessionEpoch ?? 0

      if (user) {
        token.sessionEpoch = currentEpoch
      } else if ((token.sessionEpoch ?? 0) !== currentEpoch) {
        return { invalid: true }
      }

      const mapped = mapDbUserToToken(dbUser)
      token.type = mapped.type
      token.userId = mapped.id
      token.provider = mapped.provider
      token.accountStatus = mapped.accountStatus
      token.accreditedStatus = mapped.accreditedStatus
      token.profileComplete = mapped.profileComplete
      token.emailVerified = mapped.emailVerified
      token.invalid = false

      return token
    },
    async session({ session, token }) {
      if (token.invalid || !token.userId) {
        return { ...session, user: undefined }
      }

      if (session.user) {
        session.user.type = token.type
        session.user.id = token.userId
        session.user.provider = token.provider
        session.user.accountStatus = token.accountStatus
        session.user.accreditedStatus = token.accreditedStatus
        session.user.profileComplete = token.profileComplete
        session.user.emailVerified = token.emailVerified
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      if (!url || url.includes('undefined')) {
        return baseUrl
      }
      if (url.startsWith(baseUrl)) return url
      if (url.startsWith('/')) return `${baseUrl}${url}`
      return baseUrl
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET }

export async function POST(request, context) {
  const pathname = new URL(request.url).pathname
  const isCredentials =
    pathname.includes('callback/credentials') || pathname.includes('/signin')
  const limited = enforceRateLimit(
    request,
    isCredentials ? 'auth-credentials' : 'auth-post',
    isCredentials ? RATE_LIMITS.loginIp : RATE_LIMITS.authPost
  )
  if (limited) return limited
  return handler(request, context)
}
