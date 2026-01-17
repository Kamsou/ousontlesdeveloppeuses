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

  const body = await readBody(event)
  const { title, description, helpType, techs } = body

  if (!title?.trim()) {
    throw createError({ statusCode: 400, message: 'Le titre est requis' })
  }

  const validHelpTypes = ['bug', 'review', 'advice', 'pair', 'other']
  if (helpType && !validHelpTypes.includes(helpType)) {
    throw createError({ statusCode: 400, message: 'Type d\'aide invalide' })
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

  // Mettre à jour la demande
  await db.update(tables.helpRequests)
    .set({
      title: title.trim(),
      description: description?.trim() || null,
      helpType: helpType || 'other'
    })
    .where(eq(tables.helpRequests.id, Number(id)))

  // Mettre à jour les techs
  // Supprimer les anciennes
  await db.delete(tables.helpRequestTechs)
    .where(eq(tables.helpRequestTechs.helpRequestId, Number(id)))

  // Ajouter les nouvelles
  if (techs && Array.isArray(techs) && techs.length > 0) {
    await db.insert(tables.helpRequestTechs).values(
      techs.map((techName: string) => ({
        helpRequestId: Number(id),
        techName: techName.trim()
      }))
    )
  }

  return { success: true }
})
