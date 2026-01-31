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

  const developer = await db.query.developers.findFirst({
    where: eq(tables.developers.githubId, githubId)
  })

  if (!developer) {
    throw createError({ statusCode: 404, message: 'Profil non trouvé' })
  }

  await db.delete(tables.developerSkills).where(eq(tables.developerSkills.developerId, developer.id))
  await db.delete(tables.developerOpenTo).where(eq(tables.developerOpenTo.developerId, developer.id))
  await db.delete(tables.speakerProfiles).where(eq(tables.speakerProfiles.developerId, developer.id))
  await db.delete(tables.developers).where(eq(tables.developers.id, developer.id))

  await trackDeletion('self')

  return { success: true }
})
