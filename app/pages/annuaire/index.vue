<script setup lang="ts">
const route = useRoute()
const config = useRuntimeConfig()
const siteUrl = config.public.siteUrl || 'https://ousontlesdeveloppeuses.fr'
const canonicalUrl = `${siteUrl}/annuaire`

useSeoMeta({
  title: 'Annuaire des Développeuses - OSLD',
  ogTitle: 'Annuaire des Développeuses - OSLD',
  description: 'Explorez les profils de développeuses en France. Filtrez par ville, technologie et disponibilité.',
  ogDescription: 'Explorez les profils de développeuses en France. Filtrez par ville, technologie et disponibilité.',
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
        'Annuaire des Développeuses',
        'Explorez les profils de développeuses en France. Filtrez par ville, technologie et disponibilité.',
        canonicalUrl
      ))
    },
    {
      type: 'application/ld+json',
      children: JSON.stringify(breadcrumbSchema([
        { name: 'Accueil', url: siteUrl },
        { name: 'Annuaire', url: canonicalUrl }
      ]))
    }
  ]
})

const route = useRoute()
const router = useRouter()

const openToOptions = [
  { value: 'conference', label: 'Conference' },
  { value: 'mentoring', label: 'Mentoring' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'cdi', label: 'CDI' },
  { value: 'coffee_chat', label: 'Coffee chat' },
  { value: 'pair_programming', label: 'Pair programming' },
  { value: 'cv_review', label: 'Review CV' }
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
  query: queryParams
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
}

function clearFilters() {
  filters.location = ''
  filters.skill = ''
  filters.openTo = []
  router.push({ query: {} })
}

watch(() => filters.location, () => updateUrl())
watch(() => filters.skill, () => updateUrl())
</script>

<template>
  <div class="annuaire">
    <header class="page-header">
      <NuxtLink to="/" class="back-link">
        ← Accueil
      </NuxtLink>
      <div class="page-header-content">
        <span class="page-label">
          <span class="label-line"></span>
          Annuaire
        </span>
        <h1 class="page-title">Développeuses</h1>
        <p class="page-subtitle">
          {{ developers?.length || 0 }} profils
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
          <label class="filter-label">Technologie</label>
          <input
            v-model="filters.skill"
            type="text"
            placeholder="React, Python..."
            class="filter-input"
          />
        </div>

        <button v-if="filters.location || filters.skill || filters.openTo.length" @click="clearFilters" class="btn-clear">
          Effacer
        </button>
      </div>

      <div class="open-to-filters">
        <span class="filter-label">Open to</span>
        <div class="tags-row">
          <button
            v-for="option in openToOptions"
            :key="option.value"
            :class="['tag-btn', { active: filters.openTo.includes(option.value) }]"
            @click="toggleOpenTo(option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
    </section>

    <!-- Results -->
    <section class="results">
      <div v-if="!developers?.length" class="empty-state">
        <p>Aucun profil trouvé</p>
        <button @click="clearFilters" class="btn-secondary">Effacer les filtres</button>
      </div>

      <div v-else class="developers-grid">
        <NuxtLink
          v-for="dev in developers"
          :key="dev.id"
          :to="`/profil/${dev.id}`"
          class="developer-card"
        >
          <div class="card-header">
            <img
              :src="dev.avatarUrl || '/default-avatar.png'"
              :alt="`Photo de profil de ${dev.name}, développeuse${dev.location ? ` basée à ${dev.location}` : ''}`"
              class="avatar"
              loading="lazy"
            />
            <div class="card-info">
              <h3 class="card-name">{{ dev.name }}</h3>
              <p v-if="dev.location" class="card-location">{{ dev.location }}</p>
            </div>
            <span v-if="dev.isSpeaker" class="speaker-badge">Speaker</span>
          </div>

          <p v-if="dev.bio" class="card-bio">{{ dev.bio }}</p>

          <div v-if="dev.skills?.length" class="card-skills">
            <span v-for="skill in dev.skills.slice(0, 5)" :key="skill" class="skill-pill">
              {{ skill }}
            </span>
            <span v-if="dev.skills.length > 5" class="skill-more">
              +{{ dev.skills.length - 5 }}
            </span>
          </div>

          <div v-if="dev.openTo?.length" class="card-open-to">
            <span v-for="tag in dev.openTo" :key="tag" class="open-to-tag">
              {{ openToOptions.find(o => o.value === tag)?.label || tag }}
            </span>
          </div>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.annuaire {
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

.open-to-filters {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-btn {
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 100px;
  color: var(--text-muted);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.tag-btn:hover {
  border-color: var(--text);
  color: var(--text);
}

.tag-btn.active {
  background: var(--text);
  border-color: var(--text);
  color: var(--bg);
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

.developers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.developer-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  text-decoration: none;
  color: var(--text);
  transition: all 0.3s ease;
}

.developer-card:hover {
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
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.card-info {
  flex: 1;
}

.card-name {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.125rem;
  font-weight: 500;
}

.card-location {
  font-size: 0.875rem;
  color: var(--text-muted);
}

.speaker-badge {
  padding: 0.25rem 0.75rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 100px;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-muted);
}

.card-bio {
  font-size: 0.9rem;
  color: var(--text-muted);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
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

.card-open-to {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border);
}

.open-to-tag {
  font-size: 0.7rem;
  color: var(--text-muted);
}

.open-to-tag:not(:last-child)::after {
  content: '·';
  margin-left: 0.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .annuaire {
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

  .open-to-filters {
    flex-direction: column;
    align-items: flex-start;
  }

  .developers-grid {
    grid-template-columns: 1fr;
  }
}
</style>
