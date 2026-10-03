// Server-side auth is disabled (pages are cached), so the session loads on the client.
// Wait for it before sidebase-auth decides whether a protected page is allowed.
export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return

  const middleware = to.meta.middleware
  const isProtected = Array.isArray(middleware) ? middleware.includes('sidebase-auth') : middleware === 'sidebase-auth'
  if (!isProtected) return

  const { status, getSession } = useAuth()
  if (status.value === 'loading') {
    await getSession()
  }
})
