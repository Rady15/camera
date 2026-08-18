import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from '@/lib/db'
import { compare } from 'bcryptjs'
import { Adapter } from 'next-auth/adapters'

/**
 * Custom Prisma Adapter for NextAuth
 * Implements the Adapter interface for database operations
 */
export function PrismaAdapter(): Adapter {
  return {
    async createUser(user) {
      const created = await db.user.create({
        data: {
          email: user.email!,
          name: user.name ?? 'User',
          avatar: user.image,
          role: 'customer',
          emailVerified: user.emailVerified,
        },
      })
      return {
        id: created.id,
        email: created.email,
        name: created.name,
        image: created.avatar,
        avatar: created.avatar,
        role: created.role,
        emailVerified: created.emailVerified,
      }
    },
    async getUser(id) {
      const user = await db.user.findUnique({ where: { id } })
      if (!user) return null
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.avatar,
        avatar: user.avatar,
        role: user.role,
        emailVerified: user.emailVerified,
      }
    },
    async getUserByEmail(email) {
      const user = await db.user.findUnique({ where: { email } })
      if (!user) return null
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.avatar,
        avatar: user.avatar,
        role: user.role,
        emailVerified: user.emailVerified,
      }
    },
    async getUserByAccount({ providerAccountId, provider }) {
      const account = await db.account.findFirst({
        where: { providerAccountId, provider },
        include: { user: true },
      })
      if (!account) return null
      return {
        id: account.user.id,
        email: account.user.email,
        name: account.user.name,
        image: account.user.avatar,
        avatar: account.user.avatar,
        role: account.user.role,
        emailVerified: account.user.emailVerified,
      }
    },
    async updateUser(user) {
      const updated = await db.user.update({
        where: { id: user.id! },
        data: {
          email: user.email ?? undefined,
          name: user.name ?? undefined,
          avatar: user.image ?? undefined,
          emailVerified: user.emailVerified ?? undefined,
        },
      })
      return {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        image: updated.avatar,
        avatar: updated.avatar,
        role: updated.role,
        emailVerified: updated.emailVerified,
      }
    },
    async deleteUser(id) {
      await db.user.delete({ where: { id } })
    },
    async linkAccount(account) {
      await db.account.create({
        data: {
          userId: account.userId,
          type: account.type,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          refresh_token: account.refresh_token,
          access_token: account.access_token,
          expires_at: account.expires_at,
          token_type: account.token_type,
          scope: account.scope,
          id_token: account.id_token,
          session_state: account.session_state,
        },
      })
    },
    async unlinkAccount({ providerAccountId, provider }) {
      await db.account.deleteMany({
        where: { providerAccountId, provider },
      })
    },
    async createSession(session) {
      const created = await db.session.create({
        data: {
          sessionToken: session.sessionToken,
          userId: session.userId,
          expires: session.expires,
        },
      })
      return {
        sessionToken: created.sessionToken,
        userId: created.userId,
        expires: created.expires,
      }
    },
    async getSessionAndUser(sessionToken) {
      const sessionWithUser = await db.session.findUnique({
        where: { sessionToken },
        include: { user: true },
      })
      if (!sessionWithUser) return null
      
      const { user, ...session } = sessionWithUser
      return {
        session: {
          sessionToken: session.sessionToken,
          userId: session.userId,
          expires: session.expires,
        },
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar,
          avatar: user.avatar,
          role: user.role,
          emailVerified: user.emailVerified,
        },
      }
    },
    async updateSession(session) {
      const updated = await db.session.update({
        where: { sessionToken: session.sessionToken },
        data: { expires: session.expires },
      })
      return {
        sessionToken: updated.sessionToken,
        userId: updated.userId,
        expires: updated.expires,
      }
    },
    async deleteSession(sessionToken) {
      await db.session.delete({ where: { sessionToken } })
    },
    async createVerificationToken(verificationToken) {
      await db.verificationToken.create({
        data: {
          identifier: verificationToken.identifier,
          token: verificationToken.token,
          expires: verificationToken.expires,
        },
      })
      return verificationToken
    },
    async useVerificationToken({ identifier, token }) {
      const verificationToken = await db.verificationToken.findUnique({
        where: { identifier_token: { identifier, token } },
      })
      if (!verificationToken) return null
      await db.verificationToken.delete({
        where: { identifier_token: { identifier, token } },
      })
      return verificationToken
    },
  }
}

// NextAuth configuration for Google OAuth and Credentials providers
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "select_account"
        }
      }
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials')
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.password) {
          throw new Error('Invalid credentials')
        }

        const isValid = await compare(credentials.password, user.password)

        if (!isValid) {
          throw new Error('Invalid credentials')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
        }
      },
    }),
  ],
  pages: {
    signIn: '/',
    error: '/',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.avatar = user.avatar
      }
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.avatar = token.avatar as string | null
      }
      return session
    },
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        // Check if user exists
        const existingUser = await db.user.findUnique({
          where: { email: user.email! },
        })

        if (!existingUser) {
          // Create new user from Google - this will be handled by the adapter
          const newUser = await db.user.create({
            data: {
              email: user.email!,
              name: user.name || 'User',
              avatar: user.image,
              role: 'customer',
              emailVerified: new Date(),
            },
          })
          user.id = newUser.id
          user.role = newUser.role
        } else {
          user.id = existingUser.id
          user.role = existingUser.role
          
          // Update avatar if not set
          if (!existingUser.avatar && user.image) {
            await db.user.update({
              where: { id: existingUser.id },
              data: { avatar: user.image },
            })
          }
        }
      }
      return true
    },
  },
  events: {
    async signIn({ user }) {
      // Update last login
      await db.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      }).catch(() => {
        // Ignore error if user doesn't exist
      })
    },
  },
  debug: process.env.NODE_ENV === 'development',
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      avatar: string | null
    }
  }

  interface User {
    role: string
    avatar: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    avatar: string | null
    accessToken?: string
  }
}
