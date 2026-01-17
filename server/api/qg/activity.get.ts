import { getServerSession, getToken } from '#auth'
import { eq, and, gte, desc } from 'drizzle-orm'

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
    return {
      isNew: true,
      weeklyViews: 0,
      recentContacts: [],
      totalHelpGiven: 0,
      profileComplete: false
    }
  }

  // Date de début de la semaine (lundi)
  const now = new Date()
  const dayOfWeek = now.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() + mondayOffset)
  weekStart.setHours(0, 0, 0, 0)

  // Contacts reçus cette semaine (messages reçus)
  const receivedContacts = await db.query.contactRequests.findMany({
    where: and(
      eq(tables.contactRequests.recipientId, developer.id),
      gte(tables.contactRequests.createdAt, weekStart)
    ),
    with: {
      sender: true,
      helpRequest: true
    },
    orderBy: [desc(tables.contactRequests.createdAt)]
  })

  // Contacts envoyés cette semaine
  const sentContacts = await db.query.contactRequests.findMany({
    where: and(
      eq(tables.contactRequests.senderId, developer.id),
      gte(tables.contactRequests.createdAt, weekStart)
    ),
    with: {
      recipient: true,
      helpRequest: true
    },
    orderBy: [desc(tables.contactRequests.createdAt)]
  })

  // Total des aides données (contacts envoyés en réponse à des help requests)
  const totalHelpGiven = await db.query.contactRequests.findMany({
    where: eq(tables.contactRequests.senderId, developer.id)
  })

  // Vérifier si le profil est complet
  const skills = await db.query.developerSkills.findMany({
    where: eq(tables.developerSkills.developerId, developer.id)
  })

  const profileComplete = Boolean(
    developer.name &&
    developer.bio &&
    developer.location &&
    developer.linkedinUrl &&
    skills.length > 0
  )

  // Formater les échanges récents
  const recentExchanges = [
    ...receivedContacts.map(c => ({
      type: 'received' as const,
      name: c.sender.name,
      avatarUrl: c.sender.avatarUrl,
      helpRequestTitle: c.helpRequest?.title,
      date: c.createdAt
    })),
    ...sentContacts.map(c => ({
      type: 'sent' as const,
      name: c.recipient.name,
      avatarUrl: c.recipient.avatarUrl,
      helpRequestTitle: c.helpRequest?.title,
      date: c.createdAt
    }))
  ].sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime())
    .slice(0, 3)

  return {
    isNew: false,
    weeklyContactsReceived: receivedContacts.length,
    weeklyContactsSent: sentContacts.length,
    recentExchanges,
    totalHelpGiven: totalHelpGiven.filter(c => c.helpRequestId).length,
    profileComplete,
    memberSince: developer.createdAt
  }
})
