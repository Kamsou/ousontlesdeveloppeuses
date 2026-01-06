type SchemaOrgType = Record<string, unknown>

export function useSchemaOrg(schema: SchemaOrgType | Ref<SchemaOrgType | null>) {
  const schemaRef = isRef(schema) ? schema : ref(schema)

  useHead({
    script: computed(() => {
      if (!schemaRef.value) return []
      return [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            ...schemaRef.value,
          }),
        },
      ]
    }),
  })
}

export function useOrganizationSchema() {
  useSchemaOrg({
    '@type': 'Organization',
    name: 'OSLD - Où Sont Les Développeuses',
    url: 'https://ousontlesdeveloppeuses.fr',
    logo: 'https://ousontlesdeveloppeuses.fr/og-image.png',
    description: 'Plateforme communautaire pour rendre visibles les développeuses en France.',
    sameAs: [
      'https://github.com/Kamsou/ousontlesdevs',
      'https://linkedin.com/in/camillecoutens',
    ],
  })
}

export function useWebSiteSchema() {
  useSchemaOrg({
    '@type': 'WebSite',
    name: 'OSLD - Où Sont Les Développeuses',
    url: 'https://ousontlesdeveloppeuses.fr',
  })
}

interface PersonSchemaOptions {
  name: string
  bio?: string | null
  avatarUrl?: string | null
  website?: string | null
  linkedinUrl?: string | null
  githubUrl?: string | null
  twitterUrl?: string | null
}

export function usePersonSchema(person: Ref<PersonSchemaOptions | null | undefined>) {
  const schema = computed(() => {
    if (!person.value) return null

    const sameAs = [
      person.value.linkedinUrl,
      person.value.githubUrl,
      person.value.twitterUrl,
    ].filter(Boolean)

    return {
      '@type': 'Person',
      name: person.value.name,
      description: person.value.bio || undefined,
      image: person.value.avatarUrl || undefined,
      jobTitle: 'Développeuse',
      url: person.value.website || undefined,
      sameAs: sameAs.length ? sameAs : undefined,
    }
  })

  useSchemaOrg(schema)
}
