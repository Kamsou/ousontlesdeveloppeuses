import { developers } from '../../db/schema'
import { useDrizzle } from '../../utils/db'

export default defineSitemapEventHandler(async () => {
  const db = useDrizzle()

  const allDevelopers = await db.select({
    id: developers.id,
    updatedAt: developers.updatedAt,
  }).from(developers)

  return allDevelopers.map(dev => ({
    loc: `/profil/${dev.id}`,
    lastmod: dev.updatedAt?.toISOString(),
  }))
})
