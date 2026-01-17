import { asSitemapUrl, defineSitemapEventHandler } from '#imports'

export default defineSitemapEventHandler(async () => {
  const db = useDrizzle()

  const developers = await db.query.developers.findMany({
    columns: {
      id: true,
      updatedAt: true
    }
  })

  return developers.map((dev) =>
    asSitemapUrl({
      loc: `/annuaire/${dev.id}`,
      lastmod: dev.updatedAt ? new Date(dev.updatedAt) : new Date(),
      changefreq: 'weekly',
      priority: 0.7
    })
  )
})
