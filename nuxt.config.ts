export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  runtimeConfig: {
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    resendApiKey: process.env.RESEND_API_KEY,
    cronSecret: process.env.CRON_SECRET,
    brevoApiKey: process.env.BREVO_API_KEY,
    brevoListId: process.env.BREVO_LIST_ID,
    brevoWebhookSecret: process.env.BREVO_WEBHOOK_SECRET,
    adminGithubId: process.env.ADMIN_GITHUB_ID,
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
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },
  modules: ['@nuxthub/core', '@sidebase/nuxt-auth', '@nuxtjs/seo', '@nuxtjs/tailwindcss', '@nuxt/fonts', '@nuxt/a11y', '@vueuse/nuxt'],

  css: ['@/assets/css/main.css'],

  fonts: {
    providers: {
      google: false,
      googleicons: false,
      bunny: false,
      fontshare: false,
      fontsource: false,
      adobe: false
    },
    families: [
      { name: 'Satoshi', provider: 'local', weights: [400, 500, 700] },
      { name: 'Space Grotesk', provider: 'local', weights: [500, 700], global: true },
      { name: 'JetBrains Mono', provider: 'local', weights: [400], global: true }
    ]
  },

  site: {
    url: 'https://ousontlesdeveloppeuses.fr',
    name: 'Où Sont Les Développeuses',
    description: 'Annuaire des développeuses tech en France. Profils, speakeuses pour vos conférences, programmes et ressources tech.',
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
      description: 'Annuaire des développeuses tech en France. Profils, speakeuses, programmes et ressources tech.',
      sameAs: [
        'https://github.com/Kamsou/ousontlesdevs',
      ],
    },
  },

  sitemap: {
    sources: ['/api/__sitemap__/urls'],
    exclude: ['/profile', '/profile/**', '/qg', '/qg/**', '/admin', '/admin/**', '/mission', '/discover', '/stats', '/qg-info', '/companies'],
  },

  robots: {
    disallow: ['/profile', '/qg', '/api/', '/admin'],
    allow: ['/directory/*'],
    blockNonSeoBots: false,
  },

  ogImage: {
    enabled: true,
    defaults: {
      width: 1200,
      height: 630
    }
  },
  hub: {
    db: 'sqlite'
  },
  auth: {
    disableServerSideAuth: true,
    baseURL: process.env.NUXT_PUBLIC_AUTH_BASE_URL || 'http://localhost:3000/api/auth',
    originEnvKey: 'NUXT_PUBLIC_AUTH_BASE_URL',
    provider: {
      type: 'authjs',
      trustHost: true
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
    prerender: {
      autoSubfolderIndex: false
    },
  },
  routeRules: {
    '/**': {
      headers: {
        'Content-Security-Policy': "frame-ancestors 'none'; object-src 'none'; base-uri 'self'",
        'Content-Security-Policy-Report-Only': "default-src 'self'; script-src 'self' 'unsafe-inline' https://eu.i.posthog.com https://eu-assets.i.posthog.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https://eu.i.posthog.com https://eu-assets.i.posthog.com; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self' https://github.com",
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
      }
    },
    '/': { prerender: true },
    '/experience': { prerender: true },
    '/experience/**': { prerender: true },
    '/programs': { prerender: true },
    '/podcasts': { prerender: true },
    '/mission': { prerender: true },
    '/discover': { prerender: true },
    '/stats': { prerender: true },
    '/qg-info': { prerender: true },
    '/legal': { prerender: true },
    '/coc': { prerender: true },
    '/directory': { isr: 600 },
    '/directory/**': { isr: 600 },
    '/speakers': { isr: 600 },
    '/qg/**': { ssr: false },
    '/qg': { ssr: false },
    '/admin/**': { ssr: false },
    '/admin': { ssr: false },
    '/profile': { ssr: false },
    '/feedback/**': { ssr: false },
    // 301 redirects from old French URLs
    '/annuaire': { redirect: { to: '/directory', statusCode: 301 } },
    '/entreprises': { redirect: { to: '/companies', statusCode: 301 } },
    '/programmes': { redirect: { to: '/programs', statusCode: 301 } },
    '/profil': { redirect: { to: '/profile', statusCode: 301 } },
    '/decouvrir': { redirect: { to: '/discover', statusCode: 301 } },
  },
  vite: {
    build: {
      target: 'esnext'
    }
  }
})
