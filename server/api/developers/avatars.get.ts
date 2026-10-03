import { and, desc, eq, isNotNull } from 'drizzle-orm'

const AVATAR_LIMIT = 6

export default defineEventHandler(async (event) => {
  const { speakers } = getQuery(event)
  const db = useDrizzle()

  const rows = speakers === 'true'
    ? await db.selectDistinct({ avatarUrl: tables.developers.avatarUrl, updatedAt: tables.developers.updatedAt })
        .from(tables.developers)
        .innerJoin(tables.developerOpenTo, eq(tables.developerOpenTo.developerId, tables.developers.id))
        .where(and(isNotNull(tables.developers.avatarUrl), eq(tables.developerOpenTo.type, 'conference')))
        .orderBy(desc(tables.developers.updatedAt))
        .limit(AVATAR_LIMIT)
    : await db.select({ avatarUrl: tables.developers.avatarUrl })
        .from(tables.developers)
        .where(isNotNull(tables.developers.avatarUrl))
        .orderBy(desc(tables.developers.updatedAt))
        .limit(AVATAR_LIMIT)

  return rows.map(row => row.avatarUrl).filter((url): url is string => !!url)
})
