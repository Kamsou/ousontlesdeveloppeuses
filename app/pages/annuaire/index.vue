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
  title: string | null
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

const allDevelopers = ref<Developer[]>([])
const page = ref(1)
const isLoadingMore = ref(false)
const hasMore = ref(false)
const totalCount = ref(0)
const loadMoreRef = ref<HTMLElement | null>(null)

const initialQuery = computed(() => {
  const params: Record<string, string> = {}
  if (filters.location) params.location = filters.location
  if (filters.skill) params.skill = filters.skill
  if (filters.openTo.length) params.openTo = filters.openTo.join(',')
  params.page = '1'
  return params
})

const { data, status } = await useFetch<ApiResponse>('/api/developers', {
  query: initialQuery
})

const isLoading = computed(() => status.value === 'pending' && !allDevelopers.value.length)

watch(data, (d) => {
  if (d) {
    allDevelopers.value = d.developers
    totalCount.value = d.pagination.total
    hasMore.value = d.pagination.hasMore
    page.value = 1
  }
}, { immediate: true })

watch([() => filters.location, () => filters.skill, () => filters.openTo], () => {
  hasMore.value = false
  page.value = 1
})

async function loadMore() {
  if (isLoadingMore.value || !hasMore.value) return
  isLoadingMore.value = true
  page.value++
  try {
    const params: Record<string, string> = {}
    if (filters.location) params.location = filters.location
    if (filters.skill) params.skill = filters.skill
    if (filters.openTo.length) params.openTo = filters.openTo.join(',')
    params.page = page.value.toString()
    const result = await $fetch<ApiResponse>('/api/developers', { query: params })
    allDevelopers.value = [...allDevelopers.value, ...result.developers]
    hasMore.value = result.pagination.hasMore
  } catch {
    page.value--
  } finally {
    isLoadingMore.value = false
  }
}

useIntersectionObserver(loadMoreRef, (entries) => {
  if (entries[0]?.isIntersecting) loadMore()
}, { rootMargin: '200px' })

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
      results_count: totalCount.value
    })
  }, 1000)
}

