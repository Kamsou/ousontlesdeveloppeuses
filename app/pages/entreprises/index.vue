<script setup lang="ts">
// SEO centralisé
const { canonicalUrl, siteUrl } = usePageSEO({
  title: 'Entreprises Inclusives - OSLD',
  description: 'Découvrez les entreprises tech certifiées inclusives en France. Avis et notes par la communauté des développeuses.',
  path: '/entreprises'
})

// Structured Data type-safe
const schema = useSchemaOrgSEO()
schema.setCollectionPage(
  'Entreprises Inclusives',
  'Découvrez les entreprises tech certifiées inclusives en France. Avis et notes par la communauté des développeuses.',
  canonicalUrl
)
schema.setBreadcrumb([
  { name: 'Accueil', url: siteUrl },
  { name: 'Entreprises', url: canonicalUrl }
])

const route = useRoute()
const router = useRouter()
const { status } = useAuth()

const filters = reactive({
  location: route.query.location as string || '',
  verified: route.query.verified === 'true'
})

const queryParams = computed(() => {
  const params: Record<string, string> = {}
  if (filters.location) params.location = filters.location
  if (filters.verified) params.verified = 'true'
  return params
})

const { data: companies, refresh } = await useFetch('/api/companies', {
  query: queryParams
})

function updateUrl() {
  router.push({ query: queryParams.value })
}

function clearFilters() {
  filters.location = ''
  filters.verified = false
  router.push({ query: {} })
}

watch(() => filters.location, () => updateUrl())
watch(() => filters.verified, () => updateUrl())

const showAddModal = ref(false)
const showReviewModal = ref(false)
const selectedCompany = ref<any>(null)

const newCompany = reactive({
  name: '',
  website: '',
  location: '',
  description: ''
})

const newReview = reactive({
  rating: 5,
  isInclusive: true,
  comment: ''
})

async function addCompany() {
  if (!newCompany.name) return

  await $fetch('/api/companies', {
    method: 'POST',
    body: newCompany
  })

  showAddModal.value = false
  newCompany.name = ''
  newCompany.website = ''
  newCompany.location = ''
  newCompany.description = ''
  refresh()
}

async function submitReview() {
  if (!selectedCompany.value) return

  try {
    await $fetch(`/api/companies/${selectedCompany.value.id}/reviews`, {
      method: 'POST',
      body: newReview
    })

    showReviewModal.value = false
    selectedCompany.value = null
    newReview.rating = 5
    newReview.isInclusive = true
    newReview.comment = ''
    refresh()
  } catch (error: any) {
    alert(error.data?.message || 'Erreur')
  }
}

function openReviewModal(company: any) {
  selectedCompany.value = company
  showReviewModal.value = true
}
</script>

