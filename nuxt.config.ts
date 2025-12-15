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
    baseURL: '/api/auth',
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
