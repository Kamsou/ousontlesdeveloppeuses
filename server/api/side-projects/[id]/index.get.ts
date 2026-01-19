import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id || isNaN(Number(id))) {
    throw createError({ statusCode: 400, message: 'ID invalide' })
  }

  const db = useDrizzle()

  const project = await db.query.sideProjects.findFirst({
    where: eq(tables.sideProjects.id, Number(id)),
    with: {
      developer: {
        columns: {
          id: true,
          name: true,
          avatarUrl: true,
          location: true,
          bio: true,
          githubUrl: true
        },
        with: {
          skills: true
        }
      },
      techs: true
    }
  })

  if (!project) {
    throw createError({ statusCode: 404, message: 'Projet non trouvé' })
  }

  return {
    ...project,
    techs: project.techs.map(t => t.techName),
    developer: {
      ...project.developer,
      skills: project.developer.skills.map(s => s.skillName)
    }
  }
})
