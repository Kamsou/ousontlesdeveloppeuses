import { eq, asc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const helpRequestId = query.helpRequestId ? Number(query.helpRequestId) : null
  const sideProjectId = query.sideProjectId ? Number(query.sideProjectId) : null

  if (!helpRequestId && !sideProjectId) {
    throw createError({ statusCode: 400, message: 'helpRequestId ou sideProjectId requis' })
  }

  const db = useDrizzle()

  const comments = await db.query.comments.findMany({
    where: helpRequestId
      ? eq(tables.comments.helpRequestId, helpRequestId)
      : eq(tables.comments.sideProjectId, sideProjectId!),
    with: {
      developer: {
        columns: {
          id: true,
          slug: true,
          name: true,
          avatarUrl: true
        }
      }
    },
    orderBy: [asc(tables.comments.createdAt)]
  })

  return comments
})
