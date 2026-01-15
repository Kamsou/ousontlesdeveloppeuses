import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const db = useDrizzle()

  const speakerDevIds = await db.query.developerOpenTo.findMany({
    where: eq(tables.developerOpenTo.type, 'conference'),
    columns: { developerId: true }
  })

  const devIds = speakerDevIds.map(s => s.developerId)

  if (!devIds.length) {
    return []
  }

  const developers = await db.query.developers.findMany({
    with: {
      skills: true,
      openTo: true,
      speakerProfile: true
    }
  })

  let results = developers.filter(dev => devIds.includes(dev.id))

  if (query.location) {
    const locationFilter = (query.location as string).toLowerCase()
    results = results.filter(dev =>
      dev.location?.toLowerCase().includes(locationFilter)
    )
  }

  if (query.topic) {
    const topicFilter = (query.topic as string).toLowerCase()
    results = results.filter(dev => {
      if (!dev.speakerProfile?.topics) return false
      const topics = parseTopics(dev.speakerProfile.topics)
      return topics.some((t: string) => t.toLowerCase().includes(topicFilter))
    })
  }

  if (query.remote === 'true') {
    results = results.filter(dev => dev.speakerProfile?.remoteOk)
  }

  if (query.travel === 'true') {
    results = results.filter(dev => dev.speakerProfile?.travelWilling)
  }

  return results.map(dev => ({
    id: dev.id,
    name: dev.name,
    avatarUrl: dev.avatarUrl,
    bio: dev.bio,
    location: dev.location,
    skills: dev.skills.map(s => s.skillName),
    speakerProfile: dev.speakerProfile ? {
      topics: parseTopics(dev.speakerProfile.topics),
      remoteOk: dev.speakerProfile.remoteOk,
      travelWilling: dev.speakerProfile.travelWilling,
      available: dev.speakerProfile.available
    } : null
  }))
})
