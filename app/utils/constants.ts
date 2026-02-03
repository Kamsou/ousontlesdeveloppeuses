export const skillGroups = [
  { label: 'Frontend', skills: ['JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular', 'Next.js', 'Nuxt', 'Svelte', 'HTML', 'CSS', 'Tailwind CSS', 'Sass'] },
  { label: 'Backend', skills: ['Node.js', 'Python', 'Java', 'PHP', 'Ruby', 'Go', 'Rust', 'C#', '.NET'] },
  { label: 'Mobile', skills: ['React Native', 'Flutter', 'Swift', 'Kotlin'] },
  { label: 'Data / DevOps', skills: ['SQL', 'PostgreSQL', 'MongoDB', 'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'CI/CD'] },
  { label: 'Autres', skills: ['Git', 'GraphQL', 'REST API', 'Linux'] },
]

export const suggestedSkills = skillGroups.flatMap(g => g.skills)

export const openToOptions = [
  { value: 'conference', label: 'Conférence' },
  { value: 'mentoring', label: 'Mentoring' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'cdi', label: 'CDI' },
  { value: 'coffee_chat', label: 'Coffee chat' },
  { value: 'pair_programming', label: 'Pair programming' },
  { value: 'cv_review', label: 'Relecture CV' }
] as const

export type OpenToValue = typeof openToOptions[number]['value']

export const openToLabels: Record<string, string> = Object.fromEntries(
  openToOptions.map(o => [o.value, o.label])
)
