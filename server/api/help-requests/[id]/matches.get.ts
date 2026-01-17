import { getServerSession, getToken } from '#auth'
import { eq, inArray } from 'drizzle-orm'

const INITIAL_LIMIT = 5

const openToWeights: Record<string, number> = {
  mentoring: 3,
  pair_programming: 2,
  coffee_chat: 1
}

function normalizeLocation(loc: string | null): string | null {
  if (!loc) return null
  return loc.toLowerCase().trim()
    .replace(/\s+/g, ' ')
    .replace(/[,.-]/g, '')
}

function locationsMatch(loc1: string | null, loc2: string | null): boolean {
  const n1 = normalizeLocation(loc1)
  const n2 = normalizeLocation(loc2)
  if (!n1 || !n2) return false

  if (n1 === n2) return true
  if (n1.includes(n2) || n2.includes(n1)) return true

  const cities = ['paris', 'lyon', 'marseille', 'bordeaux', 'toulouse', 'nantes', 'lille', 'strasbourg', 'montpellier', 'rennes']
  for (const city of cities) {
    if (n1.includes(city) && n2.includes(city)) return true
  }

  return false
}

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

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'ID requis' })
  }

  const query = getQuery(event)
  const showAll = query.all === 'true'

  const db = useDrizzle()

  const developer = await db.query.developers.findFirst({
    where: eq(tables.developers.githubId, githubId)
  })

  if (!developer) {
    throw createError({ statusCode: 404, message: 'Profil non trouvé' })
  }

  const request = await db.query.helpRequests.findFirst({
    where: eq(tables.helpRequests.id, Number(id)),
    with: {
      techs: true,
      developer: {
        columns: { location: true }
      }
    }
  })

  if (!request) {
    throw createError({ statusCode: 404, message: 'Demande non trouvée' })
  }

  if (request.developerId !== developer.id) {
    throw createError({ statusCode: 403, message: 'Non autorisé' })
  }

  const techNames = request.techs.map(t => t.techName.toLowerCase())
  const requesterLocation = request.developer?.location

  const helpOpenToTypes = ['coffee_chat', 'mentoring', 'pair_programming']

  const availableDevs = await db.query.developerOpenTo.findMany({
    where: inArray(tables.developerOpenTo.type, helpOpenToTypes)
  })

  const devOpenToMap = new Map<number, string[]>()
  for (const d of availableDevs) {
    if (d.developerId === developer.id) continue
    const types = devOpenToMap.get(d.developerId) || []
    types.push(d.type)
    devOpenToMap.set(d.developerId, types)
  }

  const availableDevIds = [...devOpenToMap.keys()]

  if (availableDevIds.length === 0) {
    return { matches: [], total: 0, hasMore: false }
  }

  const allDevs = await db.query.developers.findMany({
    where: inArray(tables.developers.id, availableDevIds),
    with: {
      skills: true,
      openTo: true
    }
  })

  const scoredDevs = allDevs.map(dev => {
    let score = 0

    const matchedSkills = dev.skills
      .filter(s => techNames.includes(s.skillName.toLowerCase()))
      .map(s => s.skillName)

    score += matchedSkills.length * 10

    const openToTypes = devOpenToMap.get(dev.id) || []
    for (const type of openToTypes) {
      score += openToWeights[type] || 0
    }

    if (locationsMatch(dev.location, requesterLocation)) {
      score += 5
    }

    return {
      ...dev,
      matchScore: score,
      matchedSkills,
      sameLocation: locationsMatch(dev.location, requesterLocation)
    }
  })

  const sorted = scoredDevs
    .filter(d => d.matchedSkills.length > 0)
    .sort((a, b) => b.matchScore - a.matchScore)

  const total = sorted.length
  const matches = showAll ? sorted : sorted.slice(0, INITIAL_LIMIT)
  const hasMore = !showAll && total > INITIAL_LIMIT

  return { matches, total, hasMore }
})
