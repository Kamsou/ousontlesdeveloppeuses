<script setup lang="ts">
useSeoMeta({
  title: 'Annuaire des Développeuses Tech en France',
  description: 'Trouvez des développeuses en France. Filtrez par ville, technologie et disponibilité : freelance, CDI, mentoring, conférence, pair programming.',
  ogTitle: 'Annuaire des Développeuses Tech en France',
  ogDescription: 'Trouvez des développeuses en France. Filtrez par ville, techno et disponibilité (freelance, CDI, mentoring...).',
  ogImage: 'https://ousontlesdeveloppeuses.fr/og-image.png',
  twitterCard: 'summary_large_image',
})

import { openToOptions, lookingForOptions, lookingForLabels, getExperienceLabel, experienceOptions } from '~/utils/constants'
import { queryString, queryArray } from '~/utils/query'

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
  lookingFor: string[]
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
  location: queryString(route.query.location),
  skill: queryString(route.query.skill),
  openTo: queryArray(route.query.openTo),
  lookingFor: queryArray(route.query.lookingFor),
  experience: queryArray(route.query.experience)
})

const extraDevelopers = ref<Developer[]>([])
const page = ref(1)
const isLoadingMore = ref(false)
const lastLoadedHasMore = ref<boolean | null>(null)
const loadMoreRef = ref<HTMLElement | null>(null)

const initialQuery = computed(() => {
  const params: Record<string, string> = {}
  if (filters.location) params.location = filters.location
  if (filters.skill) params.skill = filters.skill
  if (filters.openTo.length) params.openTo = filters.openTo.join(',')
  if (filters.lookingFor.length) params.lookingFor = filters.lookingFor.join(',')
  if (filters.experience.length) params.experience = filters.experience.join(',')
  params.page = '1'
  return params
})

const { data, status } = useLazyFetch<ApiResponse>('/api/developers', {
  query: initialQuery
})

// Derive from `data` with computeds so the list renders during SSR too.
// (A watch-populated ref stays empty on the server because reactive watchers
// don't re-run during SSR, which caused a hydration mismatch.)
const allDevelopers = computed<Developer[]>(() => [
  ...(data.value?.developers ?? []),
  ...extraDevelopers.value
])
const totalCount = computed(() => data.value?.pagination.total ?? 0)
const hasMore = computed(() => lastLoadedHasMore.value ?? data.value?.pagination.hasMore ?? false)
const isLoading = computed(() => !data.value)

// Reset pagination accumulation whenever the base query result changes
// (filter changes / revalidation). Runs client-side only — SSR is always page 1.
watch(data, () => {
  extraDevelopers.value = []
  lastLoadedHasMore.value = null
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
    if (filters.lookingFor.length) params.lookingFor = filters.lookingFor.join(',')
    if (filters.experience.length) params.experience = filters.experience.join(',')
    params.page = page.value.toString()
    const result = await $fetch<ApiResponse>('/api/developers', { query: params })
    extraDevelopers.value = [...extraDevelopers.value, ...result.developers]
    lastLoadedHasMore.value = result.pagination.hasMore
  } catch {
    page.value--
  } finally {
    isLoadingMore.value = false
  }
}

useIntersectionObserver(loadMoreRef, (entries) => {
  if (entries[0]?.isIntersecting) loadMore()
}, { rootMargin: '200px' })

const experienceFilterOptions = experienceOptions.map(o => ({ ...o, key: String(o.value) }))

const showMobileFilters = ref(false)
const showMoreFilters = ref(filters.openTo.length > 0)

const activeFilterCount = computed(() => {
  let count = 0
  if (filters.location) count++
  if (filters.skill) count++
  count += filters.openTo.length
  count += filters.lookingFor.length
  count += filters.experience.length
  return count
})

const openToTags = computed(() =>
  filters.openTo.map(v => ({ label: openToOptions.find(o => o.value === v)?.label || v, value: v }))
)

function removeOpenTo(value: string) {
  const index = filters.openTo.indexOf(value)
  if (index > -1) filters.openTo.splice(index, 1)
  updateUrl()
  trackSearch()
}

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

function toggleExperience(value: string) {
  const index = filters.experience.indexOf(value)
  if (index > -1) {
    filters.experience.splice(index, 1)
  } else {
    filters.experience.push(value)
  }
  updateUrl()
  trackSearch()
}

function toggleLookingFor(value: string) {
  const index = filters.lookingFor.indexOf(value)
  if (index > -1) {
    filters.lookingFor.splice(index, 1)
  } else {
    filters.lookingFor.push(value)
  }
  updateUrl()
  trackSearch()
}

