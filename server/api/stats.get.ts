import { eq, count, countDistinct, isNotNull } from 'drizzle-orm'

export default defineCachedEventHandler(async () => {
  const db = useDrizzle()

  const [devResult, companyResult, locationResult, speakerResult] = await Promise.all([
    db.select({ count: count() }).from(tables.developers).where(isNotNull(tables.developers.slug)),
    db.select({ count: count() }).from(tables.companies),
    db.select({ count: countDistinct(tables.developers.location) }).from(tables.developers).where(isNotNull(tables.developers.slug)),
    db.select({ count: countDistinct(tables.developerOpenTo.developerId) })
      .from(tables.developerOpenTo)
      .where(eq(tables.developerOpenTo.type, 'conference'))
  ])

  return {
    developers: devResult[0].count,
    companies: companyResult[0].count,
    locations: locationResult[0].count,
    speakers: speakerResult[0].count
  }
}, { name: 'stats', maxAge: 60 * 10 })
