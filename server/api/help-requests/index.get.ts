import { getServerSession } from '#auth'
import { eq, desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)

  if (!session?.user) {
    throw createError({ statusCode: 401, message: 'Non authentifié' })
  }

  const githubId = session.user.id
  if (!githubId) {
    throw createError({ statusCode: 400, message: 'ID GitHub non trouvé' })
  }

  const db = useDrizzle()

  const developer = await db.query.developers.findFirst({
    where: eq(tables.developers.githubId, githubId)
  })

  if (!developer) {
    throw createError({ statusCode: 404, message: 'Profil non trouvé' })
  }

  const requests = await db.query.helpRequests.findMany({
    where: eq(tables.helpRequests.developerId, developer.id),
    with: {
      techs: true
    },
    orderBy: [desc(tables.helpRequests.createdAt)]
  })

  return requests
})
