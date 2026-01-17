import { getServerSession } from '#auth'
import { eq, desc, sql, count, avg } from 'drizzle-orm'

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

  // Stats globales
  const totalContacts = await db.select({ count: count() })
    .from(tables.contactRequests)

  const feedbackRequested = await db.select({ count: count() })
    .from(tables.contactRequests)
    .where(sql`${tables.contactRequests.feedbackToken} IS NOT NULL`)

  const feedbackReceived = await db.select({ count: count() })
    .from(tables.contactFeedbacks)

  const exchangeHappenedCount = await db.select({ count: count() })
    .from(tables.contactFeedbacks)
    .where(eq(tables.contactFeedbacks.exchangeHappened, true))

  const avgRating = await db.select({ avg: avg(tables.contactFeedbacks.usefulnessRating) })
    .from(tables.contactFeedbacks)
    .where(sql`${tables.contactFeedbacks.usefulnessRating} IS NOT NULL`)

  // Liste des feedbacks avec détails
  const feedbacks = await db.query.contactFeedbacks.findMany({
    with: {
      contactRequest: {
        with: {
          sender: {
            columns: { id: true, name: true, avatarUrl: true }
          },
          recipient: {
            columns: { id: true, name: true, avatarUrl: true }
          }
        }
      }
    },
    orderBy: desc(tables.contactFeedbacks.createdAt)
  })

  return {
    stats: {
      totalContacts: totalContacts[0]?.count || 0,
      feedbackRequested: feedbackRequested[0]?.count || 0,
      feedbackReceived: feedbackReceived[0]?.count || 0,
      exchangeHappened: exchangeHappenedCount[0]?.count || 0,
      avgRating: avgRating[0]?.avg ? Number(avgRating[0].avg).toFixed(1) : null,
      responseRate: feedbackRequested[0]?.count
        ? Math.round((feedbackReceived[0]?.count || 0) / feedbackRequested[0].count * 100)
        : 0,
      successRate: feedbackReceived[0]?.count
        ? Math.round((exchangeHappenedCount[0]?.count || 0) / feedbackReceived[0].count * 100)
        : 0
    },
    feedbacks: feedbacks.map(f => ({
      id: f.id,
      exchangeHappened: f.exchangeHappened,
      usefulnessRating: f.usefulnessRating,
      comment: f.comment,
      createdAt: f.createdAt,
      sender: f.contactRequest.sender,
      recipient: f.contactRequest.recipient
    }))
  }
})
