import { slugifyCity } from '#shared/utils/landings'

const RELATED_LIMIT = 6

function cityOf(location: string | null) {
  return location?.split(',')[0]?.trim() || null
}

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({ statusCode: 400, message: 'Paramètre requis' })
  }

  const developers = await loadDevelopers()
  const current = developers.find(d => d.slug === slug)

  if (!current) {
    throw createError({ statusCode: 404, message: 'Profil non trouvé' })
  }

  const city = cityOf(current.location)
  const skills = new Set(current.skills.map(skill => skill.toLowerCase()))

  const related = developers
    .filter(d => d.slug !== current.slug)
    .map((d) => {
      const sameCity = !!city && cityOf(d.location)?.toLowerCase() === city.toLowerCase()
      const sharedSkills = d.skills.filter(skill => skills.has(skill.toLowerCase())).length
      return { developer: d, sameCity, score: (sameCity ? 3 : 0) + sharedSkills }
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score || a.developer.name.localeCompare(b.developer.name))
    .slice(0, RELATED_LIMIT)

  const landings = await getLandingIndex()
  const cityLanding = city ? landings.cities.find(landing => landing.slug === slugifyCity(city))?.slug ?? null : null

  return {
    city,
    cityLanding,
    developers: related.map(({ developer, sameCity }) => ({
      slug: developer.slug,
      name: developer.name,
      title: developer.title,
      location: developer.location,
      avatarUrl: developer.avatarUrl,
      sameCity
    }))
  }
})
