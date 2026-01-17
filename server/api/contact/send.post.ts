import { getServerSession, getToken } from '#auth'
import { eq, and, gte } from 'drizzle-orm'
import { sendContactEmail } from '../../utils/email'

const DAILY_LIMIT = 5

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

  const body = await readBody(event)
  const { recipientId, message, helpRequestId } = body

  if (!recipientId || !message?.trim()) {
    throw createError({ statusCode: 400, message: 'Destinataire et message requis' })
  }

  if (message.length > 1000) {
    throw createError({ statusCode: 400, message: 'Message trop long (max 1000 caractères)' })
  }

  const db = useDrizzle()

  const sender = await db.query.developers.findFirst({
    where: eq(tables.developers.githubId, githubId)
  })

  if (!sender) {
    throw createError({ statusCode: 404, message: 'Profil non trouvé' })
  }

  if (!sender.email) {
    throw createError({ statusCode: 400, message: 'Tu dois avoir un email dans ton profil pour contacter quelqu\'un' })
  }

  const recipient = await db.query.developers.findFirst({
    where: eq(tables.developers.id, Number(recipientId))
  })

  if (!recipient) {
    throw createError({ statusCode: 404, message: 'Destinataire non trouvé' })
  }

  if (!recipient.email) {
    throw createError({ statusCode: 400, message: 'Ce profil n\'a pas d\'email public' })
  }

  if (recipient.id === sender.id) {
    throw createError({ statusCode: 400, message: 'Tu ne peux pas te contacter toi-même' })
  }

  // Rate limiting: max 5 contacts par jour
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todayContacts = await db.query.contactRequests.findMany({
    where: and(
      eq(tables.contactRequests.senderId, sender.id),
      gte(tables.contactRequests.createdAt, today)
    )
  })

  if (todayContacts.length >= DAILY_LIMIT) {
    throw createError({
      statusCode: 429,
      message: `Tu as atteint la limite de ${DAILY_LIMIT} messages par jour. Réessaie demain.`
    })
  }

  // Récupérer le titre de la demande si helpRequestId est fourni
  let helpRequestTitle: string | undefined

  if (helpRequestId) {
    const helpRequest = await db.query.helpRequests.findFirst({
      where: eq(tables.helpRequests.id, Number(helpRequestId))
    })
    helpRequestTitle = helpRequest?.title
  }

  // Envoyer l'email
  try {
    await sendContactEmail({
      senderName: sender.name,
      senderEmail: sender.email,
      recipientName: recipient.name,
      recipientEmail: recipient.email,
      message: message.trim(),
      helpRequestTitle
    })
  } catch (error) {
    console.error('Erreur envoi email:', error)
    throw createError({ statusCode: 500, message: 'Erreur lors de l\'envoi de l\'email' })
  }

  // Logger en DB
  await db.insert(tables.contactRequests).values({
    senderId: sender.id,
    recipientId: recipient.id,
    helpRequestId: helpRequestId ? Number(helpRequestId) : null,
    message: message.trim()
  })

  return {
    success: true,
    remainingToday: DAILY_LIMIT - todayContacts.length - 1
  }
})
