import dbConnect from '@/lib/mongoose'
import User from '@/models/User'
import bcrypt from 'bcryptjs'
import { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { CHECK_SESSION_EXP_TIME } from '../types'

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {},
      async authorize(credentials: any) {
        const { email, password } = credentials

        try {
          await dbConnect()

          const user = await User.findOne({ email })

          if (!user) {
            return null
          }

          const passwordsMatch = await bcrypt.compare(password, user.password)

          if (!passwordsMatch) {
            return null
          }

          return user
        } catch (err) {
          console.log(err)
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: CHECK_SESSION_EXP_TIME,
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/',
  },
  jwt: {
    maxAge: CHECK_SESSION_EXP_TIME,
  },
  callbacks: {
    jwt: async ({ token, user }: { token: any; user: any }) => {
      if (token.exp <= Math.floor(Date.now() / 1000)) {
        return { ...token, error: 'AccessTokenError' }
      }
      if (user) {
        token.user = { _id: user._id, email: user.email, username: user.username }
      }

      return token
    },
    session: async ({ session, token }: { session: any; token: any }) => {
      session.user = token.user
      session.error = token.error

      return session
    },
  },
}
