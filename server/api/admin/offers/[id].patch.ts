import { getServerSession } from '#auth'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)

  if (!session?.user) {
    throw createError({ statusCode: 401, message: 'Non authentifié' })
  }

  const githubId = (session.user as any).id
  if (!githubId) {
    throw createError({ statusCode: 401, message: 'Non authentifié' })
  }

  const db = useDrizzle()

  const admin = await db.query.developers.findFirst({
    where: eq(tables.developers.githubId, githubId)
  })

  if (!admin?.isAdmin) {
    throw createError({ statusCode: 403, message: 'Accès refusé' })
  }

  const id = Number(getRouterParam(event, 'id'))
  if (!id) {
    throw createError({ statusCode: 400, message: 'ID invalide' })
  }

  const offer = await db.query.offers.findFirst({
    where: eq(tables.offers.id, id)
  })

  if (!offer) {
    throw createError({ statusCode: 404, message: 'Offre non trouvée' })
  }

  await db.update(tables.offers)
    .set({ verified: !offer.verified })
    .where(eq(tables.offers.id, id))

  return { verified: !offer.verified }
})
