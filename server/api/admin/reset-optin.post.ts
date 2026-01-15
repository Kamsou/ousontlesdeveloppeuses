import { getServerSession } from '#auth'
import { eq, like } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)

  if (!session?.user) {
    throw createError({ statusCode: 401, message: 'Non authentifié' })
  }

  const db = useDrizzle()

  const admin = await db.query.developers.findFirst({
    where: eq(tables.developers.email, session.user.email!)
  })

  if (!admin?.isAdmin) {
    throw createError({ statusCode: 403, message: 'Non autorisé' })
  }

  const body = await readBody(event)
  const name = body.name as string

  if (!name) {
    throw createError({ statusCode: 400, message: 'Name required' })
  }

  await db.update(tables.developers)
    .set({ emailOptIn: false, emailOptInDate: null })
    .where(like(tables.developers.name, `%${name}%`))

  return { success: true, message: `Reset opt-in for users matching "${name}"` }
})
