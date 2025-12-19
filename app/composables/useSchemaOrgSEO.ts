/**
 * Composable pour les données structurées Schema.org
 * Utilise useSchemaOrg si disponible (Nuxt 4 via unhead), sinon fallback sur useHead
 * Type-safe et conforme à Schema.org
 */
export const useSchemaOrgSEO = () => {
  const config = useRuntimeConfig()
  const siteUrl = config.public?.siteUrl || 'https://ousontlesdeveloppeuses.fr'

  // Helper pour injecter le schema (useSchemaOrg si disponible, sinon useHead)
  const injectSchema = (schema: any) => {
    if (typeof useSchemaOrg === 'function') {
      useSchemaOrg([schema])
    } else {
      useHead({
        script: [{
          type: 'application/ld+json',
          children: JSON.stringify(schema)
        }]
      })
    }
  }

  const setOrganization = () => {
    injectSchema({
      '@type': 'Organization',
      name: 'OSLD - Où Sont Les Développeuses',
      url: siteUrl,
      logo: `${siteUrl}/og-image.png`,
      description: 'Annuaire des développeuses en France. Trouvez des talents tech féminins, des speakers pour vos conférences, et des entreprises inclusives.'
    })
  }

  const setWebSite = () => {
    injectSchema({
      '@type': 'WebSite',
      name: 'OSLD - Où Sont Les Développeuses',
      url: siteUrl,
      description: 'Annuaire des développeuses en France. Trouvez des talents tech féminins, des speakers pour vos conférences, et des entreprises inclusives.',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${siteUrl}/annuaire?skill={search_term_string}`
        },
        'query-input': 'required name=search_term_string'
      }
    })
  }

  const setPerson = (person: {
    name: string
    bio?: string | null
    avatarUrl?: string | null
    location?: string | null
    website?: string | null
    linkedinUrl?: string | null
    githubUrl?: string | null
    skills?: string[]
  }) => {
    injectSchema({
      '@type': 'Person',
      name: person.name,
      description: person.bio || undefined,
      image: person.avatarUrl || undefined,
      address: person.location ? {
        '@type': 'PostalAddress',
        addressLocality: person.location
      } : undefined,
      url: person.website || undefined,
      sameAs: [
        person.linkedinUrl,
        person.githubUrl
      ].filter(Boolean),
      knowsAbout: person.skills || []
    })
  }

  const setBreadcrumb = (items: Array<{ name: string; url: string }>) => {
    injectSchema({
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url
      }))
    })
  }

  const setCollectionPage = (name: string, description: string, url: string) => {
    injectSchema({
      '@type': 'CollectionPage',
      name,
      description,
      url
    })
  }

  return {
    setOrganization,
    setWebSite,
    setPerson,
    setBreadcrumb,
    setCollectionPage,
    siteUrl
  }
}

