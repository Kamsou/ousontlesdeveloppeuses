<script setup lang="ts">
const route = useRoute()
const config = useRuntimeConfig()
const siteUrl = config.public.siteUrl || 'https://ousontlesdeveloppeuses.fr'
const canonicalUrl = `${siteUrl}/speakers`

useSeoMeta({
  title: 'Speakers Bureau - OSLD',
  ogTitle: 'Speakers Bureau - OSLD',
  description: 'Trouvez des intervenantes tech pour vos conférences et événements. Speakers disponibles en remote ou en présentiel.',
  ogDescription: 'Trouvez des intervenantes tech pour vos conférences et événements. Speakers disponibles en remote ou en présentiel.',
  ogImage: `${siteUrl}/og-image.png`,
  ogUrl: canonicalUrl,
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterImage: `${siteUrl}/og-image.png`
})

useHead({
  link: [
    { rel: 'canonical', href: canonicalUrl }
  ]
})

// Structured Data
const { collectionPageSchema, breadcrumbSchema } = useStructuredData()

useHead({
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify(collectionPageSchema(
        'Speakers Bureau',
        'Trouvez des intervenantes tech pour vos conférences et événements. Speakers disponibles en remote ou en présentiel.',
        canonicalUrl
      ))
    },
    {
      type: 'application/ld+json',
      children: JSON.stringify(breadcrumbSchema([
        { name: 'Accueil', url: siteUrl },
        { name: 'Speakers', url: canonicalUrl }
      ]))
    }
  ]
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

const { data: speakers } = await useFetch<Speaker[]>('/api/speakers', {
  query: queryParams
})

function updateUrl() {
  router.push({ query: queryParams.value })
}

function clearFilters() {
  filters.location = ''
  filters.topic = ''
  filters.remote = false
  filters.travel = false
  router.push({ query: {} })
}

watch(() => filters.location, () => updateUrl())
watch(() => filters.topic, () => updateUrl())
watch(() => filters.remote, () => updateUrl())
watch(() => filters.travel, () => updateUrl())
</script>

<template>
  <div class="speakers-page">
    <header class="page-header">
      <NuxtLink to="/" class="back-link">
        ← Accueil
      </NuxtLink>
      <div class="page-header-content">
        <span class="page-label">
          <span class="label-line"></span>
          Speakers Bureau
        </span>
        <h1 class="page-title">Intervenantes</h1>
        <p class="page-subtitle">
          {{ speakers?.length || 0 }} speakers disponibles pour vos conférences
        </p>
      </div>
    </header>

    <!-- Filters -->
    <section class="filters">
      <div class="filters-row">
        <div class="filter-group">
          <label class="filter-label">Ville</label>
          <input
            v-model="filters.location"
            type="text"
            placeholder="Paris, Lyon..."
            class="filter-input"
          />
        </div>

        <div class="filter-group">
          <label class="filter-label">Sujet</label>
          <input
            v-model="filters.topic"
            type="text"
            placeholder="React, Leadership..."
            class="filter-input"
          />
        </div>

        <button v-if="filters.location || filters.topic || filters.remote || filters.travel" @click="clearFilters" class="btn-clear">
          Effacer
        </button>
      </div>

      <div class="options-row">
        <label class="checkbox-label">
          <input type="checkbox" v-model="filters.remote" class="checkbox" />
          <span class="checkbox-text">Remote OK</span>
        </label>

        <label class="checkbox-label">
          <input type="checkbox" v-model="filters.travel" class="checkbox" />
          <span class="checkbox-text">Se déplace</span>
        </label>
      </div>
    </section>

    <!-- Results -->
    <section class="results">
      <div v-if="!speakers?.length" class="empty-state">
        <p>Aucune speaker trouvée</p>
        <button @click="clearFilters" class="btn-secondary">Effacer les filtres</button>
      </div>

      <div v-else class="speakers-grid">
        <NuxtLink
          v-for="speaker in speakers"
          :key="speaker.id"
          :to="`/profil/${speaker.id}`"
          class="speaker-card"
        >
          <div class="card-header">
            <img
              :src="speaker.avatarUrl || '/default-avatar.png'"
              :alt="`Photo de profil de ${speaker.name}, speaker tech${speaker.location ? ` basée à ${speaker.location}` : ''}`"
              class="avatar"
              loading="lazy"
            />
            <div class="card-info">
              <h3 class="card-name">{{ speaker.name }}</h3>
              <p v-if="speaker.location" class="card-location">{{ speaker.location }}</p>
            </div>
          </div>

          <p v-if="speaker.bio" class="card-bio">{{ speaker.bio }}</p>

          <div v-if="speaker.speakerProfile?.topics?.length" class="card-topics">
            <span class="topics-label">Sujets</span>
            <div class="topics-list">
              <span v-for="topic in speaker.speakerProfile.topics" :key="topic" class="topic-tag">
                {{ topic }}
              </span>
            </div>
          </div>

          <div class="card-options">
            <span v-if="speaker.speakerProfile?.remoteOk" class="option-tag">Remote OK</span>
            <span v-if="speaker.speakerProfile?.travelWilling" class="option-tag">Se déplace</span>
          </div>

          <div v-if="speaker.skills?.length" class="card-skills">
            <span v-for="skill in speaker.skills.slice(0, 4)" :key="skill" class="skill-pill">
              {{ skill }}
            </span>
            <span v-if="speaker.skills.length > 4" class="skill-more">
              +{{ speaker.skills.length - 4 }}
            </span>
          </div>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.speakers-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 4rem;
}

