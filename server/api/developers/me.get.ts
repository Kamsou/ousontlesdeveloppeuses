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
    return null
  }

  const db = useDrizzle()

  const developer = await db.query.developers.findFirst({
    where: eq(tables.developers.githubId, githubId),
    with: {
      skills: true,
      openTo: true,
      speakerProfile: true
    }
  })

  if (!developer) {
    return null
  }

  return {
    id: developer.id,
    name: developer.name,
    email: developer.email,
    avatarUrl: developer.avatarUrl,
    bio: developer.bio,
    location: developer.location,
    yearsExperience: developer.yearsExperience,
    website: developer.website,
    githubUrl: developer.githubUrl,
    linkedinUrl: developer.linkedinUrl,
    twitterUrl: developer.twitterUrl,
    profileType: developer.profileType,
    profilePhrase: developer.profilePhrase,
    skills: developer.skills.map(s => s.skillName),
    openTo: developer.openTo.map(o => o.type),
    speakerProfile: developer.speakerProfile ? {
      topics: developer.speakerProfile.topics ? JSON.parse(developer.speakerProfile.topics) : [],
      available: developer.speakerProfile.available,
      remoteOk: developer.speakerProfile.remoteOk,
      travelWilling: developer.speakerProfile.travelWilling
    } : null
  }
})
