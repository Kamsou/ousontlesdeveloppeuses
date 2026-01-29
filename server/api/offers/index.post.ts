import { getServerSession, getToken } from '#auth'
import { eq, count } from 'drizzle-orm'
import { isValidUrl } from '../../utils/validation'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  const token = await getToken({ event })

  if (!session?.user) {
    throw createError({ statusCode: 401, message: 'Non authentifié' })
  }

  const githubId = (token?.id || token?.sub) as string
  if (!githubId) {
    throw createError({ statusCode: 400, message: 'ID GitHub non trouvé' })
  }

  const db = useDrizzle()

  const developer = await db.query.developers.findFirst({
    where: eq(tables.developers.githubId, githubId)
  })

  if (!developer) {
    throw createError({ statusCode: 404, message: 'Profil non trouvé' })
  }

  const [offerCount] = await db
    .select({ count: count() })
    .from(tables.offers)
    .where(eq(tables.offers.developerId, developer.id))

  if (offerCount.count >= 5) {
    throw createError({
      statusCode: 400,
      message: 'Tu as déjà 5 offres. Supprime une offre pour en créer une nouvelle.'
    })
  }

  const body = await readBody(event)

  const title = body.title?.trim()
  if (!title) {
    throw createError({ statusCode: 400, message: 'Le titre est requis' })
  }
  if (title.length > 200) {
    throw createError({ statusCode: 400, message: 'Le titre est trop long (200 caractères max)' })
  }

  const description = body.description?.trim() || null
  if (description && description.length > 1000) {
    throw createError({ statusCode: 400, message: 'La description est trop longue (1000 caractères max)' })
  }

  const url = body.url?.trim() || null
  if (url && !isValidUrl(url)) {
    throw createError({ statusCode: 400, message: 'URL invalide' })
  }

  const location = body.location?.trim() || null
  if (location && location.length > 100) {
    throw createError({ statusCode: 400, message: 'La localisation est trop longue (100 caractères max)' })
  }

  const validTypes = ['alternance', 'stage', 'cdi', 'freelance', 'other']
  const type = body.type && validTypes.includes(body.type) ? body.type : 'other'

  const [offer] = await db.insert(tables.offers).values({
    developerId: developer.id,
    title,
    description,
    url,
    type,
    location
  }).returning()

  return { id: offer.id, message: 'Offre créée' }
})
