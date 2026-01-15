import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))

  if (isNaN(id)) {
    throw createError({ statusCode: 400, message: 'ID invalide' })
  }

  const db = useDrizzle()

  const developer = await db.query.developers.findFirst({
    where: eq(tables.developers.id, id),
    with: {
      skills: true,
      openTo: true,
      speakerProfile: true
    }
  })

  if (!developer) {
    throw createError({ statusCode: 404, message: 'Profil non trouvé' })
  }

  return {
    id: developer.id,
    name: developer.name,
    avatarUrl: developer.avatarUrl,
    bio: developer.bio,
    location: developer.location,
    yearsExperience: developer.yearsExperience,
    website: developer.website,
    githubUrl: developer.githubUrl,
    linkedinUrl: developer.linkedinUrl,
    twitterUrl: developer.twitterUrl,
    skills: developer.skills.map(s => s.skillName),
    openTo: developer.openTo.map(o => o.type),
    speakerProfile: developer.speakerProfile ? {
      topics: parseTopics(developer.speakerProfile.topics),
      available: developer.speakerProfile.available,
      remoteOk: developer.speakerProfile.remoteOk,
      travelWilling: developer.speakerProfile.travelWilling
    } : null
  }
})
