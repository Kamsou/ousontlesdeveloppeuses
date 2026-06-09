import { getServerSession } from '#auth'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)

  if (!session?.user) {
    throw createError({ statusCode: 401, message: 'Non authentifié' })
  }

  const githubId = session.user.id
  if (!githubId) {
    throw createError({ statusCode: 400, message: 'ID GitHub non trouvé' })
  }

  const id = Number(getRouterParam(event, 'id'))
  if (!id) {
    throw createError({ statusCode: 400, message: 'ID invalide' })
  }

  const body = await readBody(event)

  if (!body.status || !['completed', 'skipped'].includes(body.status)) {
    throw createError({ statusCode: 400, message: 'Statut invalide' })
  }

  const db = useDrizzle()

  const developer = await db.query.developers.findFirst({
    where: eq(tables.developers.githubId, githubId)
  })

  if (!developer) {
    throw createError({ statusCode: 404, message: 'Profil non trouvé' })
  }

  const challenge = await db.query.challenges.findFirst({
    where: and(
      eq(tables.challenges.id, id),
      eq(tables.challenges.developerId, developer.id)
    )
  })

  if (!challenge) {
    throw createError({ statusCode: 404, message: 'Challenge non trouvé' })
  }

  if (challenge.status !== 'active') {
    throw createError({ statusCode: 400, message: 'Ce challenge n\'est plus actif' })
  }

  const [updated] = await db.update(tables.challenges)
    .set({
      status: body.status,
      reflection: body.reflection || null,
      completedAt: new Date()
    })
    .where(eq(tables.challenges.id, id))
    .returning()

  return updated
})
