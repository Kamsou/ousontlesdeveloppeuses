import { getServerSession, getToken } from '#auth'
import { eq, ne, and, desc, sql } from 'drizzle-orm'

const PAGE_SIZE = 10

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  const token = await getToken({ event })

  if (!session?.user) {
    throw createError({ statusCode: 401, message: 'Non authentifié' })
  }

  const githubId = (token?.id || token?.sub) as string
  if (!githubId) {
    throw createError({ statusCode: 400, message: 'ID GitHub non trouvé' })
  }

  const query = getQuery(event)
  const page = Math.max(1, Number(query.page) || 1)
  const offset = (page - 1) * PAGE_SIZE

  const db = useDrizzle()

  const currentDev = await db.query.developers.findFirst({
    where: eq(tables.developers.githubId, githubId)
  })

  const whereClause = and(
    eq(tables.helpRequests.status, 'open'),
    currentDev ? ne(tables.helpRequests.developerId, currentDev.id) : undefined
  )

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(tables.helpRequests)
    .where(whereClause)

  const totalPages = Math.ceil(count / PAGE_SIZE)

  const requests = await db.query.helpRequests.findMany({
    where: whereClause,
    with: {
      techs: true,
      developer: {
        columns: {
          id: true,
          name: true,
          avatarUrl: true,
          linkedinUrl: true
        }
      }
    },
    orderBy: [desc(tables.helpRequests.createdAt)],
    limit: PAGE_SIZE,
    offset
  })

  return {
    requests,
    pagination: {
      page,
      pageSize: PAGE_SIZE,
      total: count,
      totalPages,
      hasMore: page < totalPages
    }
  }
})
