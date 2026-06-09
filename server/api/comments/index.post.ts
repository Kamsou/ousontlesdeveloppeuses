import { getServerSession } from '#auth'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)

  if (!session?.user) {
    throw createError({ statusCode: 401, message: 'Non autorisé' })
  }

  const githubId = session.user.id
  if (!githubId) {
    throw createError({ statusCode: 400, message: 'ID GitHub non trouvé' })
  }

  const db = useDrizzle()

  const developer = await db.query.developers.findFirst({
    where: eq(tables.developers.githubId, githubId)
  })

  if (!developer) {
    throw createError({ statusCode: 403, message: 'Profil requis' })
  }

  const body = await readBody(event)

  if (!body.content?.trim()) {
    throw createError({ statusCode: 400, message: 'Contenu requis' })
  }

  if (body.content.trim().length > 2000) {
    throw createError({ statusCode: 400, message: 'Commentaire trop long (2000 caractères max)' })
  }

  const targetCount = [body.helpRequestId, body.sideProjectId, body.offerId].filter(Boolean).length

  if (targetCount === 0) {
    throw createError({ statusCode: 400, message: 'helpRequestId, sideProjectId ou offerId requis' })
  }

  if (targetCount > 1) {
    throw createError({ statusCode: 400, message: 'Un seul type de cible autorisé' })
  }

  const [comment] = await db.insert(tables.comments).values({
    developerId: developer.id,
    helpRequestId: body.helpRequestId || null,
    sideProjectId: body.sideProjectId || null,
    offerId: body.offerId || null,
    content: body.content.trim()
  }).returning()

  await sendCommentNotifications({
    commentAuthorId: developer.id,
    commentAuthorName: developer.name,
    commentContent: body.content.trim(),
    helpRequestId: body.helpRequestId,
    sideProjectId: body.sideProjectId,
    offerId: body.offerId
  }).catch(console.error)

  return {
    ...comment,
    developer: {
      id: developer.id,
      slug: developer.slug,
      name: developer.name,
      avatarUrl: developer.avatarUrl
    }
  }
})
