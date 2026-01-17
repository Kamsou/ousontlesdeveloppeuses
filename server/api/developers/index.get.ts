export default defineEventHandler(async (event) => {
  const db = useDrizzle()
  const query = getQuery(event)

  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 24

  const developers = await db.query.developers.findMany({
    with: {
      skills: true,
      openTo: true,
      speakerProfile: true
    }
  })

  let filtered = developers

  if (query.location) {
    filtered = filtered.filter(d =>
      d.location?.toLowerCase().includes((query.location as string).toLowerCase())
    )
  }

  if (query.skill) {
    filtered = filtered.filter(d =>
      d.skills.some(s => s.skillName.toLowerCase().includes((query.skill as string).toLowerCase()))
    )
  }

  if (query.openTo) {
    const openToTypes = (query.openTo as string).split(',')
    filtered = filtered.filter(d =>
      d.openTo.some(o => openToTypes.includes(o.type))
    )
  }

  if (query.speakers === 'true') {
    filtered = filtered.filter(d =>
      d.speakerProfile?.available === true || d.openTo.some(o => o.type === 'conference')
    )
  }

  const total = filtered.length
  const paginated = filtered.slice(0, page * limit)

  return {
    developers: paginated.map(d => ({
      id: d.id,
      name: d.name,
      avatarUrl: d.avatarUrl,
      bio: d.bio,
      location: d.location,
      yearsExperience: d.yearsExperience,
      linkedinUrl: d.linkedinUrl,
      githubUrl: d.githubUrl,
      skills: d.skills.map(s => s.skillName),
      openTo: d.openTo.map(o => o.type),
      isSpeaker: d.speakerProfile?.available || d.openTo.some(o => o.type === 'conference')
    })),
    pagination: {
      total,
      page,
      limit,
      hasMore: paginated.length < total
    }
  }
})
