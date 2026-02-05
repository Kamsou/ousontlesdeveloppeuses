<script setup lang="ts">
definePageMeta({
  middleware: 'sidebase-auth'
})

useSeoMeta({
  title: 'Stats - Admin',
  robots: 'noindex'
})

const { data: session } = useAuth()
const { preference: themePreference, cycle: cycleTheme } = useQgTheme()
const themeLabel = computed(() => {
  if (themePreference.value === 'system') return 'Thème système'
  if (themePreference.value === 'light') return 'Thème clair'
  return 'Thème sombre'
})

interface Stats {
  signupsByMonth: { month: string, count: number }[]
  topSkills: { name: string, count: number }[]
  topLocations: { location: string, count: number }[]
  helpRequestsByStatus: { status: string, count: number }[]
  contactsByStatus: { status: string, count: number }[]
  speakersCount: number
}

const { data: stats, status } = await useFetch<Stats>('/api/admin/stats')
const { data: deletionStats } = useLazyFetch<{ id: number, month: string, deletedBy: string, count: number }[]>('/api/admin/deletion-stats')

const deletionByMonth = computed(() => {
  if (!deletionStats.value?.length) return []
  const months = new Map<string, { self: number, admin: number }>()
  for (const stat of deletionStats.value) {
    if (!months.has(stat.month)) {
      months.set(stat.month, { self: 0, admin: 0 })
    }
    const entry = months.get(stat.month)!
    if (stat.deletedBy === 'self') entry.self += stat.count
    else entry.admin += stat.count
  }
  return Array.from(months.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([month, counts]) => ({ month, ...counts, total: counts.self + counts.admin }))
})

const totalDeletions = computed(() =>
  deletionByMonth.value.reduce((sum, m) => sum + m.total, 0)
)

const totalSignups = computed(() =>
  stats.value?.signupsByMonth.reduce((sum, m) => sum + m.count, 0) || 0
)

const totalHelpRequests = computed(() =>
  stats.value?.helpRequestsByStatus.reduce((sum, s) => sum + s.count, 0) || 0
)

const totalContacts = computed(() =>
  stats.value?.contactsByStatus.reduce((sum, s) => sum + s.count, 0) || 0
)

function formatMonth(month: string) {
  const [year, m] = month.split('-')
  const date = new Date(Number(year), Number(m) - 1)
  return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
}

const helpStatusLabels: Record<string, string> = {
  open: 'Ouvertes',
  in_progress: 'En cours',
  closed: 'Fermées'
}

