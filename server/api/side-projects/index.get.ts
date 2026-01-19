import { desc } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const db = useDrizzle()

  const projects = await db.query.sideProjects.findMany({
    with: {
      developer: {
        columns: {
          id: true,
          name: true,
          avatarUrl: true,
          location: true
        }
      },
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
