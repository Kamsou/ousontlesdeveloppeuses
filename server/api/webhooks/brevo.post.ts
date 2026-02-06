import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const config = useRuntimeConfig()

  if (!config.brevoWebhookSecret || query.secret !== config.brevoWebhookSecret) {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }

  const body = await readBody(event)

  if (body.event !== 'unsubscribe' && body.event !== 'list_unsubscribe') {
    return { ok: true }
  }

  const email = body.email
  if (!email || typeof email !== 'string') {
    return { ok: true }
  }

  const db = useDrizzle()

  await db.update(tables.developers).set({
    emailOptIn: false,
    emailOptInDate: new Date(),
  }).where(eq(tables.developers.email, email))

  return { ok: true }
})
