import { useRateLimit } from '../../utils/rateLimit'

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr]
  let s = seed
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    const j = ((s >>> 0) % (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function getDailySeed(): number {
  const today = new Date().toISOString().slice(0, 10)
  let seed = 0
  for (let i = 0; i < today.length; i++) {
    seed = ((seed << 5) - seed + today.charCodeAt(i)) | 0
  }
  return seed
}

export default defineEventHandler(async (event) => {
  useRateLimit(event, { windowMs: 60 * 1000, max: 60 })

  const db = useDrizzle()
  const query = getQuery(event)

  const page = parseInt(String(query.page)) || 1
  const limit = parseInt(String(query.limit)) || 24

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const developers = await db.query.developers.findMany({
    with: {
      skills: true,
      openTo: true,
      lookingFor: true,
      speakerProfile: true
    }
  })

  // Shuffle seedé sur le jour — même ordre pour tous les visiteurs pendant 24h
  let filtered = seededShuffle(developers.filter(d => d.slug), getDailySeed())

  if (query.location) {
    const location = String(query.location).toLowerCase()
    filtered = filtered.filter(d =>
      d.location?.toLowerCase().includes(location)
    )
  }

  if (query.skill) {
    const skill = String(query.skill).toLowerCase()
    filtered = filtered.filter(d =>
      d.skills.some(s => s.skillName.toLowerCase().includes(skill))
    )
  }

  if (query.openTo) {
    const openToTypes = String(query.openTo).split(',')
    filtered = filtered.filter(d =>
      d.openTo.some(o => openToTypes.includes(o.type))
    )
  }

  if (query.lookingFor) {
    const lookingForTypes = String(query.lookingFor).split(',')
    filtered = filtered.filter(d =>
      d.lookingForSince && d.lookingForSince > thirtyDaysAgo &&
      d.lookingFor.some(l => lookingForTypes.includes(l.type))
    )
  }

  if (query.experience) {
    const selected = String(query.experience).split(',').map(Number)
    filtered = filtered.filter(d =>
      d.yearsExperience !== null && selected.includes(d.yearsExperience)
    )
  }

  if (query.speakers === 'true') {
    filtered = filtered.filter(d =>
      d.speakerProfile?.available === true || d.openTo.some(o => o.type === 'conference')
    )
  }

  const total = filtered.length
  const offset = (page - 1) * limit
  const paginated = filtered.slice(offset, offset + limit)

  return {
    developers: paginated.map(d => ({
      id: d.id,
      slug: d.slug,
      name: d.name,
      avatarUrl: d.avatarUrl,
      bio: d.bio,
      title: d.title,
      location: d.location,
      yearsExperience: d.yearsExperience,
      linkedinUrl: d.linkedinUrl,
      githubUrl: d.githubUrl,
      skills: d.skills.map(s => s.skillName),
      openTo: d.openTo.map(o => o.type),
      lookingFor: d.lookingForSince && d.lookingForSince > thirtyDaysAgo
        ? d.lookingFor.map(l => l.type)
        : [],
      isSpeaker: d.speakerProfile?.available || d.openTo.some(o => o.type === 'conference')
    })),
    pagination: {
      total,
      page,
      limit,
      hasMore: offset + limit < total
    }
  }
})
