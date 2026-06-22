import { NuxtAuthHandler } from '#auth'
import GithubProvider from 'next-auth/providers/github'
import { eq } from 'drizzle-orm'

// @ts-ignore - CommonJS interop
const GitHub = GithubProvider.default || GithubProvider

export default NuxtAuthHandler({
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: '/',
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.id = account.providerAccountId
        token.login = (profile as { login?: string })?.login ?? ''

        const githubEmail = (profile as { email?: string })?.email
        if (githubEmail) {
          try {
            const db = useDrizzle()
            await db.update(tables.developers)
              .set({ email: githubEmail })
              .where(eq(tables.developers.githubId, token.id))
          } catch (err) {
            console.error('[auth] Failed to sync GitHub email:', err)
          }
        }
      }
      if (!token.id && token.sub) {
        token.id = token.sub
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id ?? token.sub) as string
        session.user.login = token.login
      }
      return session
    },
    redirect({ baseUrl }) {
      return `${baseUrl}/profil`
    }
  },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || ''
    })
  ]
})
