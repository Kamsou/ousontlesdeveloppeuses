import { getServerSession, getToken } from '#auth'
import { eq, and, ne, count } from 'drizzle-orm'

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

  const [projectCount] = await db
    .select({ count: count() })
    .from(tables.sideProjects)
    .where(
      and(
        eq(tables.sideProjects.developerId, developer.id),
        ne(tables.sideProjects.status, 'completed')
      )
    )

  if (projectCount.count >= 3) {
    throw createError({
      statusCode: 400,
      message: 'Tu as déjà 3 projets actifs. Termine ou supprime un projet pour en créer un nouveau.'
    })
  }

  const body = await readBody(event)

  if (!body.title?.trim()) {
    throw createError({ statusCode: 400, message: 'Le titre est requis' })
  }

  if (!body.description?.trim()) {
    throw createError({ statusCode: 400, message: 'La description est requise' })
  }

  const validStatuses = ['idea', 'open_to_contributors', 'looking_for_cofounder', 'completed']
  const status = body.status && validStatuses.includes(body.status) ? body.status : 'open_to_contributors'

  const [sideProject] = await db.insert(tables.sideProjects).values({
    developerId: developer.id,
    title: body.title.trim(),
    description: body.description.trim(),
    repoUrl: body.repoUrl?.trim() || null,
    websiteUrl: body.websiteUrl?.trim() || null,
    status
  }).returning()

  if (body.techs?.length) {
    await db.insert(tables.sideProjectTechs).values(
      body.techs.map((tech: string) => ({
        sideProjectId: sideProject.id,
        techName: tech.trim()
      }))
    )
  }

  return { id: sideProject.id, message: 'Projet créé' }
})
