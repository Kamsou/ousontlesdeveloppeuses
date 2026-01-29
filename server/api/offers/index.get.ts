import { desc } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const db = useDrizzle()

  const offers = await db.query.offers.findMany({
    with: {
      developer: true
    },
    orderBy: [desc(tables.offers.createdAt)]
  })

  return offers.map(o => ({
    id: o.id,
    title: o.title,
    description: o.description,
    url: o.url,
    type: o.type,
    location: o.location,
    verified: o.verified,
    createdAt: o.createdAt,
    developer: {
      id: o.developer.id,
      name: o.developer.name,
      avatarUrl: o.developer.avatarUrl
    }
  }))
})
