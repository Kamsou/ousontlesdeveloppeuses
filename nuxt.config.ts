// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  future: {
    compatibilityVersion: 4
  },
  modules: [
    '@sidebase/nuxt-auth'
  ],
  auth: {
    originEnvKey: 'AUTH_ORIGIN',
    baseURL: '/api/auth',
    provider: {
      type: 'authjs',
      trustHost: false
    },
    globalAppMiddleware: {
      isEnabled: false
    }
  },
  runtimeConfig: {
    authOrigin: process.env.AUTH_ORIGIN
  },
  nitro: {
    preset: 'netlify',
    experimental: {
      asyncContext: true
    }
  }
})
