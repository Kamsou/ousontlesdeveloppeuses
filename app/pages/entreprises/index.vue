<script setup lang="ts">
useSeoMeta({
  title: 'Entreprises Inclusives - OSLD',
  ogTitle: 'Entreprises Inclusives - OSLD',
  description: 'Découvrez les entreprises tech certifiées inclusives en France. Avis et notes par la communauté des développeuses.',
  ogDescription: 'Découvrez les entreprises tech certifiées inclusives en France. Avis et notes par la communauté des développeuses.',
  ogImage: '/og-image.png',
  twitterCard: 'summary_large_image'
})

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
  <div class="max-w-7xl mx-auto px-4 md:px-16">
    <header class="py-16 border-b border-border">
      <div class="flex flex-col md:flex-row justify-between items-start gap-6">
        <div>
          <span class="text-xs uppercase tracking-[0.2em] text-text-muted mb-6 block">Entreprises</span>
          <h1 class="font-display text-4xl md:text-7xl font-medium tracking-tight mb-2">Entreprises</h1>
          <p class="text-text-muted text-base">
            {{ companies?.length || 0 }} entreprises référencées
          </p>
        </div>

        <button v-if="status === 'authenticated'" @click="showAddModal = true" class="px-6 py-3 bg-text text-bg border-none rounded-lg text-sm font-medium cursor-pointer transition-opacity hover:opacity-80">
          Ajouter une entreprise
        </button>
      </div>
    </header>

    <section class="py-8 border-b border-border">
      <div class="flex flex-col md:flex-row gap-6 items-stretch md:items-end">
        <div class="flex-1 max-w-none md:max-w-[250px]">
          <label class="block text-xs uppercase tracking-widest text-text-muted mb-2">Ville</label>
          <input
            v-model="filters.location"
            type="text"
            placeholder="Paris, Lyon..."
            class="w-full px-4 py-3 bg-bg-card border border-border rounded-lg text-text text-sm transition-colors focus:outline-none focus:border-text-muted placeholder:text-text-muted"
          />
        </div>

        <label class="flex items-center gap-3 cursor-pointer h-[46px]">
          <input type="checkbox" v-model="filters.verified" class="w-[18px] h-[18px] accent-text" />
          <span class="text-sm text-text-muted">Certifiées Inclusives uniquement</span>
        </label>

        <button v-if="filters.location || filters.verified" @click="clearFilters" class="px-6 py-3 bg-transparent border border-border rounded-lg text-text-muted text-sm cursor-pointer transition-all hover:border-text hover:text-text">
          Effacer
        </button>
      </div>
    </section>

    <section class="py-8 border-b border-border">
      <div class="flex items-center gap-4 px-6 py-4 bg-bg-card border border-border rounded-xl max-w-lg">
        <span class="flex items-center justify-center w-10 h-10 bg-text text-bg rounded-full">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </span>
        <div class="flex flex-col gap-1">
          <strong class="text-sm">Certifiée Inclusive</strong>
          <span class="text-sm text-text-muted">5+ avis positifs avec une moyenne de 4/5 minimum</span>
        </div>
      </div>
    </section>

    <section class="py-12">
      <div v-if="!companies?.length" class="text-center py-16 text-text-muted">
        <p class="mb-4">Aucune entreprise trouvée</p>
        <button @click="clearFilters" class="px-6 py-3 bg-transparent border border-border rounded-lg text-text cursor-pointer">Effacer les filtres</button>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="company in companies" :key="company.id" class="flex flex-col gap-4 p-6 bg-bg-card border border-border rounded-2xl">
          <div class="flex items-center gap-4">
            <div v-if="company.logoUrl" class="w-12 h-12 rounded-lg overflow-hidden bg-bg-card-hover">
              <img :src="company.logoUrl" :alt="company.name" class="w-full h-full object-cover" />
            </div>
            <div v-else class="w-12 h-12 rounded-lg bg-bg-card-hover flex items-center justify-center text-xl font-semibold text-text-muted">
              {{ company.name.charAt(0) }}
            </div>
            <div class="flex-1">
              <h3 class="font-display text-lg font-medium flex items-center gap-3">
                {{ company.name }}
                <span v-if="company.isVerifiedInclusive" class="inline-flex items-center gap-1 px-2 py-1 bg-text text-bg rounded-full text-[0.65rem] font-medium uppercase tracking-wide">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  Certifiée
                </span>
              </h3>
              <p v-if="company.location" class="text-sm text-text-muted mt-1">{{ company.location }}</p>
            </div>
          </div>

          <p v-if="company.description" class="text-sm text-text-muted leading-relaxed line-clamp-2">{{ company.description }}</p>

          <div class="flex gap-8 py-4 border-y border-border">
            <div class="flex items-baseline gap-1">
              <span class="font-display text-2xl font-medium">{{ company.avgRating || '-' }}</span>
              <span class="text-sm text-text-muted">/ 5</span>
            </div>
            <div class="flex items-baseline gap-1">
              <span class="font-display text-2xl font-medium">{{ company.reviewCount }}</span>
              <span class="text-sm text-text-muted">avis</span>
            </div>
            <div class="flex items-baseline gap-1">
              <span class="font-display text-2xl font-medium">{{ company.inclusiveCount }}</span>
              <span class="text-sm text-text-muted">inclusif</span>
            </div>
          </div>

          <div class="flex gap-3">
            <a v-if="company.website" :href="company.website" target="_blank" class="flex-1 py-3 px-4 bg-transparent border border-border rounded-lg text-sm text-text text-center no-underline transition-colors hover:border-text">
              Site web
            </a>
            <button v-if="status === 'authenticated'" @click="openReviewModal(company)" class="flex-1 py-3 px-4 bg-text text-bg border-none rounded-lg text-sm cursor-pointer transition-opacity hover:opacity-80">
              Donner un avis
            </button>
          </div>
        </div>
      </div>
    </section>

    <div v-if="showAddModal" class="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000] p-8" @click.self="showAddModal = false">
      <div class="bg-bg border border-border rounded-2xl p-8 w-full max-w-lg">
        <h2 class="font-display text-2xl font-medium mb-6">Ajouter une entreprise</h2>

        <div class="mb-6">
          <label class="block text-xs uppercase tracking-widest text-text-muted mb-2">Nom *</label>
          <input v-model="newCompany.name" type="text" class="w-full px-4 py-3 bg-bg-card border border-border rounded-lg text-text text-sm focus:outline-none focus:border-text-muted" placeholder="Nom de l'entreprise" />
        </div>

        <div class="mb-6">
          <label class="block text-xs uppercase tracking-widest text-text-muted mb-2">Site web</label>
          <input v-model="newCompany.website" type="url" class="w-full px-4 py-3 bg-bg-card border border-border rounded-lg text-text text-sm focus:outline-none focus:border-text-muted" placeholder="https://..." />
        </div>

        <div class="mb-6">
          <label class="block text-xs uppercase tracking-widest text-text-muted mb-2">Ville</label>
          <input v-model="newCompany.location" type="text" class="w-full px-4 py-3 bg-bg-card border border-border rounded-lg text-text text-sm focus:outline-none focus:border-text-muted" placeholder="Paris" />
        </div>

        <div class="mb-6">
          <label class="block text-xs uppercase tracking-widest text-text-muted mb-2">Description</label>
          <textarea v-model="newCompany.description" class="w-full px-4 py-3 bg-bg-card border border-border rounded-lg text-text text-sm focus:outline-none focus:border-text-muted min-h-[100px] resize-y" placeholder="Description de l'entreprise"></textarea>
        </div>

        <div class="flex gap-4 mt-8">
          <button @click="showAddModal = false" class="flex-1 py-3 px-6 bg-transparent border border-border rounded-lg text-text cursor-pointer transition-colors hover:border-text">Annuler</button>
          <button @click="addCompany" class="flex-1 py-3 px-6 bg-text text-bg border-none rounded-lg cursor-pointer transition-opacity hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed" :disabled="!newCompany.name">Ajouter</button>
        </div>
      </div>
    </div>

    <div v-if="showReviewModal" class="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000] p-8" @click.self="showReviewModal = false">
      <div class="bg-bg border border-border rounded-2xl p-8 w-full max-w-lg">
        <h2 class="font-display text-2xl font-medium mb-6">Avis sur {{ selectedCompany?.name }}</h2>

        <div class="mb-6">
          <label class="block text-xs uppercase tracking-widest text-text-muted mb-2">Note</label>
          <div class="flex gap-2">
            <button
              v-for="i in 5"
              :key="i"
              @click="newReview.rating = i"
              :class="['bg-transparent border-none p-0 cursor-pointer transition-colors', i <= newReview.rating ? 'text-text' : 'text-text-muted']"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" :fill="i <= newReview.rating ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="mb-6">
          <label class="block text-xs uppercase tracking-widest text-text-muted mb-2">Entreprise inclusive ?</label>
          <div class="flex gap-2">
            <button
              @click="newReview.isInclusive = true"
              :class="['flex-1 py-3 px-4 rounded-lg text-sm cursor-pointer transition-all', newReview.isInclusive ? 'bg-text text-bg border-text' : 'bg-bg-card text-text-muted border border-border']"
            >
              Oui
            </button>
            <button
              @click="newReview.isInclusive = false"
              :class="['flex-1 py-3 px-4 rounded-lg text-sm cursor-pointer transition-all', !newReview.isInclusive ? 'bg-text text-bg border-text' : 'bg-bg-card text-text-muted border border-border']"
            >
              Non
            </button>
          </div>
        </div>

        <div class="mb-6">
          <label class="block text-xs uppercase tracking-widest text-text-muted mb-2">Commentaire (optionnel)</label>
          <textarea v-model="newReview.comment" class="w-full px-4 py-3 bg-bg-card border border-border rounded-lg text-text text-sm focus:outline-none focus:border-text-muted min-h-[100px] resize-y" placeholder="Votre expérience..."></textarea>
        </div>

        <div class="flex gap-4 mt-8">
          <button @click="showReviewModal = false" class="flex-1 py-3 px-6 bg-transparent border border-border rounded-lg text-text cursor-pointer transition-colors hover:border-text">Annuler</button>
          <button @click="submitReview" class="flex-1 py-3 px-6 bg-text text-bg border-none rounded-lg cursor-pointer transition-opacity hover:opacity-80">Envoyer</button>
        </div>
      </div>
    </div>
  </div>
</template>
