<script setup lang="ts">
useSeoMeta({
  title: 'Annuaire des Développeuses Tech en France',
  description: 'Trouvez des développeuses en France. Filtrez par ville, technologie et disponibilité : freelance, CDI, mentoring, conférence, pair programming.',
  ogTitle: 'Annuaire des Développeuses Tech en France',
  ogDescription: 'Trouvez des développeuses en France. Filtrez par ville, techno et disponibilité (freelance, CDI, mentoring...).',
  twitterCard: 'summary_large_image',
})

const { data: ogStats } = await useFetch('/api/stats', { key: 'og-stats' })
const { data: landings } = await useFetch<{ cities: { slug: string, label: string, count: number }[], techs: { slug: string, label: string, count: number }[] }>('/api/landings', { key: 'landings' })
const { data: ogAvatars } = await useFetch<string[]>('/api/developers/avatars', { key: 'og-avatars' })
defineOgImage('Listing', {
  label: 'annuaire',
  title: 'Annuaire des',
  outline: 'développeuses',
  count: ogStats.value?.developers ?? null,
  countLabel: 'profils · filtre par ville, stack, dispo',
  avatars: ogAvatars.value ?? []
})

import { openToOptions, openToLabels, lookingForOptions, lookingForLabels, getExperienceLabel, experienceOptions } from '~/utils/constants'
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

function pillClass(active: boolean) {
  return [
    'px-3.5 py-1.5 border rounded-full text-sm cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40',
    active
      ? 'bg-foreground border-foreground text-background'
      : 'bg-transparent border-border/15 text-foreground-muted hover:border-foreground/30 hover:text-foreground'
  ]
}

