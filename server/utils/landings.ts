import { MIN_CITY_PROFILES, MIN_TECH_PROFILES, cityFromLocation, slugifyCity, techLandings, type LandingType } from '#shared/utils/landings'

export interface LandingDeveloper {
  slug: string
  name: string
  title: string | null
  location: string | null
  avatarUrl: string | null
  skills: string[]
  openTo: string[]
  isSpeaker: boolean
}

export interface LandingSummary {
  slug: string
  label: string
  count: number
}

export const loadDevelopers = defineCachedFunction(async (): Promise<LandingDeveloper[]> => {
  const db = useDrizzle()
  const developers = await db.query.developers.findMany({
    columns: { slug: true, name: true, title: true, location: true, avatarUrl: true },
    with: {
      skills: { columns: { skillName: true } },
      openTo: { columns: { type: true } },
      speakerProfile: { columns: { available: true } }
    }
  })

  return developers
    .filter((dev): dev is typeof dev & { slug: string } => !!dev.slug)
    .map(dev => ({
      slug: dev.slug,
      name: dev.name,
      title: dev.title,
      location: dev.location,
      avatarUrl: dev.avatarUrl,
      skills: dev.skills.map(s => s.skillName),
      openTo: dev.openTo.map(o => o.type),
      isSpeaker: !!dev.speakerProfile?.available || dev.openTo.some(o => o.type === 'conference')
    }))
}, { name: 'landing-developers', maxAge: 60 * 10 })

function techOf(skill: string) {
  const normalized = skill.trim().toLowerCase()
  return techLandings.find(tech => (tech.aliases as readonly string[]).includes(normalized))
}

function groupByCity(developers: LandingDeveloper[]) {
  const groups = new Map<string, { labels: Map<string, number>, developers: LandingDeveloper[] }>()
  for (const dev of developers) {
    const city = cityFromLocation(dev.location)
    if (!city) continue
    const slug = slugifyCity(city)
    if (!slug) continue
    const group = groups.get(slug) ?? { labels: new Map(), developers: [] }
    group.labels.set(city, (group.labels.get(city) ?? 0) + 1)
    group.developers.push(dev)
    groups.set(slug, group)
  }
  return groups
}

function bestLabel(labels: Map<string, number>) {
  return [...labels.entries()]
    .sort((a, b) => b[1] - a[1] || Number(b[0] !== b[0].toUpperCase()) - Number(a[0] !== a[0].toUpperCase()))[0]?.[0] ?? ''
}

function developersForTech(developers: LandingDeveloper[], slug: string) {
  return developers.filter(dev => dev.skills.some(skill => techOf(skill)?.slug === slug))
}

export async function getLandingIndex() {
  const developers = await loadDevelopers()

  const cities: LandingSummary[] = [...groupByCity(developers).entries()]
    .filter(([, group]) => group.developers.length >= MIN_CITY_PROFILES)
    .map(([slug, group]) => ({ slug, label: bestLabel(group.labels), count: group.developers.length }))
    .sort((a, b) => b.count - a.count)

  const techs: LandingSummary[] = techLandings
    .map(tech => ({ slug: tech.slug, label: tech.label, count: developersForTech(developers, tech.slug).length }))
    .filter(tech => tech.count >= MIN_TECH_PROFILES)
    .sort((a, b) => b.count - a.count)

  return { cities, techs }
}

function topCounts(values: string[], limit: number) {
  const counts = new Map<string, number>()
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1)
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([value, count]) => ({ value, count }))
}

export async function getLanding(type: LandingType, slug: string) {
  const developers = await loadDevelopers()
  const index = await getLandingIndex()

  let label: string
  let matches: LandingDeveloper[]

  if (type === 'ville') {
    const summary = index.cities.find(city => city.slug === slug)
    if (!summary) return null
    label = summary.label
    matches = groupByCity(developers).get(slug)?.developers ?? []
  } else {
    const summary = index.techs.find(tech => tech.slug === slug)
    if (!summary) return null
    label = summary.label
    matches = developersForTech(developers, slug)
  }

  const sorted = [...matches].sort((a, b) =>
    Number(!!b.avatarUrl) - Number(!!a.avatarUrl) || b.skills.length - a.skills.length || a.name.localeCompare(b.name)
  )

  const topTechs = topCounts(
    sorted.flatMap(dev => [...new Set(dev.skills.map(skill => techOf(skill)?.slug).filter((s): s is string => !!s))]),
    6
  )
    .filter(({ value }) => !(type === 'techno' && value === slug))
    .map(({ value, count }) => ({ ...index.techs.find(tech => tech.slug === value), count }))
    .filter((tech): tech is LandingSummary => !!tech.slug && !!tech.label)

  const topCities = topCounts(
    sorted.map(dev => cityFromLocation(dev.location)).filter((c): c is string => !!c).map(slugifyCity),
    6
  )
    .filter(({ value }) => !(type === 'ville' && value === slug))
    .map(({ value, count }) => ({ ...index.cities.find(city => city.slug === value), count }))
    .filter((city): city is LandingSummary => !!city.slug && !!city.label)

  return {
    type,
    slug,
    label,
    count: sorted.length,
    speakers: sorted.filter(dev => dev.isSpeaker).length,
    mentoring: sorted.filter(dev => dev.openTo.includes('mentoring')).length,
    developers: sorted,
    relatedTechs: topTechs,
    relatedCities: topCities,
    otherCities: index.cities.filter(city => city.slug !== slug).slice(0, 8),
    otherTechs: index.techs.filter(tech => tech.slug !== slug).slice(0, 10)
  }
}
