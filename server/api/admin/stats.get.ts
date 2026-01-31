import { getServerSession } from '#auth'
import { eq, sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)

  if (!session?.user) {
    throw createError({ statusCode: 401, message: 'Non authentifié' })
  }

  const githubId = (session.user as any).id
  if (!githubId) {
    throw createError({ statusCode: 401, message: 'Non authentifié' })
  }

  const db = useDrizzle()
  const currentUser = await db.query.developers.findFirst({
    where: eq(tables.developers.githubId, githubId)
  })

  if (!currentUser?.isAdmin) {
    throw createError({ statusCode: 403, message: 'Accès refusé' })
  }

  const [developers, skills, locations, helpRequests, contacts, speakers] = await Promise.all([
    // Inscriptions par mois
    db.all(sql`
      SELECT
        strftime('%Y-%m', datetime(created_at, 'unixepoch')) as month,
        COUNT(*) as count
      FROM developers
      WHERE created_at IS NOT NULL
      GROUP BY month
      ORDER BY month DESC
    `),

    // Top skills
    db.all(sql`
      SELECT skill_name as name, COUNT(*) as count
      FROM developer_skills
      GROUP BY skill_name
      ORDER BY count DESC
      LIMIT 15
    `),

    // Répartition géographique
    db.all(sql`
      SELECT location, COUNT(*) as count
      FROM developers
      WHERE location IS NOT NULL AND location != ''
      GROUP BY location
      ORDER BY count DESC
      LIMIT 15
    `),

    // Demandes d'aide par statut
    db.all(sql`
      SELECT status, COUNT(*) as count
      FROM help_requests
      GROUP BY status
    `),

    // Mises en relation par statut
    db.all(sql`
      SELECT status, COUNT(*) as count
      FROM contact_requests
      GROUP BY status
    `),

    // Nombre de speakeuses
    db.all(sql`
      SELECT COUNT(*) as count FROM speaker_profiles
    `)
  ])

  return {
    signupsByMonth: developers as { month: string, count: number }[],
    topSkills: skills as { name: string, count: number }[],
    topLocations: locations as { location: string, count: number }[],
    helpRequestsByStatus: helpRequests as { status: string, count: number }[],
    contactsByStatus: contacts as { status: string, count: number }[],
    speakersCount: (speakers as any[])[0]?.count || 0
  }
})
