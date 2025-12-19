export const useStructuredData = () => {
  const config = useRuntimeConfig()
  const siteUrl = config.public?.siteUrl || 'https://ousontlesdeveloppeuses.fr'

  const organizationSchema = () => ({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'OSLD - Où Sont Les Développeuses',
    url: siteUrl,
    logo: `${siteUrl}/og-image.png`,
    description: 'Annuaire des développeuses en France. Trouvez des talents tech féminins, des speakers pour vos conférences, et des entreprises inclusives.',
    sameAs: [],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Support',
      availableLanguage: 'French'
    }
  })

  const websiteSchema = () => ({
    '@context': 'https://schema.org',
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

  const personSchema = (person: {
    name: string
    bio?: string | null
    avatarUrl?: string | null
    location?: string | null
    website?: string | null
    linkedinUrl?: string | null
    githubUrl?: string | null
    skills?: string[]
  }) => ({
    '@context': 'https://schema.org',
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

  const breadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  })

  const collectionPageSchema = (name: string, description: string, url: string) => ({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url
  })

  return {
    organizationSchema,
    websiteSchema,
    personSchema,
    breadcrumbSchema,
    collectionPageSchema
  }
}

