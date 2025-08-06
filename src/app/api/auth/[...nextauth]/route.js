import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
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
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  ],
  callbacks: {
    async signIn({ account, profile }) {
      // Verify Google users have verified emails
      if (account?.provider === "google") {
        console.log('🔍 Google sign-in - email_verified:', profile.email_verified);
        
        // Create Google user in database if they don't exist
        console.log('🚀 Checking/Creating Google user:', profile.email);
        let dbUser = await prisma.user.findUnique({ where: { email: profile.email } });
        
        if (dbUser) {
          console.log('✅ Found existing user:', dbUser.email, 'Type:', dbUser.type);
        } else {
          console.log('❌ No existing user found, creating new Google user:', profile.email);
          try {
            dbUser = await prisma.user.create({
              data: {
                email: profile.email,
                password: null, // OAuth users don't need password
                type: 'INVESTOR', // Default type for Google users
                provider: 'google'
              }
            });
            console.log('✅ Created Google user:', dbUser.email, 'as INVESTOR');
          } catch (error) {
            console.error('❌ Error creating Google user:', error);
            return false; // Prevent sign-in if user creation fails
          }
        }
        
        // Temporarily disable email verification for testing
        // return profile.email_verified === true;
        return true;
      }
      return true; // Allow other providers
    },
    async jwt({ token, user, account, profile }) {
      // Initial sign in
      if (user) {
        token.type = user.type;
        token.userId = user.id;
        console.log('🔐 Credential sign-in - user type:', user.type, 'user ID:', user.id);
      } else if (token.email && typeof token.type === 'undefined') {
        // For subsequent requests, fetch user type from DB if not present
        console.log('🔍 Checking for existing user (subsequent request):', token.email);
        let dbUser = await prisma.user.findUnique({ where: { email: token.email } });
        
        if (dbUser) {
          console.log('✅ Found existing user:', dbUser.email, 'Type:', dbUser.type);
          token.type = dbUser.type;
          token.userId = dbUser.id;
        } else {
          console.log('❌ No existing user found for:', token.email);
        }
      }
      return token;
    },
    async session({ session, token }) {
      console.log('🔐 Session callback - token:', { email: token.email, type: token.type, userId: token.userId });
      if (session.user) {
        session.user.type = token.type;
        session.user.id = token.userId; // Add DB user ID to session
        console.log('📋 Updated session with user type:', token.type, 'and ID:', token.userId);
      }
      return session;
    }
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }