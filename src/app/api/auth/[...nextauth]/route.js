import NextAuth from 'next-auth'
import GithubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs'

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const authOptions = {
  session: {
    strategy: 'jwt'
  },
  // Configure one or more authentication providers
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, req) {
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (user) {
          const passwordCorrect = await compare(credentials.password, user.password)

          if (passwordCorrect) {
            return {
              id: user.id,
              email: user.email,
              type: user.type
            }
          }

          return null
        }

        return null
      }
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    })
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // Initial sign in
      if (user) {
        token.type = user.type;
      } else if (token.email && typeof token.type === 'undefined') {
        // For OAuth, fetch user type from DB if not present
        const dbUser = await prisma.user.findUnique({ where: { email: token.email } });
        if (dbUser) {
          token.type = dbUser.type;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.type = token.type;
      }
      return session;
    }
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }