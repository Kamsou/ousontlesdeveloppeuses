import { getServerSession, getToken } from '#auth'
import { eq } from 'drizzle-orm'

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

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'ID requis' })
  }

  const db = useDrizzle()

  const developer = await db.query.developers.findFirst({
    where: eq(tables.developers.githubId, githubId)
  })

  if (!developer) {
    throw createError({ statusCode: 404, message: 'Profil non trouvé' })
  }

  const request = await db.query.helpRequests.findFirst({
    where: eq(tables.helpRequests.id, Number(id))
  })

  if (!request) {
    throw createError({ statusCode: 404, message: 'Demande non trouvée' })
  }

  if (request.developerId !== developer.id) {
    throw createError({ statusCode: 403, message: 'Non autorisé' })
  }

  // Supprimer les techs associées d'abord (cascade)
  await db.delete(tables.helpRequestTechs)
    .where(eq(tables.helpRequestTechs.helpRequestId, Number(id)))

  // Supprimer la demande
  await db.delete(tables.helpRequests)
    .where(eq(tables.helpRequests.id, Number(id)))

  return { success: true }
})
