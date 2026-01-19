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

  const project = await db.query.sideProjects.findFirst({
    where: and(
      eq(tables.sideProjects.id, Number(id)),
      eq(tables.sideProjects.developerId, developer.id)
    )
  })

  if (!project) {
    throw createError({ statusCode: 404, message: 'Projet non trouvé ou non autorisé' })
  }

  const body = await readBody(event)
  const updates: Record<string, any> = {}

  if (body.title !== undefined) updates.title = body.title.trim()
  if (body.description !== undefined) updates.description = body.description.trim()
  if (body.repoUrl !== undefined) updates.repoUrl = body.repoUrl?.trim() || null
  if (body.websiteUrl !== undefined) updates.websiteUrl = body.websiteUrl?.trim() || null
  if (body.status !== undefined) {
    const validStatuses = ['idea', 'open_to_contributors', 'looking_for_cofounder', 'completed']
    if (validStatuses.includes(body.status)) {
      updates.status = body.status
    }
  }

  if (Object.keys(updates).length > 0) {
    updates.updatedAt = new Date()
    await db.update(tables.sideProjects)
      .set(updates)
      .where(eq(tables.sideProjects.id, Number(id)))
  }

  if (body.techs !== undefined) {
    await db.delete(tables.sideProjectTechs)
      .where(eq(tables.sideProjectTechs.sideProjectId, Number(id)))

    if (body.techs.length > 0) {
      await db.insert(tables.sideProjectTechs).values(
        body.techs.map((tech: string) => ({
          sideProjectId: Number(id),
          techName: tech.trim()
        }))
      )
    }
  }

  return { success: true }
})
