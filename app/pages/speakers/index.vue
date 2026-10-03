<script setup lang="ts">
useSeoMeta({
  title: 'Speakeuses Tech pour vos Conférences',
  description: 'Trouvez des speakeuses tech pour vos conférences et événements. Filtrez par sujet, ville, remote ou présentiel. Développeuses disponibles en France.',
  ogTitle: 'Speakeuses Tech pour vos Conférences',
  ogDescription: 'Trouvez des speakeuses tech pour vos conférences. Filtrez par sujet, remote ou présentiel.',
  twitterCard: 'summary_large_image',
})

const [{ data: ogStats }, { data: ogAvatars }] = await Promise.all([
  useFetch('/api/stats', { key: 'og-stats' }),
  useFetch<string[]>('/api/developers/avatars', { key: 'og-speaker-avatars', query: { speakers: 'true' } })
])
defineOgImage('Listing', {
  label: 'speakeuses',
  title: 'Trouve ta',
  outline: 'speakeuse tech',
  count: ogStats.value?.speakers ?? null,
  countLabel: 'speakeuses pour tes conférences',
  avatars: ogAvatars.value ?? []
})

interface Speaker {
  id: number
  slug: string
  name: string
  avatarUrl: string | null
  bio: string | null
  location: string | null
  skills: string[]
  speakerProfile: {
    topics: string[]
    pastTalksUrl: string | null
    remoteOk: boolean | null
    travelWilling: boolean | null
    available: boolean | null
  } | null
}

import { queryString } from '~/utils/query'

const { $clientPosthog } = useNuxtApp()
const route = useRoute()
const router = useRouter()

const filters = reactive({
  location: queryString(route.query.location),
  topic: queryString(route.query.topic),
  remote: route.query.remote === 'true',
  travel: route.query.travel === 'true'
})

const queryParams = computed(() => {
  const params: Record<string, string> = {}
  if (filters.location) params.location = filters.location
  if (filters.topic) params.topic = filters.topic
  if (filters.remote) params.remote = 'true'
  if (filters.travel) params.travel = 'true'
  return params
})

const { data: speakers, status, refresh } = useLazyFetch<Speaker[]>('/api/speakers', {
  query: queryParams,
  watch: [queryParams]
})

const resultsAnnouncement = ref('')

const isLoading = computed(() => status.value === 'pending')

function updateUrl() {
  router.push({ query: queryParams.value })
  refresh()
}

function clearFilters() {
  filters.location = ''
  filters.topic = ''
  filters.remote = false
  filters.travel = false
  router.push({ query: {} })
  refresh()
}

let searchTimeout: ReturnType<typeof setTimeout> | null = null

function trackSearch() {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    const hasFilters = filters.location || filters.topic || filters.remote || filters.travel
    if (!hasFilters) return
    $clientPosthog?.capture('search_performed', {
      page: 'speakers',
      location: filters.location || null,
      topic: filters.topic || null,
      remote: filters.remote,
      travel: filters.travel,
      results_count: speakers.value?.length || 0
    })
  }, 1000)
}

watch(() => filters.location, () => { updateUrl(); trackSearch() })
watch(() => filters.topic, () => { updateUrl(); trackSearch() })
watch(() => filters.remote, () => { updateUrl(); trackSearch() })
watch(() => filters.travel, () => { updateUrl(); trackSearch() })
watchDebounced(speakers, () => {
  if (!speakers.value) return
  const total = speakers.value.length
  resultsAnnouncement.value = total ? `${total} ${total > 1 ? 'speakeuses trouvées' : 'speakeuse trouvée'}` : 'Aucune speakeuse trouvée'
}, { debounce: 400 })
</script>