function updateUrl() {
  const urlParams: Record<string, string> = {}
  if (filters.location) urlParams.location = filters.location
  if (filters.skill) urlParams.skill = filters.skill
  if (filters.openTo.length) urlParams.openTo = filters.openTo.join(',')
  if (filters.lookingFor.length) urlParams.lookingFor = filters.lookingFor.join(',')
  if (filters.experience.length) urlParams.experience = filters.experience.join(',')
  router.push({ query: urlParams })
}

function clearFilters() {
  filters.location = ''
  filters.skill = ''
  filters.openTo = []
  filters.lookingFor = []
  filters.experience = []
  page.value = 1
  router.push({ query: {} })
}

let searchTimeout: ReturnType<typeof setTimeout> | null = null

function trackSearch() {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    const hasFilters = filters.location || filters.skill || filters.openTo.length || filters.lookingFor.length || filters.experience.length
    if (!hasFilters) return
    $clientPosthog?.capture('search_performed', {
      page: 'annuaire',
      location: filters.location || null,
      skill: filters.skill || null,
      openTo: filters.openTo.length ? filters.openTo : null,
      lookingFor: filters.lookingFor.length ? filters.lookingFor : null,
      experience: filters.experience.length ? filters.experience : null,
      results_count: totalCount.value
    })
  }, 1000)
}

