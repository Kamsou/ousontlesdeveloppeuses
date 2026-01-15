<script setup lang="ts">
useSeoMeta({
  title: 'Speakeuses Tech - OSLD',
  description: 'Trouvez des intervenantes tech pour vos conférences et événements. Speakeuses disponibles en remote ou en présentiel.',
  ogTitle: 'Speakeuses Tech - OSLD',
  ogDescription: 'Trouvez des intervenantes tech pour vos conférences et événements. Speakeuses disponibles en remote ou en présentiel.',
  ogImage: 'https://ousontlesdeveloppeuses.fr/og-image.png',
  twitterCard: 'summary_large_image',
})

interface Speaker {
  id: number
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

watch(() => filters.location, () => updateUrl())
watch(() => filters.topic, () => updateUrl())
watch(() => filters.remote, () => updateUrl())
watch(() => filters.travel, () => updateUrl())
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 md:px-16">
    <header class="py-16 border-b border-border">
      <div class="overflow-hidden">
        <span class="text-xs uppercase tracking-[0.2em] text-text/80 mb-6 block animate-slide-up">Speakeuses</span>
      </div>
      <div class="overflow-hidden">
        <h1 class="font-display text-4xl md:text-7xl font-medium tracking-tight mb-2 animate-slide-up animation-delay-100">Speakeuses</h1>
      </div>
      <div class="overflow-hidden">
        <p class="text-text-muted text-base animate-slide-up animation-delay-200">
          {{ speakers?.length || 0 }} speakeuses disponibles pour vos conférences
        </p>
      </div>
    </header>

    <section class="py-8 border-b border-border">
      <div class="flex flex-col md:flex-row gap-6 items-stretch md:items-end mb-6">
        <div class="flex-1 max-w-none md:max-w-[250px]">
          <label class="block text-xs uppercase tracking-widest text-text-muted mb-2">Ville</label>
          <input
            v-model="filters.location"
            type="text"
            placeholder="Paris, Lyon..."
            class="w-full px-4 py-3 bg-bg-card border border-border rounded-lg text-text text-sm transition-colors focus:outline-none focus:border-text-muted placeholder:text-text-muted"
          />
        </div>

        <div class="flex-1 max-w-none md:max-w-[250px]">
          <label class="block text-xs uppercase tracking-widest text-text-muted mb-2">Sujet</label>
          <input
            v-model="filters.topic"
            type="text"
            placeholder="Vue.js, Leadership..."
            class="w-full px-4 py-3 bg-bg-card border border-border rounded-lg text-text text-sm transition-colors focus:outline-none focus:border-text-muted placeholder:text-text-muted"
          />
        </div>

        <button v-if="filters.location || filters.topic || filters.remote || filters.travel" @click="clearFilters" class="px-6 py-3 bg-transparent border border-border rounded-lg text-text-muted text-sm cursor-pointer transition-all hover:border-text hover:text-text">
          Effacer
        </button>
      </div>

      <div class="flex gap-8">
        <label class="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" v-model="filters.remote" class="w-[18px] h-[18px] accent-text" />
          <span class="text-sm text-text-muted">Remote possible</span>
        </label>

        <label class="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" v-model="filters.travel" class="w-[18px] h-[18px] accent-text" />
          <span class="text-sm text-text-muted">Se déplace</span>
        </label>
      </div>
    </section>

    <section class="py-12">
      <div v-if="!speakers?.length" class="text-center py-16 text-text-muted">
        <p class="mb-4">Aucune speakeuse trouvée</p>
        <button @click="clearFilters" class="px-6 py-3 bg-transparent border border-border rounded-lg text-text cursor-pointer">Effacer les filtres</button>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NuxtLink
          v-for="speaker in speakers"
          :key="speaker.id"
          :to="`/profil/${speaker.id}`"
          class="flex flex-col gap-5 p-8 bg-bg-card border border-border rounded-2xl no-underline text-text transition-all hover:bg-bg-card-hover hover:border-text-muted hover:-translate-y-0.5"
        >
          <div class="flex items-center gap-4">
            <img
              :src="speaker.avatarUrl || '/default-avatar.png'"
              :alt="`Photo de ${speaker.name}, speaker tech${speaker.location ? ` basée à ${speaker.location}` : ''}`"
              class="w-16 h-16 rounded-full object-cover"
            />
            <div class="flex-1">
              <h2 class="font-display text-xl font-medium">{{ speaker.name }}</h2>
              <p v-if="speaker.location" class="text-sm text-text-muted mt-1">{{ speaker.location }}</p>
            </div>
          </div>

          <p v-if="speaker.bio" class="text-sm text-text-muted leading-relaxed line-clamp-2">{{ speaker.bio }}</p>

          <div v-if="speaker.speakerProfile?.topics?.length" class="flex flex-col gap-2">
            <span class="text-[0.7rem] uppercase tracking-widest text-text-muted">Sujets</span>
            <div class="flex flex-wrap gap-2">
              <span v-for="topic in speaker.speakerProfile.topics" :key="topic" class="px-4 py-2 bg-text text-bg rounded-full text-sm font-medium">
                {{ topic }}
              </span>
            </div>
          </div>

          <div class="flex gap-3">
            <span v-if="speaker.speakerProfile?.remoteOk" class="px-3 py-1.5 bg-bg-card border border-border rounded-full text-xs text-text-muted">Remote possible</span>
            <span v-if="speaker.speakerProfile?.travelWilling" class="px-3 py-1.5 bg-bg-card border border-border rounded-full text-xs text-text-muted">Se déplace</span>
          </div>

          <div v-if="speaker.skills?.length" class="flex flex-wrap gap-2 pt-3 border-t border-border">
            <span v-for="skill in speaker.skills.slice(0, 4)" :key="skill" class="px-3 py-1 bg-bg-card border border-border rounded-full text-xs text-text-muted">
              {{ skill }}
            </span>
            <span v-if="speaker.skills.length > 4" class="px-2 py-1 text-xs text-text-muted">
              +{{ speaker.skills.length - 4 }}
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
