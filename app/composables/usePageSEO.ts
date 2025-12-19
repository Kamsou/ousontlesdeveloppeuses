/**
 * Composable centralisé pour le SEO des pages
 * Évite la répétition du pattern runtimeConfig -> siteUrl -> canonicalUrl -> useHead
 */
export const usePageSEO = (options: {
  title: string | (() => string)
  description: string | (() => string)
  path?: string | (() => string)
  image?: string | (() => string)
  type?: 'website' | 'article' | 'profile'
}) => {
  const route = useRoute()
  const config = useRuntimeConfig()
  const siteUrl = config.public?.siteUrl || 'https://ousontlesdeveloppeuses.fr'
  
  const getPath = () => typeof options.path === 'function' ? options.path() : (options.path || route.path)
  const canonicalUrl = computed(() => `${siteUrl}${getPath()}`)

  // Meta tags avec useSeoMeta (type-safe, support des fonctions pour données dynamiques)
  useSeoMeta({
    title: options.title,
    ogTitle: options.title,
    description: options.description,
    ogDescription: options.description,
    ogImage: options.image || `${siteUrl}/og-image.png`,
    ogUrl: canonicalUrl,
    ogType: options.type || 'website',
    ogLocale: 'fr_FR',
    twitterCard: 'summary_large_image',
    twitterImage: options.image || `${siteUrl}/og-image.png`
  })

  // Canonical URL automatique
  useHead({
    link: [{ rel: 'canonical', href: canonicalUrl }]
  })

  return {
    siteUrl,
    canonicalUrl: canonicalUrl.value
  }
}