.page-header {
  padding: 4rem 0;
  border-bottom: 1px solid var(--border);
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-muted);
  text-decoration: none;
  margin-bottom: 1.5rem;
  transition: color 0.2s;
}

.back-link:hover {
  color: var(--text);
}

.page-label {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--text-muted);
  margin-bottom: 1.5rem;
}

.label-line {
  width: 40px;
  height: 1px;
  background: var(--text-muted);
}

.page-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 4rem;
  font-weight: 500;
  letter-spacing: -0.03em;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  color: var(--text-muted);
  font-size: 1rem;
}

/* Filters */
.filters {
  padding: 2rem 0;
  border-bottom: 1px solid var(--border);
}

.filters-row {
  display: flex;
  gap: 1.5rem;
  align-items: flex-end;
  margin-bottom: 1.5rem;
}

.filter-group {
  flex: 1;
  max-width: 250px;
}

.filter-label {
  display: block;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.filter-input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  font-size: 0.9rem;
  font-family: inherit;
  transition: border-color 0.2s;
}

.filter-input:focus {
  outline: none;
  border-color: var(--text-muted);
}

.filter-input::placeholder {
  color: var(--text-muted);
}

.btn-clear {
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-muted);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.btn-clear:hover {
  border-color: var(--text);
  color: var(--text);
}

.options-row {
  display: flex;
  gap: 2rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.checkbox {
  width: 18px;
  height: 18px;
  accent-color: var(--text);
}

.checkbox-text {
  font-size: 0.9rem;
  color: var(--text-muted);
}

/* Results */
.results {
  padding: 3rem 0;
}

.empty-state {
  text-align: center;
  padding: 4rem 0;
  color: var(--text-muted);
}

.empty-state p {
  margin-bottom: 1rem;
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  cursor: pointer;
  font-family: inherit;
}

.speakers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

.speaker-card {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 2rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  text-decoration: none;
  color: var(--text);
  transition: all 0.3s ease;
}

.speaker-card:hover {
  background: var(--bg-card-hover);
  border-color: var(--text-muted);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
}

.card-info {
  flex: 1;
}

.card-name {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.25rem;
  font-weight: 500;
}

.card-location {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
}

.card-bio {
  font-size: 0.9rem;
  color: var(--text-muted);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-topics {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.topics-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-muted);
}

.topics-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.topic-tag {
  padding: 0.5rem 1rem;
  background: var(--text);
  color: var(--bg);
  border-radius: 100px;
  font-size: 0.8rem;
  font-weight: 500;
}

.card-options {
  display: flex;
  gap: 0.75rem;
}

.option-tag {
  padding: 0.375rem 0.875rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 100px;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.card-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border);
}

.skill-pill {
  padding: 0.25rem 0.75rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 100px;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.skill-more {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* Responsive */
@media (max-width: 768px) {
  .speakers-page {
    padding: 0 1rem;
    overflow-x: hidden;
  }

  .page-header {
    padding: 2rem 0;
  }

  .page-label {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .page-title {
    font-size: 2rem;
    word-break: break-word;
  }

  .filters-row {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group {
    max-width: none;
  }

  .speakers-grid {
    grid-template-columns: 1fr;
  }
}
</style>
