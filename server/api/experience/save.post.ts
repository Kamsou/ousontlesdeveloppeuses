import { getServerSession } from '#auth'
import { eq } from 'drizzle-orm'

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

  const githubId = (session.user as any).id?.toString()

  if (!githubId) {
    throw createError({ statusCode: 400, message: 'GitHub ID manquant' })
  }

  // Find existing developer
  const existingDev = await db.select()
    .from(tables.developers)
    .where(eq(tables.developers.githubId, githubId))
    .get()

  if (existingDev) {
    // Update existing profile
    await db.update(tables.developers)
      .set({
        profileType: body.type,
        profilePhrase: body.phrase,
        updatedAt: new Date()
      })
      .where(eq(tables.developers.githubId, githubId))

    return { success: true, updated: true }
  } else {
    // Create new developer with profile
    await db.insert(tables.developers).values({
      githubId,
      name: session.user.name || 'Développeuse',
      email: session.user.email,
      avatarUrl: session.user.image,
      profileType: body.type,
      profilePhrase: body.phrase
    })

    return { success: true, created: true }
  }
})
