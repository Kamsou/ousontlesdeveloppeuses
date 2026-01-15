import { getServerSession, getToken } from '#auth'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  const token = await getToken({ event })

  if (!session?.user) {
    throw createError({ statusCode: 401, message: 'Non authentifié' })
  }

  const githubId = (token?.id || token?.sub) as string
  const githubLogin = token?.login as string | undefined

  if (!githubId) {
    throw createError({ statusCode: 400, message: 'ID GitHub non trouvé' })
  }

  const body = await readBody(event)

  if (!body.linkedinUrl) {
    throw createError({ statusCode: 400, message: 'LinkedIn est requis' })
  }
  const db = useDrizzle()

  const existing = await db.query.developers.findFirst({
    where: eq(tables.developers.githubId, githubId)
  })

  if (existing) {
    throw createError({ statusCode: 400, message: 'Profil déjà existant' })
  }

  const [developer] = await db.insert(tables.developers).values({
    githubId,
    name: body.name || session.user.name || '',
    email: session.user.email || null,
    avatarUrl: session.user.image || null,
    bio: body.bio || null,
    location: body.location || null,
    yearsExperience: body.yearsExperience || null,
    website: body.website || null,
    githubUrl: githubLogin ? `https://github.com/${githubLogin}` : null,
    linkedinUrl: body.linkedinUrl || null,
    twitterUrl: body.twitterUrl || null
  }).returning()

  if (body.skills?.length) {
    await db.insert(tables.developerSkills).values(
      body.skills.map((skill: string) => ({
        developerId: developer.id,
        skillName: skill
      }))
    )
  }

  if (body.openTo?.length) {
    await db.insert(tables.developerOpenTo).values(
      body.openTo.map((type: string) => ({
        developerId: developer.id,
        type
      }))
    )
  }

  if (body.openTo?.includes('conference')) {
    await db.insert(tables.speakerProfiles).values({
      developerId: developer.id,
      topics: body.speakerTopics ? JSON.stringify(body.speakerTopics) : null,
      available: true,
      remoteOk: body.remoteOk ?? true,
      travelWilling: body.travelWilling ?? false
    })
  }

  return { id: developer.id, message: 'Profil créé' }
})
