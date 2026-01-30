<script setup lang="ts">
useSeoMeta({
  title: 'Annuaire des Développeuses Tech en France',
  description: 'Trouvez des développeuses en France. Filtrez par ville, technologie et disponibilité : freelance, CDI, mentoring, conférence, pair programming.',
  ogTitle: 'Annuaire des Développeuses Tech en France',
  ogDescription: 'Trouvez des développeuses en France. Filtrez par ville, techno et disponibilité (freelance, CDI, mentoring...).',
  ogImage: 'https://ousontlesdeveloppeuses.fr/og-image.png',
  twitterCard: 'summary_large_image',
})

import { openToOptions } from '~/utils/constants'

interface Developer {
  id: number
  slug: string
  name: string
  avatarUrl: string | null
  bio: string | null
  location: string | null
  yearsExperience: number | null
  linkedinUrl: string | null
  githubUrl: string | null
  skills: string[]
  openTo: string[]
  isSpeaker: boolean
}

interface ApiResponse {
  developers: Developer[]
  pagination: {
    total: number
    page: number
    limit: number
    hasMore: boolean
  }
}

const { $clientPosthog } = useNuxtApp()
const route = useRoute()
const router = useRouter()

const filters = reactive({
  location: String(route.query.location || ''),
  skill: String(route.query.skill || ''),
  openTo: route.query.openTo ? String(route.query.openTo).split(',').filter(Boolean) : []
})

const page = ref(1)
const isLoadingMore = ref(false)

const queryParams = computed(() => {
  const params: Record<string, string> = {}
  if (filters.location) params.location = filters.location
  if (filters.skill) params.skill = filters.skill
  if (filters.openTo.length) params.openTo = filters.openTo.join(',')
  params.page = page.value.toString()
  return params
})

const { data, status } = useLazyFetch<ApiResponse>('/api/developers', {
  query: queryParams
})

const developers = computed(() => data.value?.developers || [])
const pagination = computed(() => data.value?.pagination)
const isLoading = computed(() => status.value === 'pending' && page.value === 1)

async function loadMore() {
  isLoadingMore.value = true
  page.value++
  await nextTick()
  await new Promise(resolve => setTimeout(resolve, 100))
  isLoadingMore.value = false
}

watch([() => filters.location, () => filters.skill, () => filters.openTo], () => {
  page.value = 1
})

function toggleOpenTo(value: string) {
  const index = filters.openTo.indexOf(value)
  if (index > -1) {
    filters.openTo.splice(index, 1)
  } else {
    filters.openTo.push(value)
  }
  updateUrl()
  trackSearch()
}

function updateUrl() {
  const urlParams: Record<string, string> = {}
  if (filters.location) urlParams.location = filters.location
  if (filters.skill) urlParams.skill = filters.skill
  if (filters.openTo.length) urlParams.openTo = filters.openTo.join(',')
  router.push({ query: urlParams })
}

function clearFilters() {
  filters.location = ''
  filters.skill = ''
  filters.openTo = []
  page.value = 1
  router.push({ query: {} })
}

let searchTimeout: ReturnType<typeof setTimeout> | null = null

function trackSearch() {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    const hasFilters = filters.location || filters.skill || filters.openTo.length
    if (!hasFilters) return
    $clientPosthog?.capture('search_performed', {
      page: 'annuaire',
      location: filters.location || null,
      skill: filters.skill || null,
      openTo: filters.openTo.length ? filters.openTo : null,
      results_count: pagination.value?.total || 0
    })
  }, 1000)
}

