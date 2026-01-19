import { getServerSession, getToken } from '#auth'
import { eq, desc } from 'drizzle-orm'

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

  const projects = await db.query.sideProjects.findMany({
    where: eq(tables.sideProjects.developerId, developer.id),
    with: {
      techs: true,
      comments: {
        columns: { id: true }
      }
    },
    orderBy: [desc(tables.sideProjects.createdAt)]
  })

  return projects.map(project => ({
    ...project,
    techs: project.techs.map(t => t.techName),
    commentsCount: project.comments.length,
    comments: undefined
  }))
})
