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
    { loc: '/directory', priority: 0.9, changefreq: 'daily' as const },
    { loc: '/speakers', priority: 0.8, changefreq: 'weekly' as const },
    { loc: '/programs', priority: 0.7, changefreq: 'monthly' as const },
    { loc: '/podcasts', priority: 0.7, changefreq: 'monthly' as const },
    { loc: '/mission', priority: 0.6, changefreq: 'monthly' as const },
    { loc: '/discover', priority: 0.6, changefreq: 'monthly' as const },
    { loc: '/experience', priority: 0.5, changefreq: 'monthly' as const },
    { loc: '/qg-info', priority: 0.5, changefreq: 'monthly' as const },
    { loc: '/stats', priority: 0.4, changefreq: 'daily' as const },
  ]

  const developerPages = developers.map((dev: { slug: string | null; updatedAt: Date | null }) =>
    asSitemapUrl({
      loc: `/directory/${dev.slug}`,
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
