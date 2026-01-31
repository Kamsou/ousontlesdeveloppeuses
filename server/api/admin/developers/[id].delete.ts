import { getServerSession } from '#auth'
import { eq, and } from 'drizzle-orm'

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

  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, message: 'ID invalide' })
  }

  if (admin.id === id) {
    throw createError({ statusCode: 400, message: 'Vous ne pouvez pas supprimer votre propre compte' })
  }

  await db.delete(tables.developerSkills).where(eq(tables.developerSkills.developerId, id))
  await db.delete(tables.developerOpenTo).where(eq(tables.developerOpenTo.developerId, id))
  await db.delete(tables.speakerProfiles).where(eq(tables.speakerProfiles.developerId, id))
  await db.delete(tables.developers).where(eq(tables.developers.id, id))

  const month = new Date().toISOString().slice(0, 7)
  const existing = await db.query.accountDeletionStats.findFirst({
    where: and(
      eq(tables.accountDeletionStats.month, month),
      eq(tables.accountDeletionStats.deletedBy, 'admin')
    )
  })
  if (existing) {
    await db.update(tables.accountDeletionStats)
      .set({ count: existing.count + 1 })
      .where(eq(tables.accountDeletionStats.id, existing.id))
  } else {
    await db.insert(tables.accountDeletionStats).values({
      month, deletedBy: 'admin', count: 1
    })
  }

  return { success: true }
})
