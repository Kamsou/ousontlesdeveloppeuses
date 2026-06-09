import { getServerSession } from '#auth'
import { eq } from 'drizzle-orm'
import { sendAdminNewHelpRequest } from '../../utils/email'

export default defineEventHandler(async (event) => {
  useRateLimit(event, { windowMs: 60 * 60 * 1000, max: 5 })

  const session = await getServerSession(event)

  if (!session?.user) {
    throw createError({ statusCode: 401, message: 'Non authentifié' })
  }

  const githubId = session.user.id
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

  const body = await readBody(event)

  if (!body.title?.trim()) {
    throw createError({ statusCode: 400, message: 'Le titre est requis' })
  }

  if (!body.helpType) {
    throw createError({ statusCode: 400, message: 'Le type d\'aide est requis' })
  }

  const validTypes = ['bug', 'review', 'advice', 'pair', 'other']
  if (!validTypes.includes(body.helpType)) {
    throw createError({ statusCode: 400, message: 'Type d\'aide invalide' })
  }

  const [helpRequest] = await db.insert(tables.helpRequests).values({
    developerId: developer.id,
    title: body.title.trim(),
    description: body.description?.trim() || null,
    helpType: body.helpType
  }).returning()

  const techs: string[] = []
  if (body.techs?.length) {
    await db.insert(tables.helpRequestTechs).values(
      body.techs.map((tech: string) => {
        techs.push(tech.trim())
        return {
          helpRequestId: helpRequest.id,
          techName: tech.trim()
        }
      })
    )
  }

  await sendAdminNewHelpRequest(developer.name, body.title.trim(), techs).catch(console.error)

  return { id: helpRequest.id, message: 'Demande créée' }
})
