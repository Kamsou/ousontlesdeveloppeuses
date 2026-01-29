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

  const id = Number(getRouterParam(event, 'id'))
  if (!id) {
    throw createError({ statusCode: 400, message: 'ID invalide' })
  }

  const db = useDrizzle()

  const developer = await db.query.developers.findFirst({
    where: eq(tables.developers.githubId, githubId)
  })

  if (!developer) {
    throw createError({ statusCode: 404, message: 'Profil non trouvé' })
  }

  const offer = await db.query.offers.findFirst({
    where: eq(tables.offers.id, id)
  })

  if (!offer) {
    throw createError({ statusCode: 404, message: 'Offre non trouvée' })
  }

  if (offer.developerId !== developer.id && !developer.isAdmin) {
    throw createError({ statusCode: 403, message: 'Non autorisé' })
  }

  await db.delete(tables.offers).where(eq(tables.offers.id, id))

  return { message: 'Offre supprimée' }
})
