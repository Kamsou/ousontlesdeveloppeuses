import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const db = useDrizzle()

  const company = await db.query.companies.findFirst({
    where: eq(tables.companies.id, id),
    with: {
      reviews: {
        with: {
          developer: { columns: { id: true, name: true, avatarUrl: true } }
        }
      }
    }
  })

  if (!company) {
    throw createError({ statusCode: 404, message: 'Entreprise non trouvée' })
  }

  const reviewCount = company.reviews.length
  const avgRating = reviewCount > 0
    ? company.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
    : 0
  const inclusiveCount = company.reviews.filter(r => r.isInclusive).length
  const isVerifiedInclusive = reviewCount >= 5 && avgRating >= 4

  return {
    id: company.id,
    name: company.name,
    logoUrl: company.logoUrl,
    website: company.website,
    description: company.description,
    location: company.location,
    reviewCount,
    avgRating: Math.round(avgRating * 10) / 10,
    inclusiveCount,
    isVerifiedInclusive,
    reviews: company.reviews.map(r => ({
      id: r.id,
      rating: r.rating,
      isInclusive: r.isInclusive,
      comment: r.comment,
      createdAt: r.createdAt,
      developer: {
        id: r.developer.id,
        name: r.developer.name,
        avatarUrl: r.developer.avatarUrl
      }
    }))
  }
})
