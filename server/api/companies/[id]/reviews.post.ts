import { getServerSession } from '#auth'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)

  if (!session?.user) {
    throw createError({ statusCode: 401, message: 'Non authentifié' })
  }

  const githubId = session.user.id

  const companyId = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const db = useDrizzle()

  const developer = await db.query.developers.findFirst({
    where: eq(tables.developers.githubId, githubId)
  })

  if (!developer) {
    throw createError({ statusCode: 400, message: 'Profil développeur requis' })
  }

  const company = await db.query.companies.findFirst({
    where: eq(tables.companies.id, companyId)
  })

  if (!company) {
    throw createError({ statusCode: 404, message: 'Entreprise non trouvée' })
  }

  const existingReview = await db.query.companyReviews.findFirst({
    where: and(
      eq(tables.companyReviews.companyId, companyId),
      eq(tables.companyReviews.developerId, developer.id)
    )
  })

  if (existingReview) {
    throw createError({ statusCode: 400, message: 'Vous avez déjà donné un avis' })
  }

  if (!body.rating || body.rating < 1 || body.rating > 5) {
    throw createError({ statusCode: 400, message: 'Note entre 1 et 5 requise' })
  }

  if (typeof body.isInclusive !== 'boolean') {
    throw createError({ statusCode: 400, message: 'Inclusivité requise' })
  }

  const result = await db.insert(tables.companyReviews).values({
    companyId,
    developerId: developer.id,
    rating: body.rating,
    isInclusive: body.isInclusive,
    comment: body.comment || null
  }).returning()

  return result[0]
})
