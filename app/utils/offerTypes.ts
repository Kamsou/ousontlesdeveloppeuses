export type OfferType = 'alternance' | 'stage' | 'cdi' | 'freelance' | 'other'

export const typeLabels: Record<string, string> = {
  alternance: 'Alternance',
  stage: 'Stage',
  cdi: 'CDI',
  freelance: 'Freelance',
  other: 'Autre'
}

export const typeColors: Record<string, string> = {
  alternance: 'border-primary/30 text-primary',
  stage: 'border-blue-400/30 text-blue-400',
  cdi: 'border-green-400/30 text-green-400',
  freelance: 'border-amber-400/30 text-amber-400',
  other: 'border-border text-foreground-muted'
}
