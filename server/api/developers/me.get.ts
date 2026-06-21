import { getServerSession } from '#auth'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)

  if (!session?.user) {
    throw createError({ statusCode: 401, message: 'Non authentifié' })
  }

  const githubId = session.user.id

  if (!githubId) {
    return null
  }

  const db = useDrizzle()

  const developer = await db.query.developers.findFirst({
    where: eq(tables.developers.githubId, githubId),
    with: {
      skills: true,
      openTo: true,
      lookingFor: true,
      speakerProfile: true
    }
  })

  if (!developer) {
    return null
  }

  await db.update(tables.developers)
    .set({ lastLoginAt: new Date() })
    .where(eq(tables.developers.id, developer.id))

  return {
    id: developer.id,
    slug: developer.slug,
    name: developer.name,
    email: developer.email,
    avatarUrl: developer.avatarUrl,
    bio: developer.bio,
    title: developer.title,
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
    lookingFor: developer.lookingFor.map(l => l.type),
    lookingForSince: developer.lookingForSince?.toISOString() || null,
    speakerProfile: developer.speakerProfile ? {
      topics: parseTopics(developer.speakerProfile.topics),
      pastTalksUrl: developer.speakerProfile.pastTalksUrl,
      available: developer.speakerProfile.available,
      remoteOk: developer.speakerProfile.remoteOk,
      travelWilling: developer.speakerProfile.travelWilling
    } : null,
    emailOptIn: developer.emailOptIn ?? false,
    emailOptInAsked: developer.emailOptInDate !== null,
    commentsNotificationsEnabled: developer.commentsNotificationsEnabled ?? true
  }
})