<template>
  <div>
    <PageHero label="speakeuses" title="Speakeuses">
      <span v-if="isLoading" class="inline-block w-72 max-w-full h-5 bg-foreground/10 rounded-full animate-pulse align-middle" />
      <span v-else><span class="text-foreground">{{ speakers?.length || 0 }}</span> speakeuses disponibles pour vos conférences et événements tech.</span>
    </PageHero>

    <section class="px-4 md:px-16 py-8 border-t border-border/10">
      <div class="w-full max-w-7xl mx-auto flex flex-col lg:flex-row lg:flex-wrap lg:items-end gap-5 lg:gap-6">
        <div class="grid sm:grid-cols-2 gap-4 min-w-0 lg:flex-[0_1_34rem]">
          <div>
            <label for="speaker-location" class="block font-mono text-xs text-foreground-muted mb-2">ville</label>
            <div class="flex items-center gap-3 px-4 rounded-2xl border border-border/15 bg-background/60 transition-colors focus-within:border-foreground/60 focus-within:ring-2 focus-within:ring-foreground/70">
              <svg class="w-4 h-4 shrink-0 text-foreground-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <input
                id="speaker-location"
                v-model="filters.location"
                type="text"
                placeholder="Paris, Lyon..."
                class="w-full py-3 bg-transparent text-foreground text-sm focus:outline-none placeholder:text-foreground-muted"
              />
            </div>
          </div>

          <div>
            <label for="speaker-topic" class="block font-mono text-xs text-foreground-muted mb-2">sujet</label>
            <div class="flex items-center gap-3 px-4 rounded-2xl border border-border/15 bg-background/60 transition-colors focus-within:border-foreground/60 focus-within:ring-2 focus-within:ring-foreground/70">
              <svg class="w-4 h-4 shrink-0 text-foreground-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
              </svg>
              <input
                id="speaker-topic"
                v-model="filters.topic"
                type="text"
                placeholder="Vue.js, Leadership..."
                class="w-full py-3 bg-transparent text-foreground text-sm focus:outline-none placeholder:text-foreground-muted"
              />
            </div>
          </div>
        </div>

        <fieldset class="min-w-0 flex flex-wrap items-center gap-2">
          <legend class="sr-only">Format</legend>
          <label
            :class="[
              'inline-flex items-center gap-2 px-4 py-3 rounded-full border text-sm font-medium cursor-pointer select-none transition-all has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-foreground/60 has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-background',
              filters.remote ? 'bg-foreground text-background border-foreground' : 'bg-background/60 border-border/15 text-foreground-muted hover:text-foreground hover:border-foreground/40'
            ]"
          >
            <input v-model="filters.remote" type="checkbox" class="sr-only" />
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            Remote possible
          </label>

          <label
            :class="[
              'inline-flex items-center gap-2 px-4 py-3 rounded-full border text-sm font-medium cursor-pointer select-none transition-all has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-foreground/60 has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-background',
              filters.travel ? 'bg-foreground text-background border-foreground' : 'bg-background/60 border-border/15 text-foreground-muted hover:text-foreground hover:border-foreground/40'
            ]"
          >
            <input v-model="filters.travel" type="checkbox" class="sr-only" />
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
            </svg>
            Se déplace
          </label>

          <button
            v-if="filters.location || filters.topic || filters.remote || filters.travel"
            class="inline-flex items-center gap-1.5 px-4 py-3 rounded-full font-mono text-xs text-foreground-muted cursor-pointer transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/70"
            @click="clearFilters"
          >
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
            effacer
          </button>
        </fieldset>
      </div>
    </section>

    <section class="px-4 md:px-16 pt-4 pb-16 md:pb-24">
      <div class="w-full max-w-7xl mx-auto">
        <p role="status" class="sr-only">{{ resultsAnnouncement }}</p>
        <div v-if="isLoading" class="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4" aria-busy="true">
          <div v-for="i in 4" :key="i" class="flex flex-col gap-5 p-6 md:p-8 rounded-3xl border border-border/10 bg-background-card animate-pulse">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-full bg-foreground/10" />
              <div class="flex-1">
                <div class="h-5 w-40 bg-foreground/10 rounded-full mb-2" />
                <div class="h-3 w-24 bg-foreground/10 rounded-full" />
              </div>
            </div>
            <div class="h-3 w-full bg-foreground/10 rounded-full" />
            <div class="h-3 w-2/3 bg-foreground/10 rounded-full" />
            <div class="flex gap-2">
              <div class="h-7 w-24 bg-foreground/10 rounded-full" />
              <div class="h-7 w-28 bg-foreground/10 rounded-full" />
            </div>
          </div>
        </div>

        <div v-else-if="!speakers?.length" class="relative overflow-hidden flex flex-col items-center text-center px-6 py-16 md:py-24 rounded-3xl border border-dashed border-border/15">
          <div aria-hidden="true" class="absolute inset-0 grid-lines [mask-image:radial-gradient(ellipse_at_center,#000_10%,transparent_70%)]"></div>
          <p class="relative font-mono text-xs text-foreground-muted mb-3"># 0 résultat</p>
          <p class="relative font-display text-2xl md:text-3xl font-medium tracking-tight mb-2">Aucune speakeuse trouvée</p>
          <p class="relative text-sm text-foreground-muted mb-8 max-w-sm">Essaie une autre ville, un sujet plus large, ou retire un filtre.</p>
          <button
            class="relative px-5 py-3 bg-background/60 border border-b-[3px] border-border/15 border-b-border/30 rounded-full text-sm font-medium text-foreground cursor-pointer transition-all hover:bg-foreground hover:text-background hover:border-foreground hover:-translate-y-0.5 active:translate-y-px active:border-b"
            @click="clearFilters"
          >
            Effacer les filtres
          </button>
        </div>

        <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
          <NuxtLink
            v-for="speaker in speakers"
            :key="speaker.id"
            :to="`/directory/${speaker.slug}`"
            class="spotlight-card group flex flex-col gap-5 p-6 md:p-8 rounded-3xl border border-border/10 bg-background-card no-underline text-foreground"
            @pointermove="trackPointer"
          >
            <div class="flex items-center gap-4">
              <img
                :src="optimizedAvatar(speaker.avatarUrl, 128) || '/default-avatar.png'"
                alt=""
                width="64"
                height="64"
                loading="lazy"
                decoding="async"
                class="w-16 h-16 rounded-full object-cover border border-border/15 grayscale transition-[filter] duration-500 group-hover:grayscale-0"
              />
              <div class="flex-1 min-w-0">
                <h2 class="font-display text-xl md:text-2xl font-medium tracking-tight leading-tight break-words">{{ speaker.name }}</h2>
                <p v-if="speaker.location" class="font-mono text-xs text-foreground-muted mt-1 truncate">{{ speaker.location }}</p>
              </div>
              <span aria-hidden="true" class="shrink-0 flex items-center justify-center w-10 h-10 rounded-full border border-border/15 text-foreground-muted transition-all duration-300 group-hover:bg-foreground group-hover:text-background group-hover:border-foreground group-hover:-rotate-45">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </span>
            </div>

            <p v-if="speaker.bio" class="text-sm text-foreground-muted leading-relaxed line-clamp-2">{{ speaker.bio }}</p>

            <div v-if="speaker.speakerProfile?.topics?.length">
              <p class="font-mono text-[0.65rem] text-foreground-muted mb-2.5">sujets</p>
              <div class="flex flex-wrap gap-1.5">
                <span v-for="topic in speaker.speakerProfile.topics" :key="topic" class="px-2.5 py-1 text-xs border border-border/15 rounded-full transition-colors group-hover:border-foreground/30">
                  {{ topic }}
                </span>
              </div>
            </div>

            <div class="mt-auto pt-4 border-t border-border/10 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[0.7rem] text-foreground-muted">
              <span v-if="speaker.speakerProfile?.remoteOk" class="inline-flex items-center gap-1.5">
                <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                remote
              </span>
              <span v-if="speaker.speakerProfile?.travelWilling" class="inline-flex items-center gap-1.5">
                <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                se déplace
              </span>
              <span v-if="speaker.speakerProfile?.pastTalksUrl" class="inline-flex items-center gap-1.5">
                <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                talks dispo
              </span>
              <span v-if="speaker.skills?.length" class="ml-auto truncate max-w-full text-foreground-muted">
                {{ speaker.skills.slice(0, 3).join(' · ') }}<template v-if="speaker.skills.length > 3"> · +{{ speaker.skills.length - 3 }}</template>
              </span>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
