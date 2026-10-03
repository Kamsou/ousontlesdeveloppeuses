export interface HomeDeveloper {
  id: number
  slug: string | null
  name: string
  avatarUrl: string | null
  location: string | null
  skills: string[]
}

export interface HomeStats {
  developers: number
  companies: number
  locations: number
  speakers: number
}

export function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}
