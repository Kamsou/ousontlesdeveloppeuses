<script setup lang="ts">
useSeoMeta({
  title: 'Speakeuses Tech pour vos Conférences',
  description: 'Trouvez des speakeuses tech pour vos conférences et événements. Filtrez par sujet, ville, remote ou présentiel. Développeuses disponibles en France.',
  ogTitle: 'Speakeuses Tech pour vos Conférences',
  ogDescription: 'Trouvez des speakeuses tech pour vos conférences. Filtrez par sujet, remote ou présentiel.',
  ogImage: 'https://ousontlesdeveloppeuses.fr/og-image.png',
  twitterCard: 'summary_large_image',
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
    remoteOk: boolean | null
    travelWilling: boolean | null
    available: boolean | null
  } | null
}

const { $clientPosthog } = useNuxtApp()
const route = useRoute()
const router = useRouter()

const filters = reactive({
  location: route.query.location as string || '',
  topic: route.query.topic as string || '',
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
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 md:px-16">
    <header class="py-16 border-b border-border">
      <div class="overflow-hidden">
        <span class="text-xs uppercase tracking-[0.2em] text-foreground/80 mb-6 block animate-slide-up">Speakeuses</span>
      </div>
      <div class="overflow-hidden">
        <h1 class="font-display text-4xl md:text-7xl font-medium tracking-tight mb-2 animate-slide-up animation-delay-100">Speakeuses</h1>
      </div>
      <div class="overflow-hidden">
        <p class="text-foreground-muted text-base animate-slide-up animation-delay-200">
          <span v-if="isLoading" class="inline-block w-64 h-5 bg-border rounded animate-pulse align-middle" />
          <span v-else>{{ speakers?.length || 0 }} speakeuses disponibles pour vos conférences</span>
        </p>
      </div>
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
          <label class="block text-xs uppercase tracking-widest text-foreground-muted mb-2">Sujet</label>
          <input
            v-model="filters.topic"
            type="text"
            placeholder="Vue.js, Leadership..."
            class="w-full px-4 py-3 bg-background-card border border-border rounded-lg text-foreground text-sm transition-colors focus:outline-none focus:border-foreground-muted placeholder:text-foreground-muted"
          />
        </div>

        <button v-if="filters.location || filters.topic || filters.remote || filters.travel" @click="clearFilters" class="px-6 py-3 bg-transparent border border-border rounded-lg text-foreground-muted text-sm cursor-pointer transition-all hover:border-foreground hover:text-foreground">
          Effacer
        </button>
      </div>

      <div class="flex gap-8">
        <label class="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" v-model="filters.remote" class="w-[18px] h-[18px] accent-foreground" />
          <span class="text-sm text-foreground-muted">Remote possible</span>
        </label>

        <label class="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" v-model="filters.travel" class="w-[18px] h-[18px] accent-foreground" />
          <span class="text-sm text-foreground-muted">Se déplace</span>
        </label>
      </div>
    </section>

    <section class="py-12">
      <div v-if="isLoading" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CardSkeleton v-for="i in 4" :key="i" variant="speaker" />
      </div>

      <div v-else-if="!speakers?.length" class="text-center py-16 text-foreground-muted">
        <p class="mb-4">Aucune speakeuse trouvée</p>
        <button @click="clearFilters" class="px-6 py-3 bg-transparent border border-border rounded-lg text-foreground cursor-pointer">Effacer les filtres</button>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NuxtLink
          v-for="speaker in speakers"
          :key="speaker.id"
          :to="`/annuaire/${speaker.slug}`"
          class="flex flex-col gap-5 p-8 bg-background-card border border-border rounded-2xl no-underline text-foreground transition-all hover:bg-background-card-hover hover:border-foreground-muted hover:-translate-y-0.5"
        >
          <div class="flex items-center gap-4">
            <img
              :src="speaker.avatarUrl || '/default-avatar.png'"
              :alt="`Photo de ${speaker.name}, speaker tech${speaker.location ? ` basée à ${speaker.location}` : ''}`"
              class="w-16 h-16 rounded-full object-cover"
            />
            <div class="flex-1">
              <h2 class="font-display text-xl font-medium">{{ speaker.name }}</h2>
              <p v-if="speaker.location" class="text-sm text-foreground-muted mt-1">{{ speaker.location }}</p>
            </div>
          </div>

          <p v-if="speaker.bio" class="text-sm text-foreground-muted leading-relaxed line-clamp-2">{{ speaker.bio }}</p>

          <div v-if="speaker.speakerProfile?.topics?.length" class="flex flex-wrap items-center gap-2">
            <span class="text-[0.65rem] uppercase tracking-widest text-foreground-muted mr-1">Sujets</span>
            <span v-for="topic in speaker.speakerProfile.topics" :key="topic" class="px-3 py-1.5 bg-foreground/10 border border-foreground/20 rounded-full text-xs text-foreground">
              {{ topic }}
            </span>
          </div>

          <div class="flex items-center gap-4 text-xs text-foreground-muted">
            <span v-if="speaker.speakerProfile?.remoteOk" class="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-foreground-muted/60"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              Remote
            </span>
            <span v-if="speaker.speakerProfile?.travelWilling" class="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-foreground-muted/60"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              Se déplace
            </span>
            <span v-if="speaker.skills?.length" class="ml-auto text-foreground-muted/40">
              {{ speaker.skills.slice(0, 3).join(' · ') }}<template v-if="speaker.skills.length > 3"> · +{{ speaker.skills.length - 3 }}</template>
            </span>
          </div>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
@keyframes slide-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-up {
  animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animation-delay-100 {
  animation-delay: 0.1s;
  opacity: 0;
}

.animation-delay-200 {
  animation-delay: 0.2s;
  opacity: 0;
}
</style>
