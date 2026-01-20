const URL_PATTERNS: Record<string, RegExp> = {
  linkedin: /^https:\/\/(www\.)?linkedin\.com\/in\/[\w%\u00C0-\u017F-]+\/?$/,
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
  return null
}

type OpenToType = 'conference' | 'mentoring' | 'freelance' | 'cdi' | 'coffee_chat' | 'pair_programming' | 'cv_review'

const VALID_OPEN_TO: OpenToType[] = ['conference', 'mentoring', 'freelance', 'cdi', 'coffee_chat', 'pair_programming', 'cv_review']

export function validateOpenTo(openTo: string[]): OpenToType[] {
  return openTo.filter((type): type is OpenToType => VALID_OPEN_TO.includes(type as OpenToType))
}
