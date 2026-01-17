import type { H3Event } from 'h3'

const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

interface RateLimitOptions {
  windowMs?: number
  max?: number
  keyGenerator?: (event: H3Event) => string
}

export function useRateLimit(event: H3Event, options: RateLimitOptions = {}) {
  const {
    windowMs = 60 * 1000,
    max = 10,
    keyGenerator = (e) => {
      const ip = getRequestIP(e, { xForwardedFor: true }) || 'unknown'
      return `ratelimit:${ip}`
    }
  } = options

  const key = keyGenerator(event)
  const now = Date.now()

  if (Math.random() < 0.1) {
    for (const [k, v] of rateLimitStore.entries()) {
      if (v.resetAt < now) {
        rateLimitStore.delete(k)
      }
    }
  }

  let record = rateLimitStore.get(key)

  if (!record || record.resetAt < now) {
    record = { count: 1, resetAt: now + windowMs }
    rateLimitStore.set(key, record)
  } else {
    record.count++
  }

  const remaining = Math.max(0, max - record.count)
  const resetIn = Math.ceil((record.resetAt - now) / 1000)

  setResponseHeader(event, 'X-RateLimit-Limit', max.toString())
  setResponseHeader(event, 'X-RateLimit-Remaining', remaining.toString())
  setResponseHeader(event, 'X-RateLimit-Reset', resetIn.toString())

  if (record.count > max) {
    throw createError({
      statusCode: 429,
      message: `Too many requests. Try again in ${resetIn} seconds.`
    })
  }

  return { remaining, resetIn }
}