watch(() => filters.location, () => { updateUrl(); trackSearch() })
watch(() => filters.skill, () => { updateUrl(); trackSearch() })
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 md:px-16">
    <header class="py-8 md:py-16 border-b border-border/10">
      <span class="text-xs tracking-wide text-foreground-muted mb-6 block">Annuaire</span>
      <h1 class="font-display text-4xl md:text-7xl font-medium tracking-tight mb-2">Développeuses</h1>
      <p class="text-foreground-muted text-base">
        <span v-if="isLoading" class="inline-block w-20 h-5 bg-border rounded animate-pulse align-middle" />
        <span v-else>{{ totalCount }} profils</span>
      </p>
    </header>

    <!-- Mobile: bouton filtrer -->
    <div class="md:hidden py-4 border-b border-border/10 flex items-center gap-3">
      <button
        @click="showMobileFilters = !showMobileFilters"
        class="px-4 py-2 border border-border/10 rounded-full text-sm text-foreground-muted transition-all flex items-center gap-2"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="4" y1="6" x2="20" y2="6" /><line x1="6" y1="12" x2="18" y2="12" /><line x1="8" y1="18" x2="16" y2="18" />
        </svg>
        Filtrer
        <span v-if="activeFilterCount" class="px-1.5 py-0.5 bg-foreground text-background rounded-full text-xs font-medium leading-none">{{ activeFilterCount }}</span>
      </button>
      <button v-if="activeFilterCount" @click="clearFilters" class="text-xs text-foreground-muted hover:text-foreground transition-colors">
        Effacer
      </button>
    </div>

    <!-- Filtres: toujours visible desktop, collapsible mobile -->
    <section :class="['py-8 border-b border-border/10', showMobileFilters ? 'block' : 'hidden md:block']">
      <div class="flex flex-col md:flex-row gap-6 items-stretch md:items-end mb-6">
        <div class="flex-1 max-w-none md:max-w-[250px]">
          <label class="block text-xs tracking-wide text-foreground-muted mb-2">Ville</label>
          <input
            v-model="filters.location"
            type="text"
            placeholder="Paris, Lyon..."
            class="w-full px-4 py-3 bg-background-card border border-border/10 rounded-lg text-foreground text-sm transition-colors focus:outline-none focus:border-foreground-muted placeholder:text-foreground-muted"
          />
        </div>

        <div class="flex-1 max-w-none md:max-w-[250px]">
          <label class="block text-xs tracking-wide text-foreground-muted mb-2">Technologie</label>
          <input
            v-model="filters.skill"
            type="text"
            placeholder="Vue.js, Python..."
            class="w-full px-4 py-3 bg-background-card border border-border/10 rounded-lg text-foreground text-sm transition-colors focus:outline-none focus:border-foreground-muted placeholder:text-foreground-muted"
          />
        </div>

        <button v-if="filters.location || filters.skill || filters.lookingFor.length || filters.experience.length || filters.openTo.length" @click="clearFilters" class="hidden md:block px-6 py-3 bg-transparent border border-border/10 rounded-lg text-foreground-muted text-sm cursor-pointer transition-all hover:border-foreground hover:text-foreground">
          Effacer
        </button>
      </div>

      <div class="mt-6 space-y-5">
        <div class="flex flex-col md:flex-row items-start md:items-center gap-4">
          <span class="text-xs tracking-wide text-foreground-muted w-28 shrink-0">En recherche</span>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="option in lookingForOptions"
              :key="option.value"
              :class="[
                'px-4 py-2 border rounded-full text-sm cursor-pointer transition-all',
                filters.lookingFor.includes(option.value)
                  ? 'bg-foreground/10 border-foreground/30 text-foreground'
                  : 'bg-transparent border-border/40 text-foreground-muted hover:border-border/10 hover:text-foreground'
              ]"
              @click="toggleLookingFor(option.value)"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <div class="flex flex-col md:flex-row items-start md:items-center gap-4">
          <span class="text-xs tracking-wide text-foreground-muted w-28 shrink-0">Expérience</span>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="option in experienceFilterOptions"
              :key="option.key"
              :class="[
                'px-4 py-2 border rounded-full text-sm cursor-pointer transition-all',
                filters.experience.includes(option.key)
                  ? 'bg-foreground/10 border-foreground/30 text-foreground'
                  : 'bg-transparent border-border/40 text-foreground-muted hover:border-border/10 hover:text-foreground'
              ]"
              @click="toggleExperience(option.key)"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
      </div>

      <div class="mt-5 flex flex-wrap items-center gap-3">
        <button
          :class="[
            'px-4 py-2 border rounded-full text-sm cursor-pointer transition-all flex items-center gap-2',
            showMoreFilters
              ? 'bg-foreground/10 border-foreground/30 text-foreground'
              : 'bg-transparent border-border/40 text-foreground-muted hover:border-border/10 hover:text-foreground'
          ]"
          @click="showMoreFilters = !showMoreFilters"
        >
          + Échanges
          <span v-if="filters.openTo.length" class="px-1.5 py-0.5 bg-foreground text-background rounded-full text-xs font-medium leading-none">{{ filters.openTo.length }}</span>
        </button>

        <template v-if="openToTags.length && !showMoreFilters">
          <button
            v-for="tag in openToTags"
            :key="tag.value"
            class="px-3 py-1.5 bg-foreground/10 border border-foreground/20 rounded-full text-xs text-foreground cursor-pointer transition-all hover:bg-foreground/20 flex items-center gap-1.5"
            @click="removeOpenTo(tag.value)"
          >
            {{ tag.label }}
            <span class="text-foreground-muted">&#x2715;</span>
          </button>
        </template>
      </div>

      <div v-show="showMoreFilters" class="mt-4">
        <div class="flex flex-col md:flex-row items-start md:items-center gap-4">
          <span class="text-xs tracking-wide text-foreground-muted w-28 shrink-0">Échanges</span>
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
      </div>

      <!-- Mobile: bouton appliquer -->
      <button
        @click="showMobileFilters = false"
        class="md:hidden mt-6 w-full py-3 bg-foreground text-background rounded-full text-sm font-medium"
      >
        Voir les résultats
      </button>
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
          :to="`/directory/${dev.slug}`"
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
            <p v-if="dev.location || getExperienceLabel(dev.yearsExperience)" class="text-sm text-foreground-muted">{{ [dev.location, getExperienceLabel(dev.yearsExperience)].filter(Boolean).join(' · ') }}</p>
            <span v-if="dev.isSpeaker" class="mt-1 px-3 py-1 bg-background-card border border-border/10 rounded-full text-[0.7rem] uppercase tracking-widest text-foreground-muted">Speakeuse</span>
            <div v-if="dev.skills?.length" class="flex flex-wrap justify-center gap-2 mt-2">
              <span v-for="skill in dev.skills.slice(0, 5)" :key="skill" class="px-3 py-1 bg-background-card border border-border/10 rounded-full text-xs text-foreground-muted">
                {{ skill }}
              </span>
              <span v-if="dev.skills.length > 5" class="px-2 py-1 text-xs text-foreground-muted">
                +{{ dev.skills.length - 5 }}
              </span>
            </div>
            <span class="mt-3 text-xs text-foreground-muted/70">Voir le profil →</span>
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
                <p v-if="dev.title" class="text-sm text-foreground-muted">{{ dev.title }}<span v-if="dev.location"> · {{ dev.location }}</span><span v-if="getExperienceLabel(dev.yearsExperience)"> · {{ getExperienceLabel(dev.yearsExperience) }}</span></p>
                <p v-else-if="dev.location || getExperienceLabel(dev.yearsExperience)" class="text-sm text-foreground-muted">{{ [dev.location, getExperienceLabel(dev.yearsExperience)].filter(Boolean).join(' · ') }}</p>
              </div>
              <span v-if="dev.isSpeaker" class="px-3 py-1 bg-background-card border border-border/10 rounded-full text-[0.7rem] uppercase tracking-widest text-foreground-muted">Speakeuse</span>
            </div>

            <div v-if="dev.lookingFor?.length" class="flex flex-wrap gap-1.5">
              <span
                v-for="tag in dev.lookingFor"
                :key="tag"
                class="px-3 py-1 bg-foreground text-background rounded-full text-xs font-medium"
              >
                Recherche {{ lookingForLabels[tag] || tag }}
              </span>
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
