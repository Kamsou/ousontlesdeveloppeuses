import { getServerSession } from '#auth'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session?.user) {
    throw createError({ statusCode: 401, message: 'Non autorisé' })
  }

  const githubId = (session.user as any).id
  if (!githubId) {
    throw createError({ statusCode: 401, message: 'Non autorisé' })
  }

  const db = useDrizzle()

  const admin = await db.query.developers.findFirst({
    where: eq(tables.developers.githubId, githubId),
  })

  if (!admin?.isAdmin) {
    throw createError({ statusCode: 403, message: 'Accès refusé' })
  }

  const subscribers = await db.query.developers.findMany({
    where: eq(tables.developers.emailOptIn, true),
    columns: {
      id: true,
      name: true,
      email: true,
      emailOptInDate: true,
    },
    orderBy: (developers, { desc }) => [desc(developers.emailOptInDate)],
  })

  return subscribers
})
