import { getServerSession, getToken } from '#auth'
import { eq, and, gte, desc, ne, count } from 'drizzle-orm'

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

  const now = new Date()
  const dayOfWeek = now.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() + mondayOffset)
  weekStart.setHours(0, 0, 0, 0)

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

  const totalHelpGiven = await db.query.contactRequests.findMany({
    where: eq(tables.contactRequests.senderId, developer.id)
  })

  const skills = await db.query.developerSkills.findMany({
    where: eq(tables.developerSkills.developerId, developer.id)
  })

  const missingFields: string[] = []
  if (!developer.name) missingFields.push('nom')
  if (!developer.bio) missingFields.push('bio')
  if (!developer.location) missingFields.push('ville')
  if (typeof developer.yearsExperience !== 'number') missingFields.push('années d\'expérience')
  if (!developer.linkedinUrl) missingFields.push('LinkedIn')
  if (skills.length === 0) missingFields.push('compétences')

  const profileComplete = missingFields.length === 0

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

  const [weeklyNewMembers, weeklyHelpRequests, weeklyNewProjects] = await Promise.all([
    db.select({ count: count() }).from(tables.developers)
      .where(and(
        gte(tables.developers.createdAt, weekStart),
        ne(tables.developers.id, developer.id)
      )),
    db.select({ count: count() }).from(tables.helpRequests)
      .where(and(
        gte(tables.helpRequests.createdAt, weekStart),
        ne(tables.helpRequests.developerId, developer.id)
      )),
    db.select({ count: count() }).from(tables.sideProjects)
      .where(and(
        gte(tables.sideProjects.createdAt, weekStart),
        ne(tables.sideProjects.developerId, developer.id)
      ))
  ])

  return {
    isNew: false,
    weeklyContactsReceived: receivedContacts.length,
    weeklyContactsSent: sentContacts.length,
    recentExchanges,
    totalHelpGiven: totalHelpGiven.filter(c => c.helpRequestId).length,
    profileComplete,
    missingFields: profileComplete ? [] : missingFields,
    memberSince: developer.createdAt,
    communityNewMembers: weeklyNewMembers[0].count,
    communityHelpRequests: weeklyHelpRequests[0].count,
    communityNewProjects: weeklyNewProjects[0].count
  }
})
