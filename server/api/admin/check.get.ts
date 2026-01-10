import { getServerSession } from '#auth'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)

  if (!session?.user) {
    return false
  }

  const githubId = (session.user as any).id
  if (!githubId) return false

  const db = useDrizzle()
  const developer = await db.query.developers.findFirst({
    where: eq(tables.developers.githubId, githubId)
  })

  return developer?.isAdmin === true
})
