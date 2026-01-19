export type SideProjectStatus = 'idea' | 'open_to_contributors' | 'looking_for_cofounder' | 'completed'

export const statusLabels: Record<SideProjectStatus, string> = {
  idea: 'Idée',
  open_to_contributors: 'Ouvert aux contribs',
  looking_for_cofounder: 'Cherche associée',
  completed: 'Terminé'
}

export const statusColors: Record<SideProjectStatus, string> = {
  idea: 'bg-amber-500/10 text-amber-400',
  open_to_contributors: 'bg-green-500/10 text-green-400',
  looking_for_cofounder: 'bg-purple-500/10 text-purple-400',
  completed: 'bg-foreground-muted/10 text-foreground-muted'
}

export const statusOptions = [
  { value: 'idea' as const, label: 'Idée', description: 'Concept, pas encore de code' },
  { value: 'open_to_contributors' as const, label: 'Ouvert aux contributions', description: 'Aide bienvenue sur le projet' },
  { value: 'looking_for_cofounder' as const, label: 'Cherche associée', description: 'Pour porter le projet ensemble' }
]
