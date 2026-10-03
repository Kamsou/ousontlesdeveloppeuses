import { getServerSession } from '#auth'
import { eq } from 'drizzle-orm'
import { quizProfileTypes } from '#shared/utils/quiz'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)

  if (!session?.user) {
    throw createError({ statusCode: 401, message: 'Non authentifié' })
  }

  const body = await readBody(event)
  const db = useDrizzle()

  if (!body.type || !body.phrase) {
    throw createError({ statusCode: 400, message: 'Type et phrase requis' })
  }

  const githubId = session.user.id?.toString()

  if (!githubId) {
    throw createError({ statusCode: 400, message: 'GitHub ID manquant' })
  }

  if (!quizProfileTypes.includes(body.type) || typeof body.phrase !== 'string' || body.phrase.length > 200) {
    throw createError({ statusCode: 400, message: 'Profil invalide' })
  }

  const existingDev = await db.select()
    .from(tables.developers)
    .where(eq(tables.developers.githubId, githubId))
    .get()

  if (!existingDev) {
    throw createError({ statusCode: 404, message: 'Crée ton profil pour enregistrer ton résultat' })
  }

  await db.update(tables.developers)
    .set({
      profileType: body.type,
      profilePhrase: body.phrase,
      updatedAt: new Date()
    })
    .where(eq(tables.developers.githubId, githubId))

  return { success: true, updated: true }
})
