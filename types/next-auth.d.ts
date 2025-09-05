import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface User {
    _id: string
    email: string
    username: string
    accessToken: string
    refreshToken: string
    idToken: string
  }
  interface Session {
    user: User
    expires: string
    error: string
  }
}
