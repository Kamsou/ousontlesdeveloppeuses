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
  const currentUser = await db.query.developers.findFirst({
    where: eq(tables.developers.githubId, githubId)
  })

  if (!currentUser?.isAdmin) {
    throw createError({ statusCode: 403, message: 'Accès refusé' })
  }

  const developers = await db.query.developers.findMany({
    with: {
      skills: true,
      openTo: true,
      speakerProfile: true
    },
    orderBy: (developers, { desc }) => [desc(developers.createdAt)]
  })

  return developers.map(d => ({
    id: d.id,
    githubId: d.githubId,
    name: d.name,
    email: d.email,
    avatarUrl: d.avatarUrl,
    location: d.location,
    bio: d.bio,
    yearsExperience: d.yearsExperience,
    website: d.website,
    githubUrl: d.githubUrl,
    linkedinUrl: d.linkedinUrl,
    skills: d.skills.map(s => s.skillName),
    openTo: d.openTo.map(o => o.type),
    isSpeaker: d.speakerProfile?.available || d.openTo.some(o => o.type === 'conference'),
    createdAt: d.createdAt,
    updatedAt: d.updatedAt
  }))
})