<template>
  <div class="entreprises-page">
    <header class="page-header">
      <NuxtLink to="/" class="back-link">
        ← Accueil
      </NuxtLink>
      <div class="page-header-row">
        <div class="page-header-content">
          <span class="page-label">
            <span class="label-line"></span>
            Certifiee Inclusive
          </span>
          <h1 class="page-title">Entreprises</h1>
          <p class="page-subtitle">
            {{ companies?.length || 0 }} entreprises référencées
          </p>
        </div>

        <button v-if="status === 'authenticated'" @click="showAddModal = true" class="btn-add">
          Ajouter une entreprise
        </button>
      </div>
    </header>

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

        <label class="checkbox-label">
          <input type="checkbox" v-model="filters.verified" class="checkbox" />
          <span class="checkbox-text">Certifiées Inclusives uniquement</span>
        </label>

        <button v-if="filters.location || filters.verified" @click="clearFilters" class="btn-clear">
          Effacer
        </button>
      </div>
    </section>

    <section class="badge-info">
      <div class="badge-card">
        <span class="badge-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </span>
        <div class="badge-text">
          <strong>Certifiée Inclusive</strong>
          <span>5+ avis positifs avec une moyenne de 4/5 minimum</span>
        </div>
      </div>
    </section>

    <section class="results">
      <div v-if="!companies?.length" class="empty-state">
        <p>Aucune entreprise trouvée</p>
        <button @click="clearFilters" class="btn-secondary">Effacer les filtres</button>
      </div>

      <div v-else class="companies-grid">
        <div v-for="company in companies" :key="company.id" class="company-card">
          <div class="card-header">
            <div v-if="company.logoUrl" class="company-logo">
              <img :src="company.logoUrl" :alt="`Logo de ${company.name}${company.location ? `, entreprise basée à ${company.location}` : ''}`" loading="lazy" />
            </div>
            <div v-else class="company-logo placeholder">
              {{ company.name.charAt(0) }}
            </div>
            <div class="card-info">
              <h3 class="card-name">
                {{ company.name }}
                <span v-if="company.isVerifiedInclusive" class="verified-badge">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  Certifiée
                </span>
              </h3>
              <p v-if="company.location" class="card-location">{{ company.location }}</p>
            </div>
          </div>

          <p v-if="company.description" class="card-description">{{ company.description }}</p>

          <div class="card-stats">
            <div class="stat">
              <span class="stat-value">{{ company.avgRating || '-' }}</span>
              <span class="stat-label">/ 5</span>
            </div>
            <div class="stat">
              <span class="stat-value">{{ company.reviewCount }}</span>
              <span class="stat-label">avis</span>
            </div>
            <div class="stat">
              <span class="stat-value">{{ company.inclusiveCount }}</span>
              <span class="stat-label">inclusif</span>
            </div>
          </div>

          <div class="card-actions">
            <a v-if="company.website" :href="company.website" target="_blank" class="btn-link">
              Site web
            </a>
            <button v-if="status === 'authenticated'" @click="openReviewModal(company)" class="btn-review">
              Donner un avis
            </button>
          </div>
        </div>
      </div>
    </section>

    <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
      <div class="modal">
        <h2 class="modal-title">Ajouter une entreprise</h2>

        <div class="form-group">
          <label class="form-label">Nom *</label>
          <input v-model="newCompany.name" type="text" class="form-input" placeholder="Nom de l'entreprise" />
        </div>

        <div class="form-group">
          <label class="form-label">Site web</label>
          <input v-model="newCompany.website" type="url" class="form-input" placeholder="https://..." />
        </div>

        <div class="form-group">
          <label class="form-label">Ville</label>
          <input v-model="newCompany.location" type="text" class="form-input" placeholder="Paris" />
        </div>

        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea v-model="newCompany.description" class="form-textarea" placeholder="Description de l'entreprise"></textarea>
        </div>

        <div class="modal-actions">
          <button @click="showAddModal = false" class="btn-cancel">Annuler</button>
          <button @click="addCompany" class="btn-submit" :disabled="!newCompany.name">Ajouter</button>
        </div>
      </div>
    </div>

    <div v-if="showReviewModal" class="modal-overlay" @click.self="showReviewModal = false">
      <div class="modal">
        <h2 class="modal-title">Avis sur {{ selectedCompany?.name }}</h2>

        <div class="form-group">
          <label class="form-label">Note</label>
          <div class="rating-input">
            <button
              v-for="i in 5"
              :key="i"
              @click="newReview.rating = i"
              :class="['rating-star', { active: i <= newReview.rating }]"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" :fill="i <= newReview.rating ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Entreprise inclusive ?</label>
          <div class="toggle-group">
            <button
              @click="newReview.isInclusive = true"
              :class="['toggle-btn', { active: newReview.isInclusive }]"
            >
              Oui
            </button>
            <button
              @click="newReview.isInclusive = false"
              :class="['toggle-btn', { active: !newReview.isInclusive }]"
            >
              Non
            </button>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Commentaire (optionnel)</label>
          <textarea v-model="newReview.comment" class="form-textarea" placeholder="Votre expérience..."></textarea>
        </div>

        <div class="modal-actions">
          <button @click="showReviewModal = false" class="btn-cancel">Annuler</button>
          <button @click="submitReview" class="btn-submit">Envoyer</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.entreprises-page {
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

.page-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
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

.btn-add {
  padding: 0.75rem 1.5rem;
  background: var(--text);
  color: var(--bg);
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.2s;
}

.btn-add:hover {
  opacity: 0.8;
}

/* Filters */
.filters {
  padding: 2rem 0;
  border-bottom: 1px solid var(--border);
}

.filters-row {
  display: flex;
  gap: 1.5rem;
  align-items: center;
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

/* Badge info */
.badge-info {
  padding: 2rem 0;
  border-bottom: 1px solid var(--border);
}

.badge-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  max-width: 500px;
}

.badge-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--text);
  color: var(--bg);
  border-radius: 50%;
}

.badge-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.badge-text strong {
  font-size: 0.9rem;
}

.badge-text span {
  font-size: 0.8rem;
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

.companies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.company-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.company-logo {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  background: var(--bg-card-hover);
}

.company-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.company-logo.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-muted);
}

.card-info {
  flex: 1;
}

.card-name {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.125rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.verified-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: var(--text);
  color: var(--bg);
  border-radius: 100px;
  font-size: 0.65rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.card-location {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
}

.card-description {
  font-size: 0.9rem;
  color: var(--text-muted);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-stats {
  display: flex;
  gap: 2rem;
  padding: 1rem 0;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}

.stat {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
}

.stat-value {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.5rem;
  font-weight: 500;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.card-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-link,
.btn-review {
  flex: 1;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  text-decoration: none;
}

.btn-link {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text);
}

.btn-link:hover {
  border-color: var(--text);
}

.btn-review {
  background: var(--text);
  border: none;
  color: var(--bg);
}

.btn-review:hover {
  opacity: 0.8;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.modal {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 2rem;
  width: 100%;
  max-width: 500px;
}

.modal-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.5rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  font-size: 0.9rem;
  font-family: inherit;
}

.form-textarea {
  min-height: 100px;
  resize: vertical;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--text-muted);
}

.rating-input {
  display: flex;
  gap: 0.5rem;
}

.rating-star {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;
}

.rating-star.active {
  color: var(--text);
}

.toggle-group {
  display: flex;
  gap: 0.5rem;
}

.toggle-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-muted);
  font-size: 0.9rem;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-btn.active {
  background: var(--text);
  border-color: var(--text);
  color: var(--bg);
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-cancel,
.btn-submit {
  flex: 1;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text);
}

.btn-cancel:hover {
  border-color: var(--text);
}

.btn-submit {
  background: var(--text);
  border: none;
  color: var(--bg);
}

.btn-submit:hover {
  opacity: 0.8;
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .entreprises-page {
    padding: 0 1rem;
    overflow-x: hidden;
  }

  .page-header {
    padding: 2rem 0;
  }

  .page-header-row {
    flex-direction: column;
    gap: 1.5rem;
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

  .companies-grid {
    grid-template-columns: 1fr;
  }
}
</style>