function cardMeta(dev: Developer) {
  return [dev.title, dev.location, getExperienceLabel(dev.yearsExperience)].filter(Boolean).join(' · ')
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
  <div>
    <PageHero label="annuaire" title="Développeuses">
      <p>
        <span v-if="isLoading" class="inline-block w-10 h-5 bg-foreground/10 rounded motion-safe:animate-pulse align-middle" />
        <span v-else class="text-foreground tabular-nums">{{ totalCount }}</span>
        {{ activeFilterCount ? 'profils correspondent à ta recherche.' : 'profils, partout en France. Filtre par ville, stack et disponibilité.' }}
      </p>
    </PageHero>

    <section class="px-4 md:px-16 border-t border-border/10">
      <div class="w-full max-w-7xl mx-auto">
        <div class="md:hidden py-4 flex items-center gap-3">
          <button
            :aria-expanded="showMobileFilters"
            class="px-4 py-2 border border-border/15 rounded-full text-sm text-foreground transition-colors hover:border-foreground/30 flex items-center gap-2"
            @click="showMobileFilters = !showMobileFilters"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <line x1="4" y1="6" x2="20" y2="6" /><line x1="6" y1="12" x2="18" y2="12" /><line x1="8" y1="18" x2="16" y2="18" />
            </svg>
            Filtrer
            <span v-if="activeFilterCount" class="px-1.5 py-0.5 bg-foreground text-background rounded-full text-xs font-medium leading-none tabular-nums">{{ activeFilterCount }}</span>
          </button>
          <button v-if="activeFilterCount" class="font-mono text-xs text-foreground-muted underline underline-offset-4 hover:text-foreground transition-colors" @click="clearFilters">
            effacer
          </button>
        </div>

        <div :class="['pt-4 pb-8 md:py-10', showMobileFilters ? 'block' : 'hidden md:block']">
          <div class="grid lg:grid-cols-[minmax(0,320px)_1fr] gap-8 lg:gap-16">
            <div class="grid sm:grid-cols-2 lg:grid-cols-1 gap-5 content-start">
              <div>
                <label for="filter-location" class="block font-mono text-xs text-foreground-muted mb-2"># ville</label>
                <div class="flex items-center gap-3 px-4 rounded-2xl border border-border/15 bg-background/60 transition-colors focus-within:border-foreground/40">
                  <svg class="w-4 h-4 text-foreground-muted shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
                    <circle cx="12" cy="9.5" r="2.5" />
                  </svg>
                  <input
                    id="filter-location"
                    v-model="filters.location"
                    type="text"
                    placeholder="Paris, Lyon..."
                    class="w-full py-3.5 bg-transparent text-foreground text-sm focus:outline-none placeholder:text-foreground-muted"
                  />
                </div>
              </div>

              <div>
                <label for="filter-skill" class="block font-mono text-xs text-foreground-muted mb-2"># techno</label>
                <div class="flex items-center gap-3 px-4 rounded-2xl border border-border/15 bg-background/60 transition-colors focus-within:border-foreground/40">
                  <svg class="w-4 h-4 text-foreground-muted shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M21 21l-4.3-4.3" />
                  </svg>
                  <input
                    id="filter-skill"
                    v-model="filters.skill"
                    type="text"
                    placeholder="Vue.js, Python..."
                    class="w-full py-3.5 bg-transparent text-foreground text-sm focus:outline-none placeholder:text-foreground-muted"
                  />
                </div>
              </div>

              <button
                v-if="activeFilterCount"
                class="hidden md:inline-flex items-center gap-2 justify-self-start font-mono text-xs text-foreground-muted underline underline-offset-4 hover:text-foreground transition-colors"
                @click="clearFilters"
              >
                effacer les filtres ({{ activeFilterCount }})
              </button>
            </div>

            <div class="flex flex-col gap-6">
              <div class="grid md:grid-cols-[7.5rem_1fr] gap-3 md:items-baseline">
                <span class="font-mono text-xs text-foreground-muted"># en-recherche</span>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="option in lookingForOptions"
                    :key="option.value"
                    :aria-pressed="filters.lookingFor.includes(option.value)"
                    :class="pillClass(filters.lookingFor.includes(option.value))"
                    @click="toggleLookingFor(option.value)"
                  >
                    {{ option.label }}
                  </button>
                </div>
              </div>

              <div class="grid md:grid-cols-[7.5rem_1fr] gap-3 md:items-baseline">
                <span class="font-mono text-xs text-foreground-muted"># expérience</span>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="option in experienceFilterOptions"
                    :key="option.key"
                    :aria-pressed="filters.experience.includes(option.key)"
                    :class="pillClass(filters.experience.includes(option.key))"
                    @click="toggleExperience(option.key)"
                  >
                    {{ option.label }}
                  </button>
                </div>
              </div>

              <div class="grid md:grid-cols-[7.5rem_1fr] gap-3 md:items-baseline">
                <span class="font-mono text-xs text-foreground-muted"># échanges</span>
                <div class="flex flex-wrap items-center gap-2">
                  <template v-if="showMoreFilters">
                    <button
                      v-for="option in openToOptions"
                      :key="option.value"
                      :aria-pressed="filters.openTo.includes(option.value)"
                      :class="pillClass(filters.openTo.includes(option.value))"
                      @click="toggleOpenTo(option.value)"
                    >
                      {{ option.label }}
                    </button>
                  </template>
                  <template v-else>
                    <button
                      v-for="tag in openToTags"
                      :key="tag.value"
                      :aria-label="`Retirer le filtre ${tag.label}`"
                      class="px-3.5 py-1.5 bg-foreground border border-foreground rounded-full text-sm text-background cursor-pointer transition-opacity hover:opacity-80 flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
                      @click="removeOpenTo(tag.value)"
                    >
                      {{ tag.label }}
                      <span aria-hidden="true" class="text-xs opacity-60">&#x2715;</span>
                    </button>
                  </template>
                  <button
                    :aria-expanded="showMoreFilters"
                    class="px-3.5 py-1.5 border border-dashed border-border/20 rounded-full text-sm text-foreground-muted cursor-pointer transition-colors hover:border-foreground/30 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
                    @click="showMoreFilters = !showMoreFilters"
                  >
                    {{ showMoreFilters ? '− Réduire' : '+ Conférence, mentoring…' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button
            class="md:hidden mt-8 w-full py-3 bg-foreground text-background rounded-full text-sm font-medium"
            @click="showMobileFilters = false"
          >
            Voir les résultats
          </button>
        </div>
      </div>
    </section>

    <section class="px-4 md:px-16 py-10 md:py-14 border-t border-border/10">
      <div class="w-full max-w-7xl mx-auto">
        <div class="flex items-baseline justify-between gap-4 mb-6">
          <h2 class="font-mono text-xs text-foreground-muted"># profils</h2>
          <span v-if="!isLoading" class="font-mono text-xs text-foreground-muted tabular-nums">{{ allDevelopers.length }} / {{ totalCount }}</span>
        </div>

        <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4" aria-hidden="true">
          <div v-for="i in 6" :key="i" class="flex flex-col gap-5 p-6 rounded-3xl border border-border/10 bg-background-card">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-full bg-foreground/10 motion-safe:animate-pulse" />
              <div class="flex-1 space-y-2">
                <div class="h-4 w-32 rounded bg-foreground/10 motion-safe:animate-pulse" />
                <div class="h-3 w-24 rounded bg-foreground/5 motion-safe:animate-pulse" />
              </div>
            </div>
            <div class="space-y-2">
              <div class="h-3 w-full rounded bg-foreground/5 motion-safe:animate-pulse" />
              <div class="h-3 w-3/4 rounded bg-foreground/5 motion-safe:animate-pulse" />
            </div>
            <div class="flex gap-1.5">
              <div class="h-6 w-16 rounded-full bg-foreground/5 motion-safe:animate-pulse" />
              <div class="h-6 w-20 rounded-full bg-foreground/5 motion-safe:animate-pulse" />
              <div class="h-6 w-14 rounded-full bg-foreground/5 motion-safe:animate-pulse" />
            </div>
          </div>
        </div>

        <div v-else-if="!allDevelopers.length" class="relative overflow-hidden flex flex-col items-center text-center gap-4 px-6 py-16 md:py-24 rounded-3xl border border-dashed border-border/15">
          <div aria-hidden="true" class="absolute inset-0 grid-lines [mask-image:radial-gradient(ellipse_at_center,#000_10%,transparent_70%)]"></div>
          <p class="relative font-mono text-xs text-foreground-muted"># 0 résultat</p>
          <p class="relative font-display text-3xl md:text-4xl font-medium tracking-tight">Aucun profil trouvé</p>
          <p class="relative text-foreground-muted text-sm max-w-sm">Essaie une autre ville, une autre techno, ou retire quelques filtres.</p>
          <button class="relative mt-2 px-5 py-2.5 border border-border/15 rounded-full text-sm text-foreground transition-colors hover:border-foreground" @click="clearFilters">
            Effacer les filtres
          </button>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          <NuxtLink
            v-for="dev in allDevelopers"
            :key="dev.id"
            :to="`/directory/${dev.slug}`"
            class="spotlight-card group flex flex-col gap-5 p-6 rounded-3xl border border-border/10 bg-background-card no-underline text-foreground"
            @pointermove="trackPointer"
          >
            <div class="flex items-start gap-4">
              <img
                :src="dev.avatarUrl || '/default-avatar.png'"
                :alt="`Photo de profil de ${dev.name}, développeuse${dev.location ? ` basée à ${dev.location}` : ''}`"
                width="48"
                height="48"
                loading="lazy"
                class="w-12 h-12 shrink-0 rounded-full object-cover grayscale group-hover:grayscale-0 group-focus-visible:grayscale-0 transition-[filter] duration-500"
              />
              <div class="flex-1 min-w-0">
                <h3 class="font-display text-lg font-medium leading-snug">{{ dev.name }}</h3>
                <p v-if="cardMeta(dev)" class="text-sm text-foreground-muted leading-snug mt-0.5">{{ cardMeta(dev) }}</p>
              </div>
              <span v-if="dev.isSpeaker" class="shrink-0 px-2.5 py-1 border border-border/15 rounded-full font-mono text-[0.65rem] text-foreground-muted">speakeuse</span>
            </div>

            <div v-if="dev.lookingFor?.length" class="flex flex-wrap gap-1.5">
              <span
                v-for="tag in dev.lookingFor"
                :key="tag"
                class="px-2.5 py-1 bg-foreground text-background rounded-full text-xs font-medium"
              >
                Recherche {{ lookingForLabels[tag] || tag }}
              </span>
            </div>

            <p v-if="dev.bio" class="text-sm text-foreground-muted leading-relaxed line-clamp-2 whitespace-pre-line">{{ dev.bio }}</p>

            <div v-if="dev.skills?.length" class="flex flex-wrap gap-1.5">
              <span v-for="skill in dev.skills.slice(0, 5)" :key="skill" class="px-2.5 py-1 bg-foreground/[0.06] rounded-full text-xs">
                {{ skill }}
              </span>
              <span v-if="dev.skills.length > 5" class="px-2 py-1 font-mono text-xs text-foreground-muted">
                +{{ dev.skills.length - 5 }}
              </span>
            </div>

            <div class="mt-auto pt-4 border-t border-border/10 flex items-center justify-between gap-4">
              <p class="font-mono text-[0.7rem] text-foreground-muted leading-relaxed">
                <template v-if="dev.openTo?.length">{{ dev.openTo.map(tag => openToLabels[tag] || tag).join(' · ') }}</template>
                <template v-else>voir le profil</template>
              </p>
              <svg class="w-4 h-4 shrink-0 text-foreground-muted transition-transform duration-300 group-hover:translate-x-1 group-hover:text-foreground motion-reduce:transition-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </NuxtLink>
        </div>

        <div v-if="hasMore" ref="loadMoreRef" class="flex items-center justify-center gap-3 py-10">
          <span class="w-4 h-4 border-2 border-foreground-muted border-t-transparent rounded-full motion-safe:animate-spin" aria-hidden="true"></span>
          <span class="font-mono text-xs text-foreground-muted">chargement…</span>
        </div>
      </div>
    </section>

    <section v-if="landings && (landings.cities.length || landings.techs.length)" class="px-4 md:px-16 py-12 md:py-16 border-t border-border/10">
      <div class="w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-12">
        <div v-if="landings.cities.length">
          <h2 class="font-mono text-xs text-foreground-muted mb-4"># par-ville</h2>
          <ul class="flex flex-wrap gap-2">
            <li v-for="city in landings.cities" :key="city.slug">
              <NuxtLink :to="`/directory/ville/${city.slug}`" class="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/15 text-sm text-foreground no-underline hover:border-foreground/40 transition-colors">
                Développeuses à {{ city.label }}
                <span class="font-mono text-xs text-foreground-muted">{{ city.count }}</span>
              </NuxtLink>
            </li>
          </ul>
        </div>
        <div v-if="landings.techs.length">
          <h2 class="font-mono text-xs text-foreground-muted mb-4"># par-techno</h2>
          <ul class="flex flex-wrap gap-2">
            <li v-for="tech in landings.techs" :key="tech.slug">
              <NuxtLink :to="`/directory/techno/${tech.slug}`" class="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/15 text-sm text-foreground no-underline hover:border-foreground/40 transition-colors">
                Développeuses {{ tech.label }}
                <span class="font-mono text-xs text-foreground-muted">{{ tech.count }}</span>
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>