watch(() => filters.location, () => { updateUrl(); trackSearch() })
watch(() => filters.skill, () => { updateUrl(); trackSearch() })
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 md:px-16">
    <header class="py-16 border-b border-border">
      <span class="text-xs uppercase tracking-[0.2em] text-foreground-muted mb-6 block">Annuaire</span>
      <h1 class="font-display text-4xl md:text-7xl font-medium tracking-tight mb-2">Développeuses</h1>
      <p class="text-foreground-muted text-base">
        <span v-if="isLoading" class="inline-block w-20 h-5 bg-border rounded animate-pulse align-middle" />
        <span v-else>{{ pagination?.total || 0 }} profils</span>
      </p>
    </header>

    <section class="py-8 border-b border-border">
      <div class="flex flex-col md:flex-row gap-6 items-stretch md:items-end mb-6">
        <div class="flex-1 max-w-none md:max-w-[250px]">
          <label class="block text-xs uppercase tracking-widest text-foreground-muted mb-2">Ville</label>
          <input
            v-model="filters.location"
            type="text"
            placeholder="Paris, Lyon..."
            class="w-full px-4 py-3 bg-background-card border border-border rounded-lg text-foreground text-sm transition-colors focus:outline-none focus:border-foreground-muted placeholder:text-foreground-muted"
          />
        </div>

        <div class="flex-1 max-w-none md:max-w-[250px]">
          <label class="block text-xs uppercase tracking-widest text-foreground-muted mb-2">Technologie</label>
          <input
            v-model="filters.skill"
            type="text"
            placeholder="Vue.js, Python..."
            class="w-full px-4 py-3 bg-background-card border border-border rounded-lg text-foreground text-sm transition-colors focus:outline-none focus:border-foreground-muted placeholder:text-foreground-muted"
          />
        </div>

        <button v-if="filters.location || filters.skill || filters.openTo.length" @click="clearFilters" class="px-6 py-3 bg-transparent border border-border rounded-lg text-foreground-muted text-sm cursor-pointer transition-all hover:border-foreground hover:text-foreground">
          Effacer
        </button>
      </div>

      <div class="flex flex-col md:flex-row items-start md:items-center gap-6">
        <span class="text-xs uppercase tracking-widest text-foreground-muted">Disponible pour</span>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="option in openToOptions"
            :key="option.value"
            :class="[
              'px-4 py-2 border rounded-full text-sm cursor-pointer transition-all',
              filters.openTo.includes(option.value)
                ? 'bg-foreground/10 border-foreground/30 text-foreground'
                : 'bg-transparent border-border/40 text-foreground-muted hover:border-border hover:text-foreground'
            ]"
            @click="toggleOpenTo(option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
    </section>

    <section class="py-12">
      <h2 class="sr-only">Liste des profils</h2>
      <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CardSkeleton v-for="i in 6" :key="i" />
      </div>

      <div v-else-if="!developers?.length" class="text-center py-16 text-foreground-muted">
        <p class="mb-4">Aucun profil trouvé</p>
        <button @click="clearFilters" class="px-6 py-3 bg-transparent border border-border rounded-lg text-foreground cursor-pointer">Effacer les filtres</button>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <NuxtLink
          v-for="dev in developers"
          :key="dev.id"
          :to="`/annuaire/${dev.slug}`"
          class="flex flex-col gap-4 p-6 bg-background-card border border-border rounded-2xl no-underline text-foreground transition-all hover:bg-background-card-hover hover:border-foreground-muted hover:-translate-y-0.5"
        >
          <div class="flex items-center gap-4">
            <img
              :src="dev.avatarUrl || '/default-avatar.png'"
              :alt="`Photo de profil de ${dev.name}, développeuse${dev.location ? ` basée à ${dev.location}` : ''}`"
              class="w-12 h-12 rounded-full object-cover"
            />
            <div class="flex-1">
              <h3 class="font-display text-lg font-medium">{{ dev.name }}</h3>
              <p v-if="dev.location" class="text-sm text-foreground-muted">{{ dev.location }}</p>
            </div>
            <span v-if="dev.isSpeaker" class="px-3 py-1 bg-background-card border border-border rounded-full text-[0.7rem] uppercase tracking-widest text-foreground-muted">Speakeuse</span>
          </div>

          <p v-if="dev.bio" class="text-sm text-foreground-muted leading-relaxed line-clamp-2">{{ dev.bio }}</p>

          <div v-if="dev.skills?.length" class="flex flex-wrap gap-2">
            <span v-for="skill in dev.skills.slice(0, 5)" :key="skill" class="px-3 py-1 bg-background-card border border-border rounded-full text-xs text-foreground-muted">
              {{ skill }}
            </span>
            <span v-if="dev.skills.length > 5" class="px-2 py-1 text-xs text-foreground-muted">
              +{{ dev.skills.length - 5 }}
            </span>
          </div>

          <div v-if="dev.openTo?.length" class="flex flex-wrap gap-2 pt-2 border-t border-border">
            <span v-for="(tag, index) in dev.openTo" :key="tag" class="text-[0.7rem] text-foreground-muted">
              {{ openToOptions.find(o => o.value === tag)?.label || tag }}{{ index < dev.openTo.length - 1 ? ' ·' : '' }}
            </span>
          </div>
        </NuxtLink>
      </div>

      <div v-if="pagination?.hasMore" class="flex justify-center mt-12">
        <button
          @click="loadMore"
          :disabled="isLoadingMore"
          class="px-8 py-3 border border-b-[3px] border-border border-b-border rounded-full text-foreground-muted text-sm cursor-pointer transition-all hover:border-foreground hover:text-foreground hover:-translate-y-0.5 active:translate-y-px active:border-b disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="isLoadingMore" class="flex items-center gap-2">
            <span class="w-4 h-4 border-2 border-foreground-muted border-t-transparent rounded-full animate-spin"></span>
            Chargement...
          </span>
          <span v-else>Voir plus</span>
        </button>
      </div>
    </section>
  </div>
</template>
