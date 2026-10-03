export const MIN_CITY_PROFILES = 4
export const MIN_TECH_PROFILES = 5

export const techLandings = [
  { slug: 'react', label: 'React', aliases: ['react', 'reactjs', 'react.js'] },
  { slug: 'typescript', label: 'TypeScript', aliases: ['typescript', 'ts'] },
  { slug: 'javascript', label: 'JavaScript', aliases: ['javascript', 'js'] },
  { slug: 'nodejs', label: 'Node.js', aliases: ['node.js', 'nodejs', 'node'] },
  { slug: 'python', label: 'Python', aliases: ['python'] },
  { slug: 'php', label: 'PHP', aliases: ['php'] },
  { slug: 'java', label: 'Java', aliases: ['java'] },
  { slug: 'vuejs', label: 'Vue.js', aliases: ['vue.js', 'vuejs', 'vue'] },
  { slug: 'angular', label: 'Angular', aliases: ['angular'] },
  { slug: 'nextjs', label: 'Next.js', aliases: ['next.js', 'nextjs'] },
  { slug: 'nuxt', label: 'Nuxt', aliases: ['nuxt', 'nuxtjs', 'nuxt.js'] },
  { slug: 'react-native', label: 'React Native', aliases: ['react native', 'react-native'] },
  { slug: 'symfony', label: 'Symfony', aliases: ['symfony'] },
  { slug: 'laravel', label: 'Laravel', aliases: ['laravel'] },
  { slug: 'csharp', label: 'C#', aliases: ['c#', 'csharp'] },
  { slug: 'dotnet', label: '.NET', aliases: ['.net', 'dotnet'] },
  { slug: 'docker', label: 'Docker', aliases: ['docker'] },
  { slug: 'flutter', label: 'Flutter', aliases: ['flutter'] },
  { slug: 'django', label: 'Django', aliases: ['django'] },
  { slug: 'ruby', label: 'Ruby', aliases: ['ruby', 'ruby on rails', 'rails'] },
  { slug: 'swift', label: 'Swift', aliases: ['swift'] },
  { slug: 'kotlin', label: 'Kotlin', aliases: ['kotlin'] },
  { slug: 'svelte', label: 'Svelte', aliases: ['svelte', 'sveltekit'] },
  { slug: 'graphql', label: 'GraphQL', aliases: ['graphql'] },
  { slug: 'aws', label: 'AWS', aliases: ['aws'] },
  { slug: 'go', label: 'Go', aliases: ['go', 'golang'] },
  { slug: 'rust', label: 'Rust', aliases: ['rust'] }
] as const

export type LandingType = 'ville' | 'techno'

export function slugifyCity(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function cityFromLocation(location: string | null | undefined) {
  const city = location?.split(',')[0]?.trim()
  return city || null
}
