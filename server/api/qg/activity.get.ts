import { getServerSession, getToken } from '#auth'
import { eq, and, gte, desc, ne, count, or, inArray, notInArray, isNotNull } from 'drizzle-orm'

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

  const [weeklyNewMembers, weeklyHelpRequests, weeklyNewProjects, weeklyCommentsReceived] = await Promise.all([
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
      )),
    db.query.comments.findMany({
      where: and(
        ne(tables.comments.developerId, developer.id),
        gte(tables.comments.createdAt, weekStart),
        or(
          inArray(tables.comments.helpRequestId,
            db.select({ id: tables.helpRequests.id }).from(tables.helpRequests)
              .where(eq(tables.helpRequests.developerId, developer.id))
          ),
          inArray(tables.comments.sideProjectId,
            db.select({ id: tables.sideProjects.id }).from(tables.sideProjects)
              .where(eq(tables.sideProjects.developerId, developer.id))
          ),
          inArray(tables.comments.helpRequestId,
            db.select({ id: tables.comments.helpRequestId }).from(tables.comments)
              .where(and(
                eq(tables.comments.developerId, developer.id),
                isNotNull(tables.comments.helpRequestId)
              ))
          ),
          inArray(tables.comments.sideProjectId,
            db.select({ id: tables.comments.sideProjectId }).from(tables.comments)
              .where(and(
                eq(tables.comments.developerId, developer.id),
                isNotNull(tables.comments.sideProjectId)
              ))
          )
        ),
        notInArray(tables.comments.id,
          db.select({ id: tables.commentReads.commentId }).from(tables.commentReads)
            .where(eq(tables.commentReads.developerId, developer.id))
        )
      ),
      columns: { id: true, helpRequestId: true, sideProjectId: true }
    })
  ])

  // Group unread comments by content
  const commentsByContent = new Map<string, { type: 'project' | 'request'; id: number; count: number }>()
  for (const c of weeklyCommentsReceived) {
    const key = c.sideProjectId ? `project-${c.sideProjectId}` : `request-${c.helpRequestId}`
    const existing = commentsByContent.get(key)
    if (existing) {
      existing.count++
    } else {
      commentsByContent.set(key, {
        type: c.sideProjectId ? 'project' : 'request',
        id: (c.sideProjectId || c.helpRequestId)!,
        count: 1
      })
    }
  }

  // Fetch titles for commented content
  const contentEntries = [...commentsByContent.values()]
  const projectIds = contentEntries.filter(e => e.type === 'project').map(e => e.id)
  const requestIds = contentEntries.filter(e => e.type === 'request').map(e => e.id)

  const [projects, requests] = await Promise.all([
    projectIds.length
      ? db.query.sideProjects.findMany({
          where: inArray(tables.sideProjects.id, projectIds),
          columns: { id: true, title: true }
        })
      : [],
    requestIds.length
      ? db.query.helpRequests.findMany({
          where: inArray(tables.helpRequests.id, requestIds),
          columns: { id: true, title: true }
        })
      : []
  ])

  const titleMap = new Map<string, string>()
  for (const p of projects) titleMap.set(`project-${p.id}`, p.title)
  for (const r of requests) titleMap.set(`request-${r.id}`, r.title)

  const unreadComments = contentEntries.map(e => ({
    type: e.type,
    id: e.id,
    title: titleMap.get(`${e.type}-${e.id}`) || '',
    count: e.count
  }))

  return {
    isNew: false,
    weeklyContactsReceived: receivedContacts.length,
    weeklyContactsSent: sentContacts.length,
    recentExchanges,
    totalHelpGiven: totalHelpGiven.filter(c => c.helpRequestId).length,
    profileComplete,
    missingFields: profileComplete ? [] : missingFields,
    memberSince: developer.createdAt,
    unreadComments,
    communityNewMembers: weeklyNewMembers[0].count,
    communityHelpRequests: weeklyHelpRequests[0].count,
    communityNewProjects: weeklyNewProjects[0].count
  }
})
