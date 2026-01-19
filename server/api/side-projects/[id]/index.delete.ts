import { getServerSession, getToken } from '#auth'
import { eq, and } from 'drizzle-orm'

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
  if (!id || isNaN(Number(id))) {
    throw createError({ statusCode: 400, message: 'ID invalide' })
  }

  const db = useDrizzle()

  const developer = await db.query.developers.findFirst({
    where: eq(tables.developers.githubId, githubId)
  })

  if (!developer) {
    throw createError({ statusCode: 404, message: 'Profil non trouvé' })
  }

  const deleted = await db.delete(tables.sideProjects)
    .where(and(
      eq(tables.sideProjects.id, Number(id)),
      eq(tables.sideProjects.developerId, developer.id)
    ))
    .returning()

  if (deleted.length === 0) {
    throw createError({ statusCode: 404, message: 'Projet non trouvé ou non autorisé' })
  }

  return { success: true }
})
