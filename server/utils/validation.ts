import { LINKEDIN_URL_PATTERN } from '#shared/utils/profile'

const URL_PATTERNS: Record<string, RegExp> = {
  linkedin: LINKEDIN_URL_PATTERN,
  twitter: /^https:\/\/(www\.)?(twitter\.com|x\.com)\/[\w-]+\/?$/,
  github: /^https:\/\/(www\.)?github\.com\/[\w-]+\/?$/,
  website: /^https?:\/\/[\w.-]+\.[a-z]{2,}(\/.*)?$/i
}

export function isValidUrl(url: string | null | undefined, type?: keyof typeof URL_PATTERNS): boolean {
  if (!url) return true

  try {
    const parsed = new URL(url)
    if (!['http:', 'https:'].includes(parsed.protocol)) return false

    if (type && URL_PATTERNS[type]) {
      return URL_PATTERNS[type].test(url)
    }

    return true
  } catch {
    return false
  }
}

export function validateProfileUrls(body: {
  linkedinUrl?: string | null
  twitterUrl?: string | null
  githubUrl?: string | null
  website?: string | null
  pastTalksUrl?: string | null
}): string | null {
  if (body.linkedinUrl && !isValidUrl(body.linkedinUrl, 'linkedin')) {
    return 'URL LinkedIn invalide (format: https://linkedin.com/in/pseudo). Attention : utilise https, pas http.'
  }
  if (body.twitterUrl && !isValidUrl(body.twitterUrl, 'twitter')) {
    return 'URL Twitter/X invalide (format: https://twitter.com/pseudo)'
  }
  if (body.website && !isValidUrl(body.website, 'website')) {
    return 'URL du site invalide'
  }
  if (body.pastTalksUrl && !isValidUrl(body.pastTalksUrl.trim())) {
    return 'URL des talks invalide (elle doit commencer par https://)'
  }
  return null
}

type OpenToType = 'conference' | 'mentoring' | 'freelance' | 'cdi' | 'coffee_chat' | 'pair_programming' | 'cv_review'

// freelance + cdi kept for backward compat (existing profiles), but removed from UI (now in lookingFor)
const VALID_OPEN_TO: OpenToType[] = ['conference', 'mentoring', 'freelance', 'cdi', 'coffee_chat', 'pair_programming', 'cv_review']

export function validateOpenTo(openTo: string[]): OpenToType[] {
  return openTo.filter((type): type is OpenToType => VALID_OPEN_TO.includes(type as OpenToType))
}

type LookingForType = 'freelance' | 'cdi' | 'stage' | 'alternance'

const VALID_LOOKING_FOR: LookingForType[] = ['freelance', 'cdi', 'stage', 'alternance']

export function validateLookingFor(lookingFor: string[]): LookingForType[] {
  return lookingFor.filter((type): type is LookingForType => VALID_LOOKING_FOR.includes(type as LookingForType))
}

const NAME_MAX_LENGTH = 80

export function validateName(name: unknown): string | null {
  if (typeof name !== 'string' || !name.trim()) return 'Le nom est requis'
  if (name.trim().length > NAME_MAX_LENGTH) return `Le nom ne doit pas dépasser ${NAME_MAX_LENGTH} caractères`
  if (/[<>\p{Cc}]/u.test(name)) return 'Le nom contient des caractères non autorisés'
  return null
}
