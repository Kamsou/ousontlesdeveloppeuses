import { getServerSession } from '#auth'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session?.user?.email) {
    throw createError({ statusCode: 401, message: 'Non autorisé' })
  }

  const db = useDrizzle()

  const developer = await db.query.developers.findFirst({
    where: eq(tables.developers.email, session.user.email)
  })

  if (!developer) {
    throw createError({ statusCode: 403, message: 'Profil requis' })
  }

  const body = await readBody(event)

  if (!body.content?.trim()) {
    throw createError({ statusCode: 400, message: 'Contenu requis' })
  }

  if (!body.helpRequestId && !body.sideProjectId) {
    throw createError({ statusCode: 400, message: 'helpRequestId ou sideProjectId requis' })
  }

  if (body.helpRequestId && body.sideProjectId) {
    throw createError({ statusCode: 400, message: 'Un seul type de cible autorisé' })
  }

  const [comment] = await db.insert(tables.comments).values({
    developerId: developer.id,
    helpRequestId: body.helpRequestId || null,
    sideProjectId: body.sideProjectId || null,
    content: body.content.trim()
  }).returning()

  return {
    ...comment,
    developer: {
      id: developer.id,
      name: developer.name,
      avatarUrl: developer.avatarUrl
    }
  }
})
