// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  future: {
    compatibilityVersion: 4
  },
  modules: [
    '@nuxthub/core',
    '@sidebase/nuxt-auth'
  ],
  hub: {
    db: 'sqlite'
  },
  auth: {
    baseURL: process.env.NUXT_PUBLIC_AUTH_BASE_URL || 'http://localhost:3000/api/auth',
    originEnvKey: 'NUXT_PUBLIC_AUTH_BASE_URL',
    provider: {
      type: 'authjs',
      trustHost: false
    },
    globalAppMiddleware: {
      isEnabled: false
    }
  },
  nitro: {
    preset: 'netlify',
    experimental: {
      asyncContext: true
    }
  }
})
