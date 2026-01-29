import { getServerSession, getToken } from '#auth'
import { eq } from 'drizzle-orm'
import { validateProfileUrls, validateOpenTo } from '../../utils/validation'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  const token = await getToken({ event })

  if (!session?.user) {
    throw createError({ statusCode: 401, message: 'Non authentifié' })
  }

  const githubId = (token?.id || token?.sub) as string

  const id = Number(getRouterParam(event, 'slug'))
  const body = await readBody(event)

  const urlError = validateProfileUrls(body)
  if (urlError) {
    throw createError({ statusCode: 400, message: urlError })
  }

  const db = useDrizzle()

  const developer = await db.query.developers.findFirst({
    where: eq(tables.developers.id, id)
  })

  if (!developer) {
    throw createError({ statusCode: 404, message: 'Profil non trouvé' })
  }

  if (developer.githubId !== githubId) {
    throw createError({ statusCode: 403, message: 'Non autorisé' })
  }

  const emailOptInUpdate: { emailOptIn?: boolean; emailOptInDate?: Date } = {}
  if (typeof body.emailOptIn === 'boolean') {
    emailOptInUpdate.emailOptIn = body.emailOptIn
    emailOptInUpdate.emailOptInDate = new Date()
  }

  const newName = body.name ?? developer.name
  const slugUpdate: { slug?: string } = {}
  if (body.name && body.name !== developer.name) {
    slugUpdate.slug = await generateUniqueSlug(body.name, developer.id)
  }

  await db.update(tables.developers).set({
    name: newName,
    ...slugUpdate,
    bio: body.bio ?? developer.bio,
    location: body.location ?? developer.location,
    yearsExperience: body.yearsExperience ?? developer.yearsExperience,
    website: body.website ?? developer.website,
    linkedinUrl: body.linkedinUrl ?? developer.linkedinUrl,
    twitterUrl: body.twitterUrl ?? developer.twitterUrl,
    ...emailOptInUpdate,
    updatedAt: new Date()
  }).where(eq(tables.developers.id, id))

  if (body.skills) {
    await db.delete(tables.developerSkills).where(eq(tables.developerSkills.developerId, id))
    if (body.skills.length) {
      await db.insert(tables.developerSkills).values(
        body.skills.map((skill: string) => ({
          developerId: id,
          skillName: skill
        }))
      )
    }
  }

  if (body.openTo) {
    const validOpenTo = validateOpenTo(body.openTo)
    await db.delete(tables.developerOpenTo).where(eq(tables.developerOpenTo.developerId, id))
    if (validOpenTo.length) {
      await db.insert(tables.developerOpenTo).values(
        validOpenTo.map(type => ({
          developerId: id,
          type
        }))
      )
    }

    const existingSpeaker = await db.query.speakerProfiles.findFirst({
      where: eq(tables.speakerProfiles.developerId, id)
    })

    if (validOpenTo.includes('conference')) {
      if (existingSpeaker) {
        await db.update(tables.speakerProfiles).set({
          topics: body.speakerTopics ? JSON.stringify(body.speakerTopics) : existingSpeaker.topics,
          available: body.speakerAvailable ?? existingSpeaker.available,
          remoteOk: body.remoteOk ?? existingSpeaker.remoteOk,
          travelWilling: body.travelWilling ?? existingSpeaker.travelWilling
        }).where(eq(tables.speakerProfiles.developerId, id))
      } else {
        await db.insert(tables.speakerProfiles).values({
          developerId: id,
          topics: body.speakerTopics ? JSON.stringify(body.speakerTopics) : null,
          available: true,
          remoteOk: body.remoteOk ?? true,
          travelWilling: body.travelWilling ?? false
        })
      }
    } else if (existingSpeaker) {
      await db.delete(tables.speakerProfiles).where(eq(tables.speakerProfiles.developerId, id))
    }
  }

  return { message: 'Profil mis à jour' }
})
