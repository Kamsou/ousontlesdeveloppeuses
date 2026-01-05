<script setup lang="ts">
useSeoMeta({
  title: 'Annuaire des Développeuses',
  description: 'Explorez les profils de développeuses en France. Filtrez par ville, technologie et disponibilité.',
})

const route = useRoute()
const router = useRouter()

const openToOptions = [
  { value: 'conference', label: 'Conférence' },
  { value: 'mentoring', label: 'Mentoring' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'cdi', label: 'CDI' },
  { value: 'coffee_chat', label: 'Coffee chat' },
  { value: 'pair_programming', label: 'Pair programming' },
  { value: 'cv_review', label: 'Relecture CV' }
]

const filters = reactive({
  location: route.query.location as string || '',
  skill: route.query.skill as string || '',
  openTo: (route.query.openTo as string)?.split(',').filter(Boolean) || []
})

const queryParams = computed(() => {
  const params: Record<string, string> = {}
  if (filters.location) params.location = filters.location
  if (filters.skill) params.skill = filters.skill
  if (filters.openTo.length) params.openTo = filters.openTo.join(',')
  return params
})

const { data: developers, refresh } = await useFetch('/api/developers', {
  query: queryParams,
  watch: [queryParams]
})

function toggleOpenTo(value: string) {
  const index = filters.openTo.indexOf(value)
  if (index > -1) {
    filters.openTo.splice(index, 1)
  } else {
    filters.openTo.push(value)
  }
  updateUrl()
}

function updateUrl() {
  router.push({ query: queryParams.value })
  refresh()
}

function clearFilters() {
  filters.location = ''
  filters.skill = ''
  filters.openTo = []
  router.push({ query: {} })
  refresh()
}

watch(() => filters.location, () => updateUrl())
watch(() => filters.skill, () => updateUrl())
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 md:px-16">
    <header class="py-16 border-b border-border">
      <span class="text-xs uppercase tracking-[0.2em] text-text-muted mb-6 block">Annuaire</span>
      <h1 class="font-display text-4xl md:text-7xl font-medium tracking-tight mb-2">Développeuses</h1>
      <p class="text-text-muted text-base">
        {{ developers?.length || 0 }} profils
      </p>
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
          <label class="block text-xs uppercase tracking-widest text-text-muted mb-2">Technologie</label>
          <input
            v-model="filters.skill"
            type="text"
            placeholder="Vue.js, Python..."
            class="w-full px-4 py-3 bg-bg-card border border-border rounded-lg text-text text-sm transition-colors focus:outline-none focus:border-text-muted placeholder:text-text-muted"
          />
        </div>

        <button v-if="filters.location || filters.skill || filters.openTo.length" @click="clearFilters" class="px-6 py-3 bg-transparent border border-border rounded-lg text-text-muted text-sm cursor-pointer transition-all hover:border-text hover:text-text">
          Effacer
        </button>
      </div>

      <div class="flex flex-col md:flex-row items-start md:items-center gap-6">
        <span class="text-xs uppercase tracking-widest text-text-muted">Disponible pour</span>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="option in openToOptions"
            :key="option.value"
            :class="[
              'px-4 py-2 border rounded-full text-sm cursor-pointer transition-all',
              filters.openTo.includes(option.value)
                ? 'bg-text border-text text-bg'
                : 'bg-transparent border-border text-text-muted hover:border-text hover:text-text'
            ]"
            @click="toggleOpenTo(option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
    </section>

    <section class="py-12">
      <div v-if="!developers?.length" class="text-center py-16 text-text-muted">
        <p class="mb-4">Aucun profil trouvé</p>
        <button @click="clearFilters" class="px-6 py-3 bg-transparent border border-border rounded-lg text-text cursor-pointer">Effacer les filtres</button>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <NuxtLink
          v-for="dev in developers"
          :key="dev.id"
          :to="`/profil/${dev.id}`"
          class="flex flex-col gap-4 p-6 bg-bg-card border border-border rounded-2xl no-underline text-text transition-all hover:bg-bg-card-hover hover:border-text-muted hover:-translate-y-0.5"
        >
          <div class="flex items-center gap-4">
            <img
              :src="dev.avatarUrl || '/default-avatar.png'"
              :alt="`Photo de profil de ${dev.name}, développeuse${dev.location ? ` basée à ${dev.location}` : ''}`"
              class="w-12 h-12 rounded-full object-cover"
            />
            <div class="flex-1">
              <h3 class="font-display text-lg font-medium">{{ dev.name }}</h3>
              <p v-if="dev.location" class="text-sm text-text-muted">{{ dev.location }}</p>
            </div>
            <span v-if="dev.isSpeaker" class="px-3 py-1 bg-bg-card border border-border rounded-full text-[0.7rem] uppercase tracking-widest text-text-muted">Speakeuse</span>
          </div>

          <p v-if="dev.bio" class="text-sm text-text-muted leading-relaxed line-clamp-2">{{ dev.bio }}</p>

          <div v-if="dev.skills?.length" class="flex flex-wrap gap-2">
            <span v-for="skill in dev.skills.slice(0, 5)" :key="skill" class="px-3 py-1 bg-bg-card border border-border rounded-full text-xs text-text-muted">
              {{ skill }}
            </span>
            <span v-if="dev.skills.length > 5" class="px-2 py-1 text-xs text-text-muted">
              +{{ dev.skills.length - 5 }}
            </span>
          </div>

          <div v-if="dev.openTo?.length" class="flex flex-wrap gap-2 pt-2 border-t border-border">
            <span v-for="(tag, index) in dev.openTo" :key="tag" class="text-[0.7rem] text-text-muted">
              {{ openToOptions.find(o => o.value === tag)?.label || tag }}{{ index < dev.openTo.length - 1 ? ' ·' : '' }}
            </span>
          </div>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
