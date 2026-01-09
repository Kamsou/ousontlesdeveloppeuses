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
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },
  modules: ['@nuxthub/core', '@sidebase/nuxt-auth', '@nuxtjs/seo', '@nuxtjs/tailwindcss', '@nuxtjs/google-fonts', '@nuxt/a11y'],

  googleFonts: {
    families: {
      Inter: [400, 500, 600, 700],
      'Space Grotesk': [500, 700]
    },
    display: 'swap',
    preload: true,
    download: true,
    inject: true
  },

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
    identity: {
      type: 'Organization',
      name: 'OSLD - Où Sont Les Développeuses',
      url: 'https://ousontlesdeveloppeuses.fr',
      logo: 'https://ousontlesdeveloppeuses.fr/og-image.png',
    },
  },

  sitemap: {
    enabled: false,
  },

  robots: {
    disallow: ['/profil', '/api/'],
    allow: ['/profil/*'],
    blockNonSeoBots: true,
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
    },
    externals: {
      inline: ['unhead'],
    },
  },
  routeRules: {
    '/': { prerender: true },
    '/experience': { prerender: true },
    '/experience/**': { prerender: true },
  }
})