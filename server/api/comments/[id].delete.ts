import { getServerSession } from '#auth'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session?.user?.email) {
    throw createError({ statusCode: 401, message: 'Non autorisé' })
  }

  const id = Number(getRouterParam(event, 'id'))
  if (!id) {
    throw createError({ statusCode: 400, message: 'ID invalide' })
  }

  const db = useDrizzle()

  const developer = await db.query.developers.findFirst({
    where: eq(tables.developers.email, session.user.email)
  })

  if (!developer) {
    throw createError({ statusCode: 403, message: 'Profil requis' })
  }

  const comment = await db.query.comments.findFirst({
    where: eq(tables.comments.id, id)
  })

  if (!comment) {
    throw createError({ statusCode: 404, message: 'Commentaire non trouvé' })
  }

  if (comment.developerId !== developer.id && !developer.isAdmin) {
    throw createError({ statusCode: 403, message: 'Non autorisé' })
  }

  await db.delete(tables.comments).where(eq(tables.comments.id, id))

  return { success: true }
})