const contactStatusLabels: Record<string, string> = {
  sent: 'Envoyées',
  read: 'Lues',
  replied: 'Répondues'
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <header class="sticky top-0 z-50 px-4 md:px-8 py-3 backdrop-blur-xl bg-background/80 border-b border-border/20">
      <div class="max-w-[1200px] mx-auto flex items-center justify-between">
        <NuxtLink to="/qg" class="flex items-center gap-2 no-underline text-foreground-muted hover:text-foreground transition-colors text-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Mon QG
        </NuxtLink>
        <h1 class="font-display text-sm font-semibold tracking-widest text-primary m-0">ADMIN</h1>
        <div class="flex items-center gap-3">
          <button @click="cycleTheme" class="flex items-center justify-center w-8 h-8 rounded-full border border-border/10 text-foreground-muted hover:text-foreground hover:border-foreground-muted transition-colors" :title="themeLabel">
            <svg v-if="themePreference === 'system'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            <svg v-else-if="themePreference === 'light'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </button>
          <img v-if="session?.user?.image" :src="optimizedAvatar(session.user.image, 64)" :alt="session.user.name || ''" class="w-8 h-8 rounded-full border border-border/10" />
          <span v-else class="w-8 h-8 rounded-full bg-border/50"></span>
        </div>
      </div>
    </header>

    <div class="max-w-[1200px] mx-auto px-4 md:px-16 py-8">
      <div class="flex flex-wrap gap-3 mb-8">
        <NuxtLink
          to="/admin"
          class="px-4 py-2 border border-border/10 rounded-lg text-sm font-medium hover:border-foreground-muted transition-colors no-underline"
        >
          Développeuses
        </NuxtLink>
        <NuxtLink
          to="/admin/programs"
          class="px-4 py-2 border border-border/10 rounded-lg text-sm font-medium hover:border-foreground-muted transition-colors no-underline"
        >
          Programmes
        </NuxtLink>
        <NuxtLink
          to="/admin/podcasts"
          class="px-4 py-2 border border-border/10 rounded-lg text-sm font-medium hover:border-foreground-muted transition-colors no-underline"
        >
          Podcasts
        </NuxtLink>
        <NuxtLink
          to="/admin/stats"
          class="px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium no-underline"
        >
          Stats
        </NuxtLink>
        <NuxtLink
          to="/admin/newsletter"
          class="px-4 py-2 border border-border/10 rounded-lg text-sm font-medium hover:border-foreground-muted transition-colors no-underline"
        >
          Newsletter
        </NuxtLink>
      </div>

      <div class="mb-8">
        <h1 class="font-display text-3xl md:text-4xl font-medium tracking-tight">Stats</h1>
      </div>

    <div v-if="status === 'pending'" class="flex justify-center py-20">
      <div class="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin"></div>
    </div>

    <div v-else-if="stats" class="space-y-8">
      <!-- Chiffres clés -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="p-4 border border-border/10 rounded-xl">
          <div class="flex items-center gap-2 mb-2">
            <svg class="text-primary" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <p class="text-2xl font-display font-medium">{{ totalSignups }}</p>
          </div>
          <p class="text-sm text-foreground-muted">Inscrites</p>
        </div>
        <div class="p-4 border border-border/10 rounded-xl">
          <div class="flex items-center gap-2 mb-2">
            <svg class="text-primary" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
            <p class="text-2xl font-display font-medium">{{ stats.speakersCount }}</p>
          </div>
          <p class="text-sm text-foreground-muted">Speakeuses</p>
        </div>
        <div class="p-4 border border-border/10 rounded-xl">
          <div class="flex items-center gap-2 mb-2">
            <svg class="text-primary" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
            <p class="text-2xl font-display font-medium">{{ totalHelpRequests }}</p>
          </div>
          <p class="text-sm text-foreground-muted">Demandes d'aide</p>
        </div>
        <div class="p-4 border border-border/10 rounded-xl">
          <div class="flex items-center gap-2 mb-2">
            <svg class="text-primary" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
            <p class="text-2xl font-display font-medium">{{ totalContacts }}</p>
          </div>
          <p class="text-sm text-foreground-muted">Mises en relation</p>
        </div>
      </div>

      <!-- Inscriptions par mois -->
      <div class="p-6 border border-border/10 rounded-2xl">
        <h2 class="font-display text-lg font-medium mb-4 flex items-center gap-2">
          <svg class="text-foreground-muted" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/></svg>
          Inscriptions par mois
        </h2>
        <div v-if="stats.signupsByMonth.length === 0" class="text-sm text-foreground-muted">Aucune donnée</div>
        <div v-else class="space-y-2">
          <div v-for="row in stats.signupsByMonth" :key="row.month" class="flex items-center gap-4">
            <span class="text-sm text-foreground-muted w-32 shrink-0">{{ formatMonth(row.month) }}</span>
            <div class="flex-1 h-6 bg-border/10 rounded-full overflow-hidden">
              <div
                class="h-full bg-primary/60 rounded-full"
                :style="{ width: `${(row.count / Math.max(...stats.signupsByMonth.map(s => s.count))) * 100}%` }"
              ></div>
            </div>
            <span class="text-sm font-medium w-8 text-right">{{ row.count }}</span>
          </div>
        </div>
      </div>

      <div class="grid md:grid-cols-2 gap-8">
        <!-- Top skills -->
        <div class="p-6 border border-border/10 rounded-2xl">
          <h2 class="font-display text-lg font-medium mb-4 flex items-center gap-2">
            <svg class="text-foreground-muted" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
            Top skills
          </h2>
          <div class="space-y-2">
            <div v-for="skill in stats.topSkills" :key="skill.name" class="flex items-center justify-between">
              <span class="text-sm text-foreground">{{ skill.name }}</span>
              <span class="text-sm text-foreground-muted">{{ skill.count }}</span>
            </div>
          </div>
        </div>

        <!-- Répartition géographique -->
        <div class="p-6 border border-border/10 rounded-2xl">
          <h2 class="font-display text-lg font-medium mb-4 flex items-center gap-2">
            <svg class="text-foreground-muted" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            Villes
          </h2>
          <div class="space-y-2">
            <div v-for="loc in stats.topLocations" :key="loc.location" class="flex items-center justify-between">
              <span class="text-sm text-foreground">{{ loc.location }}</span>
              <span class="text-sm text-foreground-muted">{{ loc.count }}</span>
            </div>
          </div>
        </div>

        <!-- Demandes d'aide -->
        <div class="p-6 border border-border/10 rounded-2xl">
          <h2 class="font-display text-lg font-medium mb-4 flex items-center gap-2">
            <svg class="text-foreground-muted" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
            Demandes d'aide
          </h2>
          <div v-if="stats.helpRequestsByStatus.length === 0" class="text-sm text-foreground-muted">Aucune demande</div>
          <div v-else class="space-y-2">
            <div v-for="s in stats.helpRequestsByStatus" :key="s.status" class="flex items-center justify-between">
              <span class="text-sm text-foreground">{{ helpStatusLabels[s.status] || s.status }}</span>
              <span class="text-sm text-foreground-muted">{{ s.count }}</span>
            </div>
          </div>
        </div>

        <!-- Mises en relation -->
        <div class="p-6 border border-border/10 rounded-2xl">
          <h2 class="font-display text-lg font-medium mb-4 flex items-center gap-2">
            <svg class="text-foreground-muted" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
            Mises en relation
          </h2>
          <div v-if="stats.contactsByStatus.length === 0" class="text-sm text-foreground-muted">Aucune mise en relation</div>
          <div v-else class="space-y-2">
            <div v-for="s in stats.contactsByStatus" :key="s.status" class="flex items-center justify-between">
              <span class="text-sm text-foreground">{{ contactStatusLabels[s.status] || s.status }}</span>
              <span class="text-sm text-foreground-muted">{{ s.count }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Suppressions de compte -->
      <div class="p-6 border border-border/10 rounded-2xl">
        <h2 class="font-display text-lg font-medium mb-1 flex items-center gap-2">
          <svg class="text-foreground-muted" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="17" x2="22" y1="11" y2="11"/></svg>
          Suppressions de compte
        </h2>
        <p class="text-sm text-foreground-muted mb-6">{{ totalDeletions }} suppression{{ totalDeletions > 1 ? 's' : '' }} au total</p>

        <div v-if="deletionByMonth.length === 0" class="text-center py-8 text-foreground-muted">
          Aucune suppression enregistrée
        </div>

        <table v-else class="w-full">
          <thead>
            <tr class="border-b border-border/10 text-left">
              <th class="pb-3 text-sm font-medium text-foreground-muted">Mois</th>
              <th class="pb-3 text-sm font-medium text-foreground-muted text-right">Self</th>
              <th class="pb-3 text-sm font-medium text-foreground-muted text-right">Admin</th>
              <th class="pb-3 text-sm font-medium text-foreground-muted text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in deletionByMonth" :key="row.month" class="border-b border-border/50">
              <td class="py-3 text-sm text-foreground">{{ formatMonth(row.month) }}</td>
              <td class="py-3 text-sm text-foreground-muted text-right">{{ row.self }}</td>
              <td class="py-3 text-sm text-foreground-muted text-right">{{ row.admin }}</td>
              <td class="py-3 text-sm text-foreground font-medium text-right">{{ row.total }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    </div>
  </div>
</template>
