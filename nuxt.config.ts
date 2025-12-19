// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  future: {
    compatibilityVersion: 4
  },
  app: {
    head: {
      htmlAttrs: { lang: 'fr' },
      title: 'OSLD - Où Sont Les Développeuses',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Annuaire des développeuses en France. Trouvez des talents tech féminins, des speakers pour vos conférences, et des entreprises inclusives.' },
        { name: 'keywords', content: 'développeuses, femmes tech, annuaire, speakers, conférences, entreprises inclusives, France, diversité tech' },
        { name: 'author', content: 'OSLD' },
        { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },
        { name: 'googlebot', content: 'index, follow' },
        { name: 'theme-color', content: '#0a0a0f' },
        // Open Graph
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'OSLD - Où Sont Les Développeuses' },
        { property: 'og:title', content: 'OSLD - Où Sont Les Développeuses' },
        { property: 'og:description', content: 'Annuaire des développeuses en France. Trouvez des talents tech féminins, des speakers pour vos conférences, et des entreprises inclusives.' },
        { property: 'og:image', content: 'https://ousontlesdeveloppeuses.fr/og-image.png' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: 'OSLD - Où Sont Les Développeuses' },
        { property: 'og:locale', content: 'fr_FR' },
        { property: 'og:url', content: 'https://ousontlesdeveloppeuses.fr' },
        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'OSLD - Où Sont Les Développeuses' },
        { name: 'twitter:description', content: 'Annuaire des développeuses en France. Trouvez des talents tech féminins, des speakers pour vos conférences, et des entreprises inclusives.' },
        { name: 'twitter:image', content: 'https://ousontlesdeveloppeuses.fr/og-image.png' },
        { name: 'twitter:image:alt', content: 'OSLD - Où Sont Les Développeuses' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'canonical', href: 'https://ousontlesdeveloppeuses.fr' }
      ]
    }
  },
  modules: [
    '@nuxthub/core',
    '@sidebase/nuxt-auth',
    '@nuxtjs/sitemap'
  ],
  site: {
    url: 'https://ousontlesdeveloppeuses.fr'
  },
  sitemap: {
    hostname: 'https://ousontlesdeveloppeuses.fr',
    gzip: true,
    routes: async () => {
      const routes: string[] = []
      
      // Static routes
      routes.push('/')
      routes.push('/annuaire')
      routes.push('/speakers')
      routes.push('/entreprises')
      
      // Dynamic routes - fetch from API endpoint
      try {
        // Use environment variable or default
        const baseUrl = typeof process !== 'undefined' && process.env?.NUXT_PUBLIC_SITE_URL 
          ? process.env.NUXT_PUBLIC_SITE_URL 
          : 'https://ousontlesdeveloppeuses.fr'
        
        // Import $fetch dynamically
        const { $fetch } = await import('ofetch')
        const dynamicRoutes = await $fetch<string[]>(`${baseUrl}/api/sitemap-dynamic-routes`).catch(() => [])
        routes.push(...dynamicRoutes)
      } catch (error) {
        // Silently fail - sitemap will work with static routes
        if (typeof console !== 'undefined') {
          console.warn('Could not fetch dynamic routes for sitemap:', error)
        }
      }
      
      return routes
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
  nitro: {
    preset: 'netlify',
    experimental: {
      asyncContext: true
    }
  },
  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://ousontlesdeveloppeuses.fr'
    }
  }
})
