<script setup lang="ts">
definePageMeta({
  middleware: 'sidebase-auth'
})

const { data: developers, status, error, refresh } = await useFetch('/api/admin/developers')

const searchQuery = ref('')
const deleting = ref<number | null>(null)

async function deleteDeveloper(id: number, name: string) {
  if (!confirm(`Supprimer ${name} de l'annuaire ?`)) return

  deleting.value = id
  try {
    await $fetch(`/api/admin/developers/${id}`, { method: 'DELETE' } as any)
    await refresh()
  } catch (e) {
    alert('Erreur lors de la suppression')
  } finally {
    deleting.value = null
  }
}

const filteredDevelopers = computed(() => {
  if (!developers.value) return []
  if (!searchQuery.value) return developers.value

  const query = searchQuery.value.toLowerCase()
  return developers.value.filter(d =>
    d.name?.toLowerCase().includes(query) ||
    d.email?.toLowerCase().includes(query) ||
    d.location?.toLowerCase().includes(query) ||
    d.skills?.some(s => s.toLowerCase().includes(query))
  )
})

const openToLabels: Record<string, string> = {
  conference: 'Conférence',
  mentoring: 'Mentoring',
  freelance: 'Freelance',
  cdi: 'CDI',
  coffee_chat: 'Coffee chat',
  pair_programming: 'Pair programming',
  cv_review: 'Relecture CV'
}

function formatDate(date: string | Date | null) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}
</script>

<template>
  <div class="max-w-[1600px] mx-auto px-4 md:px-16 py-12">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 class="font-display text-3xl md:text-4xl font-medium tracking-tight">Dashboard Admin</h1>
        <p class="text-foreground-muted mt-2">{{ filteredDevelopers.length }} développeuse{{ filteredDevelopers.length > 1 ? 's' : '' }}</p>
      </div>
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher..."
          class="w-full md:w-80 px-4 py-3 bg-transparent border border-border rounded-xl text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-foreground transition-colors"
        />
        <svg class="absolute right-4 top-1/2 -translate-y-1/2 text-foreground-muted" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.3-4.3"/>
        </svg>
      </div>
    </div>

    <div v-if="error" class="p-6 border border-red-500/50 rounded-xl bg-red-500/10 text-red-400">
      <p class="font-medium">Accès refusé</p>
      <p class="text-sm mt-1">{{ error.data?.message || 'Vous n\'avez pas accès à cette page.' }}</p>
    </div>

    <div v-else-if="status === 'pending'" class="flex justify-center py-20">
      <div class="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin"></div>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b border-border text-left">
            <th class="pb-4 pr-4 text-sm font-medium text-foreground-muted">Profil</th>
            <th class="pb-4 pr-4 text-sm font-medium text-foreground-muted">Contact</th>
            <th class="pb-4 pr-4 text-sm font-medium text-foreground-muted">Localisation</th>
            <th class="pb-4 pr-4 text-sm font-medium text-foreground-muted">Skills</th>
            <th class="pb-4 pr-4 text-sm font-medium text-foreground-muted">Dispo pour</th>
            <th class="pb-4 pr-4 text-sm font-medium text-foreground-muted">Inscription</th>
            <th class="pb-4 text-sm font-medium text-foreground-muted">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="dev in filteredDevelopers"
            :key="dev.id"
            class="border-b border-border/50 hover:bg-border/20 transition-colors"
          >
            <td class="py-4 pr-4">
              <NuxtLink :to="`/profil/${dev.id}`" class="flex items-center gap-3 no-underline">
                <img
                  v-if="dev.avatarUrl"
                  :src="dev.avatarUrl"
                  :alt="dev.name"
                  class="w-10 h-10 rounded-full object-cover"
                />
                <div v-else class="w-10 h-10 rounded-full bg-border flex items-center justify-center text-foreground-muted">
                  {{ dev.name?.charAt(0) }}
                </div>
                <div>
                  <p class="font-medium text-foreground">{{ dev.name }}</p>
                  <p class="text-xs text-foreground-muted">{{ dev.yearsExperience ? `${dev.yearsExperience} ans` : '-' }}</p>
                </div>
              </NuxtLink>
            </td>
            <td class="py-4 pr-4">
              <p class="text-sm text-foreground">{{ dev.email || '-' }}</p>
              <div class="flex gap-2 mt-1">
                <a v-if="dev.githubUrl" :href="dev.githubUrl" target="_blank" :aria-label="`Profil GitHub de ${dev.name}`" class="text-foreground-muted hover:text-foreground">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
                <a v-if="dev.linkedinUrl" :href="dev.linkedinUrl" target="_blank" :aria-label="`Profil LinkedIn de ${dev.name}`" class="text-foreground-muted hover:text-foreground">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
              </div>
            </td>
            <td class="py-4 pr-4">
              <span class="text-sm text-foreground">{{ dev.location || '-' }}</span>
            </td>
            <td class="py-4 pr-4">
              <div class="flex flex-wrap gap-1 max-w-[200px]">
                <span
                  v-for="skill in dev.skills?.slice(0, 3)"
                  :key="skill"
                  class="px-2 py-0.5 text-xs border border-border rounded-full text-foreground-muted"
                >
                  {{ skill }}
                </span>
                <span v-if="dev.skills?.length > 3" class="px-2 py-0.5 text-xs text-foreground-muted">
                  +{{ dev.skills.length - 3 }}
                </span>
              </div>
            </td>
            <td class="py-4 pr-4">
              <div class="flex flex-wrap gap-1 max-w-[180px]">
                <span
                  v-for="type in dev.openTo?.slice(0, 2)"
                  :key="type"
                  class="px-2 py-0.5 text-xs border border-primary/30 rounded-full text-primary"
                >
                  {{ openToLabels[type] || type }}
                </span>
                <span v-if="dev.openTo?.length > 2" class="px-2 py-0.5 text-xs text-foreground-muted">
                  +{{ dev.openTo.length - 2 }}
                </span>
              </div>
            </td>
            <td class="py-4 pr-4">
              <span class="text-sm text-foreground-muted">{{ formatDate(dev.createdAt) }}</span>
            </td>
            <td class="py-4">
              <button
                @click="deleteDeveloper(dev.id, dev.name)"
                :disabled="deleting === dev.id"
                class="px-3 py-1.5 text-xs border border-red-500/30 text-red-400 rounded-lg bg-transparent cursor-pointer transition-all hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ deleting === dev.id ? '...' : 'Supprimer' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="filteredDevelopers.length === 0" class="text-center py-12 text-foreground-muted">
        Aucune développeuse trouvée
      </div>
    </div>
  </div>
</template>