watch(() => filters.location, () => { updateUrl(); trackSearch() })
watch(() => filters.skill, () => { updateUrl(); trackSearch() })
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 md:px-16">
    <header class="py-16 border-b border-border/10">
      <span class="text-xs uppercase tracking-[0.2em] text-foreground-muted mb-6 block">Annuaire</span>
      <h1 class="font-display text-4xl md:text-7xl font-medium tracking-tight mb-2">Développeuses</h1>
      <p class="text-foreground-muted text-base">
        <span v-if="isLoading" class="inline-block w-20 h-5 bg-border rounded animate-pulse align-middle" />
        <span v-else>{{ totalCount }} profils</span>
      </p>
    </header>

    <section class="py-8 border-b border-border/10">
      <div class="flex flex-col md:flex-row gap-6 items-stretch md:items-end mb-6">
        <div class="flex-1 max-w-none md:max-w-[250px]">
          <label class="block text-xs uppercase tracking-widest text-foreground-muted mb-2">Ville</label>
          <input
            v-model="filters.location"
            type="text"
            placeholder="Paris, Lyon..."
            class="w-full px-4 py-3 bg-background-card border border-border/10 rounded-lg text-foreground text-sm transition-colors focus:outline-none focus:border-foreground-muted placeholder:text-foreground-muted"
          />
        </div>

        <div class="flex-1 max-w-none md:max-w-[250px]">
          <label class="block text-xs uppercase tracking-widest text-foreground-muted mb-2">Technologie</label>
          <input
            v-model="filters.skill"
            type="text"
            placeholder="Vue.js, Python..."
            class="w-full px-4 py-3 bg-background-card border border-border/10 rounded-lg text-foreground text-sm transition-colors focus:outline-none focus:border-foreground-muted placeholder:text-foreground-muted"
          />
        </div>

        <button v-if="filters.location || filters.skill || filters.openTo.length" @click="clearFilters" class="px-6 py-3 bg-transparent border border-border/10 rounded-lg text-foreground-muted text-sm cursor-pointer transition-all hover:border-foreground hover:text-foreground">
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
                : 'bg-transparent border-border/40 text-foreground-muted hover:border-border/10 hover:text-foreground'
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

      <div v-else-if="!allDevelopers.length" class="text-center py-16 text-foreground-muted">
        <p class="mb-4">Aucun profil trouvé</p>
        <button @click="clearFilters" class="px-6 py-3 bg-transparent border border-border/10 rounded-lg text-foreground cursor-pointer">Effacer les filtres</button>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <NuxtLink
          v-for="dev in allDevelopers"
          :key="dev.id"
          :to="`/annuaire/${dev.slug}`"
          :class="[
            'flex flex-col p-6 bg-background-card border border-border/10 rounded-2xl no-underline text-foreground transition-all hover:bg-background-card-hover hover:border-foreground-muted hover:-translate-y-0.5',
            !dev.bio && !dev.openTo?.length ? 'items-center text-center justify-center' : 'gap-4'
          ]"
        >
          <template v-if="!dev.bio && !dev.openTo?.length">
            <img
              :src="dev.avatarUrl || '/default-avatar.png'"
              :alt="`Photo de profil de ${dev.name}, développeuse${dev.location ? ` basée à ${dev.location}` : ''}`"
              class="w-16 h-16 rounded-full object-cover mb-2"
            />
            <h3 class="font-display text-lg font-medium">{{ dev.name }}</h3>
            <p v-if="dev.location" class="text-sm text-foreground-muted">{{ dev.location }}</p>
            <span v-if="dev.isSpeaker" class="mt-1 px-3 py-1 bg-background-card border border-border/10 rounded-full text-[0.7rem] uppercase tracking-widest text-foreground-muted">Speakeuse</span>
            <div v-if="dev.skills?.length" class="flex flex-wrap justify-center gap-2 mt-2">
              <span v-for="skill in dev.skills.slice(0, 5)" :key="skill" class="px-3 py-1 bg-background-card border border-border/10 rounded-full text-xs text-foreground-muted">
                {{ skill }}
              </span>
              <span v-if="dev.skills.length > 5" class="px-2 py-1 text-xs text-foreground-muted">
                +{{ dev.skills.length - 5 }}
              </span>
            </div>
            <span class="mt-3 text-xs text-foreground-muted/40">Voir le profil →</span>
          </template>

          <template v-else>
            <div class="flex items-center gap-4">
              <img
                :src="dev.avatarUrl || '/default-avatar.png'"
                :alt="`Photo de profil de ${dev.name}, développeuse${dev.location ? ` basée à ${dev.location}` : ''}`"
                class="w-12 h-12 rounded-full object-cover"
              />
              <div class="flex-1">
                <h3 class="font-display text-lg font-medium">{{ dev.name }}</h3>
                <p v-if="dev.title" class="text-sm text-foreground-muted">{{ dev.title }}</p>
                <p v-else-if="dev.location" class="text-sm text-foreground-muted">{{ dev.location }}</p>
              </div>
              <span v-if="dev.isSpeaker" class="px-3 py-1 bg-background-card border border-border/10 rounded-full text-[0.7rem] uppercase tracking-widest text-foreground-muted">Speakeuse</span>
            </div>

            <p v-if="dev.bio" class="text-sm text-foreground-muted leading-relaxed line-clamp-2 whitespace-pre-line">{{ dev.bio }}</p>

            <div v-if="dev.skills?.length" class="flex flex-wrap gap-2">
              <span v-for="skill in dev.skills.slice(0, 5)" :key="skill" class="px-3 py-1 bg-background-card border border-border/10 rounded-full text-xs text-foreground-muted">
                {{ skill }}
              </span>
              <span v-if="dev.skills.length > 5" class="px-2 py-1 text-xs text-foreground-muted">
                +{{ dev.skills.length - 5 }}
              </span>
            </div>

            <div v-if="dev.openTo?.length" class="flex flex-wrap gap-2 pt-2 border-t border-border/10">
              <span v-for="(tag, index) in dev.openTo" :key="tag" class="text-[0.7rem] text-foreground-muted">
                {{ openToOptions.find(o => o.value === tag)?.label || tag }}{{ index < dev.openTo.length - 1 ? ' ·' : '' }}
              </span>
            </div>
          </template>
        </NuxtLink>
      </div>

      <div v-if="hasMore" ref="loadMoreRef" class="flex justify-center py-8">
        <span class="w-6 h-6 border-2 border-foreground-muted border-t-transparent rounded-full animate-spin"></span>
      </div>
    </section>
  </div>
</template>
