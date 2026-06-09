import { getServerSession } from '#auth'
import { eq, and, inArray } from 'drizzle-orm'

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
  const { helpRequestId, sideProjectId, offerId } = body || {}

  if (!helpRequestId && !sideProjectId && !offerId) {
    throw createError({ statusCode: 400, message: 'helpRequestId, sideProjectId ou offerId requis' })
  }

  const db = useDrizzle()

  const developer = await db.query.developers.findFirst({
    where: eq(tables.developers.githubId, githubId)
  })

  if (!developer) {
    throw createError({ statusCode: 404, message: 'Profil non trouvé' })
  }

  const comments = await db.query.comments.findMany({
    where: helpRequestId
      ? eq(tables.comments.helpRequestId, helpRequestId)
      : sideProjectId
      ? eq(tables.comments.sideProjectId, sideProjectId)
      : eq(tables.comments.offerId, offerId),
    columns: { id: true, developerId: true }
  })

  const otherCommentIds = comments
    .filter(c => c.developerId !== developer.id)
    .map(c => c.id)

  if (otherCommentIds.length === 0) {
    return { marked: 0 }
  }

  const alreadyRead = await db.query.commentReads.findMany({
    where: and(
      eq(tables.commentReads.developerId, developer.id),
      inArray(tables.commentReads.commentId, otherCommentIds)
    ),
    columns: { commentId: true }
  })

  const alreadyReadIds = new Set(alreadyRead.map(r => r.commentId))
  const toMark = otherCommentIds.filter(id => !alreadyReadIds.has(id))

  if (toMark.length === 0) {
    return { marked: 0 }
  }

  await db.insert(tables.commentReads).values(
    toMark.map(commentId => ({
      developerId: developer.id,
      commentId
    }))
  )

  return { marked: toMark.length }
})
