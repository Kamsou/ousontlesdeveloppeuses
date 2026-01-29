import { asSitemapUrl, defineSitemapEventHandler } from '#imports'

export default defineSitemapEventHandler(async () => {
  const db = useDrizzle()

  const developers = await db.query.developers.findMany({
    columns: {
      slug: true,
      updatedAt: true
    }
  })

  const staticPages = [
    { loc: '/', priority: 1.0, changefreq: 'daily' as const },
    { loc: '/annuaire', priority: 0.9, changefreq: 'daily' as const },
    { loc: '/speakers', priority: 0.8, changefreq: 'weekly' as const },
    { loc: '/entreprises', priority: 0.8, changefreq: 'weekly' as const },
    { loc: '/programmes', priority: 0.7, changefreq: 'monthly' as const },
    { loc: '/podcasts', priority: 0.7, changefreq: 'monthly' as const },
    { loc: '/experience', priority: 0.5, changefreq: 'monthly' as const },
  ]

  const developerPages = developers.map((dev: { slug: string | null; updatedAt: Date | null }) =>
    asSitemapUrl({
      loc: `/annuaire/${dev.slug}`,
      lastmod: dev.updatedAt ? new Date(dev.updatedAt) : new Date(),
      changefreq: 'weekly',
      priority: 0.7
    })
  )

  return [
    ...staticPages.map((page) => asSitemapUrl(page)),
    ...developerPages
  ]
})
