export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  runtimeConfig: {
    anthropicApiKey: process.env.ANTHROPIC_API_KEY
  },
  future: {
    compatibilityVersion: 4
  },
  app: {
    head: {
      htmlAttrs: { lang: 'fr' },
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap' }
      ]
    }
  },
  modules: [
    '@nuxthub/core',
    '@sidebase/nuxt-auth',
    '@nuxtjs/seo',
    '@nuxtjs/tailwindcss'
  ],

  site: {
    url: 'https://ousontlesdeveloppeuses.fr',
    name: 'OSLD',
    description: 'Annuaire des développeuses en France. Trouvez des talents tech féminins, des speakers pour vos conférences, et des entreprises inclusives.',
    defaultLocale: 'fr',
  },

  seo: {
    fallbackTitle: true,
  },

  schemaOrg: {
    enabled: false,
  },

  sitemap: {
    enabled: false,
  },

  robots: {
    disallow: ['/profil', '/api/'],
    allow: ['/profil/*'],
  },

  ogImage: {
    enabled: false
  },
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
