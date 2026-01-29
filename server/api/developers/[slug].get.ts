import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const param = getRouterParam(event, 'slug')

  if (!param) {
    throw createError({ statusCode: 400, message: 'Paramètre requis' })
  }

  const db = useDrizzle()

  const isNumeric = /^\d+$/.test(param)

  const developer = await db.query.developers.findFirst({
    where: isNumeric
      ? eq(tables.developers.id, Number(param))
      : eq(tables.developers.slug, param),
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
    slug: developer.slug,
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
