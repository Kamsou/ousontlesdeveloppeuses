export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  runtimeConfig: {
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    resendApiKey: process.env.RESEND_API_KEY,
    cronSecret: process.env.CRON_SECRET,
    public: {
      posthog: {
        publicKey: process.env.NUXT_PUBLIC_POSTHOG_PUBLIC_KEY,
        host: 'https://eu.i.posthog.com'
      }
    }
  },
  future: {
    compatibilityVersion: 4
  },
  app: {
    head: {
      htmlAttrs: { lang: 'fr' },
      title: 'Où Sont Les Développeuses',
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://api.fontshare.com' },
        { rel: 'preconnect', href: 'https://cdn.fontshare.com', crossorigin: 'anonymous' },
        {
          rel: 'stylesheet',
          href: 'https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap',
          media: 'print',
          onload: "this.media='all'"
        }
      ],
      noscript: [
        { innerHTML: '<link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap">' }
      ]
    }
  },
  modules: ['@nuxthub/core', '@sidebase/nuxt-auth', '@nuxtjs/seo', '@nuxtjs/tailwindcss', '@nuxtjs/google-fonts', '@nuxt/a11y', 'nuxt-posthog', '@vueuse/nuxt'],

  css: ['@/assets/css/main.css'],

  googleFonts: {
    families: {
      'Space Grotesk': [500, 700]
    },
    display: 'swap',
    preload: true,
    download: true,
    inject: true
  },

  site: {
    url: 'https://ousontlesdeveloppeuses.fr',
    name: 'Où Sont Les Développeuses',
    description: 'Annuaire des développeuses tech en France. Profils, speakeuses pour vos conférences, entreprises inclusives et entraide communautaire.',
    defaultLocale: 'fr',
  },

  seo: {
    fallbackTitle: true,
  },

  schemaOrg: {
    identity: {
      type: 'Organization',
      name: 'Où Sont Les Développeuses',
      alternateName: 'OSLD',
      url: 'https://ousontlesdeveloppeuses.fr',
      logo: 'https://ousontlesdeveloppeuses.fr/og-image.png',
      description: 'Annuaire des développeuses tech en France. Profils, speakeuses, entreprises inclusives et entraide communautaire.',
      sameAs: [
        'https://github.com/Kamsou/ousontlesdevs',
      ],
    },
  },

  sitemap: {
    sources: ['/api/__sitemap__/urls'],
    exclude: ['/profil', '/profil/**', '/qg', '/qg/**', '/admin', '/admin/**'],
  },

  robots: {
    disallow: ['/profil', '/qg', '/api/', '/admin'],
    allow: ['/annuaire/*'],
    blockNonSeoBots: true,
  },

  ogImage: {
    enabled: true,
    defaults: {
      width: 1200,
      height: 630,
      component: 'OgImageDefault'
    }
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
  a11y: {},
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
    '/programmes': { prerender: true },
    '/podcasts': { prerender: true },
    '/speakers': { prerender: true },
    '/qg/**': { ssr: false },
    '/qg': { ssr: false },
    '/admin/**': { ssr: false },
    '/admin': { ssr: false },
  },
  vite: {
    build: {
      target: 'esnext'
    }
  }
})
