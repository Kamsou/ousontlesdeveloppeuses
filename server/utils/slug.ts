import { eq, like } from 'drizzle-orm'

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    || 'dev'
}

export async function generateUniqueSlug(name: string, excludeId?: number): Promise<string> {
  const baseSlug = generateSlug(name)
  const db = useDrizzle()

  const existing = await db.query.developers.findFirst({
    where: eq(tables.developers.slug, baseSlug)
  })

  if (!existing || existing.id === excludeId) {
    return baseSlug
  }

  const similar = await db.query.developers.findMany({
    where: like(tables.developers.slug, `${baseSlug}-%`),
    columns: { slug: true }
  })

  const usedSuffixes = similar
    .map(d => d.slug?.match(new RegExp(`^${baseSlug}-(\\d+)$`)))
    .filter(Boolean)
    .map(m => parseInt(m![1]))

  const nextSuffix = usedSuffixes.length ? Math.max(...usedSuffixes) + 1 : 2

  return `${baseSlug}-${nextSuffix}`
}
