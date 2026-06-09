import { getServerSession } from '#auth'
import { eq, and, ne } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)

  if (!session?.user) {
    throw createError({ statusCode: 401, message: 'Non authentifié' })
  }

  const githubId = session.user.id
  if (!githubId) {
    throw createError({ statusCode: 400, message: 'ID GitHub non trouvé' })
  }

  const body = await readBody(event)

  if (!body.templateId) {
    throw createError({ statusCode: 400, message: 'templateId requis' })
  }

  const template = challengeTemplates.find(t => t.id === body.templateId)
  if (!template) {
    throw createError({ statusCode: 400, message: 'Challenge inconnu' })
  }

  const db = useDrizzle()

  const developer = await db.query.developers.findFirst({
    where: eq(tables.developers.githubId, githubId)
  })

  if (!developer) {
    throw createError({ statusCode: 404, message: 'Profil non trouvé' })
  }

  const existing = await db.query.challenges.findFirst({
    where: and(
      eq(tables.challenges.developerId, developer.id),
      eq(tables.challenges.status, 'active'),
      ne(tables.challenges.templateId, '')
    )
  })

  if (existing) {
    throw createError({ statusCode: 400, message: 'Tu as déjà un challenge en cours' })
  }

  const [inserted] = await db.insert(tables.challenges).values({
    developerId: developer.id,
    templateId: template.id,
    title: template.title,
    description: template.description,
    category: template.category,
    status: 'active'
  }).returning()

  return inserted
})
