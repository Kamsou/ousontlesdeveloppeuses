<script setup lang="ts">
useSeoMeta({
  title: 'Entreprises Tech Inclusives',
  description: 'Trouvez des entreprises tech inclusives en France. Avis et notes par la communauté des développeuses. Parité, management, culture tech.',
  ogTitle: 'Entreprises Tech Inclusives',
  ogDescription: 'Les entreprises tech où il fait bon travailler. Avis et notes par la communauté des développeuses.',
  ogImage: 'https://ousontlesdeveloppeuses.fr/og-image.png',
  twitterCard: 'summary_large_image',
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

const { data: companies, status: fetchStatus, refresh } = useLazyFetch('/api/companies', {
  query: queryParams
})

const isLoading = computed(() => fetchStatus.value === 'pending')

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
    <header class="py-16 border-b border-border/10">
      <div class="flex flex-col md:flex-row justify-between items-start gap-6">
        <div>
          <div class="overflow-hidden">
            <span class="text-xs uppercase tracking-[0.2em] text-foreground/80 mb-6 block animate-slide-up">Entreprises</span>
          </div>
          <div class="overflow-hidden">
            <h1 class="font-display text-4xl md:text-7xl font-medium tracking-tight mb-2 animate-slide-up animation-delay-100">Entreprises</h1>
          </div>
          <div class="overflow-hidden">
            <p class="text-foreground-muted text-base animate-slide-up animation-delay-200">
              {{ companies?.length || 0 }} entreprises référencées
            </p>
          </div>
        </div>

        <ClientOnly>
          <button v-if="status === 'authenticated'" @click="showAddModal = true" class="px-6 py-3 bg-foreground border border-b-[3px] border-foreground border-b-foreground-muted/50 text-background rounded-lg text-sm font-medium cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-glow active:translate-y-px active:border-b active:shadow-none">
            Ajouter une entreprise
          </button>
        </ClientOnly>
      </div>
    </header>

    <section class="py-8 border-b border-border/10">
      <div class="flex flex-col md:flex-row gap-6 items-stretch md:items-end">
        <div class="flex-1 max-w-none md:max-w-[250px]">
          <label class="block text-xs uppercase tracking-widest text-foreground-muted mb-2">Ville</label>
          <input
            v-model="filters.location"
            type="text"
            placeholder="Paris, Lyon..."
            class="w-full px-4 py-3 bg-background-card border border-border/10 rounded-lg text-foreground text-sm transition-colors focus:outline-none focus:border-foreground-muted placeholder:text-foreground-muted"
          />
        </div>

        <label class="flex items-center gap-3 cursor-pointer h-[46px]">
          <input type="checkbox" v-model="filters.verified" class="w-[18px] h-[18px] accent-foreground" />
          <span class="text-sm text-foreground-muted">Certifiées Inclusives uniquement</span>
        </label>

        <button v-if="filters.location || filters.verified" @click="clearFilters" class="px-6 py-3 bg-transparent border border-border/10 rounded-lg text-foreground-muted text-sm cursor-pointer transition-all hover:border-foreground hover:text-foreground">
          Effacer
        </button>
      </div>
    </section>

    <section class="py-8 border-b border-border/10">
      <div class="flex items-center gap-4 px-6 py-4 bg-background-card border border-border/10 rounded-xl max-w-lg">
        <span class="flex items-center justify-center w-10 h-10 bg-foreground text-background rounded-full">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </span>
        <div class="flex flex-col gap-1">
          <strong class="text-sm">Certifiée Inclusive</strong>
          <span class="text-sm text-foreground-muted">5+ avis positifs avec une moyenne de 4/5 minimum</span>
        </div>
      </div>
    </section>

    <section class="py-12">
      <div v-if="!companies?.length" class="text-center py-16 text-foreground-muted">
        <p class="mb-4">Aucune entreprise trouvée</p>
        <button @click="clearFilters" class="px-6 py-3 bg-transparent border border-border/10 rounded-lg text-foreground cursor-pointer">Effacer les filtres</button>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="company in companies" :key="company.id" class="flex flex-col gap-4 p-6 bg-background-card border border-border/10 rounded-2xl">
          <div class="flex items-center gap-4">
            <div v-if="company.logoUrl" class="w-12 h-12 rounded-lg overflow-hidden bg-background-card-hover">
              <img :src="company.logoUrl" :alt="`Logo de ${company.name}${company.location ? `, ${company.location}` : ''}`" class="w-full h-full object-cover" />
            </div>
            <div v-else class="w-12 h-12 rounded-lg bg-background-card-hover flex items-center justify-center text-xl font-semibold text-foreground-muted">
              {{ company.name.charAt(0) }}
            </div>
            <div class="flex-1">
              <h2 class="font-display text-lg font-medium flex items-center gap-3">
                {{ company.name }}
                <span v-if="company.isVerifiedInclusive" class="inline-flex items-center gap-1 px-2 py-1 bg-foreground text-background rounded-full text-[0.65rem] font-medium uppercase tracking-wide">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  Certifiée
                </span>
              </h2>
              <p v-if="company.location" class="text-sm text-foreground-muted mt-1">{{ company.location }}</p>
            </div>
          </div>

          <p v-if="company.description" class="text-sm text-foreground-muted leading-relaxed line-clamp-2">{{ company.description }}</p>

          <div class="flex gap-8 py-4 border-y border-border/10">
            <div class="flex items-baseline gap-1">
              <span class="font-display text-2xl font-medium">{{ company.avgRating || '-' }}</span>
              <span class="text-sm text-foreground-muted">/ 5</span>
            </div>
            <div class="flex items-baseline gap-1">
              <span class="font-display text-2xl font-medium">{{ company.reviewCount }}</span>
              <span class="text-sm text-foreground-muted">avis</span>
            </div>
            <div class="flex items-baseline gap-1">
              <span class="font-display text-2xl font-medium">{{ company.inclusiveCount }}</span>
              <span class="text-sm text-foreground-muted">inclusif</span>
            </div>
          </div>

          <div class="flex gap-3">
            <a v-if="company.website" :href="company.website" target="_blank" class="flex-1 py-3 px-4 bg-transparent border border-b-[3px] border-border/10 border-b-border/30 rounded-lg text-sm text-foreground text-center no-underline transition-all hover:border-foreground hover:-translate-y-0.5 active:translate-y-px active:border-b">
              Site web
            </a>
            <ClientOnly>
              <button v-if="status === 'authenticated'" @click="openReviewModal(company)" class="flex-1 py-3 px-4 bg-foreground border border-b-[3px] border-foreground border-b-foreground-muted/50 text-background rounded-lg text-sm cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-glow active:translate-y-px active:border-b active:shadow-none">
                Donner un avis
              </button>
            </ClientOnly>
          </div>
        </div>
      </div>
    </section>

    <div v-if="showAddModal" class="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000] p-8" @click.self="showAddModal = false">
      <div class="bg-background border border-border/10 rounded-2xl p-8 w-full max-w-lg">
        <h2 class="font-display text-2xl font-medium mb-6">Ajouter une entreprise</h2>

        <div class="mb-6">
          <label class="block text-xs uppercase tracking-widest text-foreground-muted mb-2">Nom *</label>
          <input v-model="newCompany.name" type="text" class="w-full px-4 py-3 bg-background-card border border-border/10 rounded-lg text-foreground text-sm focus:outline-none focus:border-foreground-muted" placeholder="Nom de l'entreprise" />
        </div>

        <div class="mb-6">
          <label class="block text-xs uppercase tracking-widest text-foreground-muted mb-2">Site web</label>
          <input v-model="newCompany.website" type="url" class="w-full px-4 py-3 bg-background-card border border-border/10 rounded-lg text-foreground text-sm focus:outline-none focus:border-foreground-muted" placeholder="https://..." />
        </div>

        <div class="mb-6">
          <label class="block text-xs uppercase tracking-widest text-foreground-muted mb-2">Ville</label>
          <input v-model="newCompany.location" type="text" class="w-full px-4 py-3 bg-background-card border border-border/10 rounded-lg text-foreground text-sm focus:outline-none focus:border-foreground-muted" placeholder="Paris" />
        </div>

        <div class="mb-6">
          <label class="block text-xs uppercase tracking-widest text-foreground-muted mb-2">Description</label>
          <textarea v-model="newCompany.description" class="w-full px-4 py-3 bg-background-card border border-border/10 rounded-lg text-foreground text-sm focus:outline-none focus:border-foreground-muted min-h-[100px] resize-y" placeholder="Description de l'entreprise"></textarea>
        </div>

        <div class="flex gap-4 mt-8">
          <button @click="showAddModal = false" class="flex-1 py-3 px-6 bg-transparent border border-b-[3px] border-border/10 border-b-border/30 rounded-lg text-foreground cursor-pointer transition-all hover:border-foreground hover:-translate-y-0.5 active:translate-y-px active:border-b">Annuler</button>
          <button @click="addCompany" class="flex-1 py-3 px-6 bg-foreground border border-b-[3px] border-foreground border-b-foreground-muted/50 text-background rounded-lg cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-glow active:translate-y-px active:border-b active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed" :disabled="!newCompany.name">Ajouter</button>
        </div>
      </div>
    </div>

    <div v-if="showReviewModal" class="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000] p-8" @click.self="showReviewModal = false">
      <div class="bg-background border border-border/10 rounded-2xl p-8 w-full max-w-lg">
        <h2 class="font-display text-2xl font-medium mb-6">Avis sur {{ selectedCompany?.name }}</h2>

        <div class="mb-6">
          <label class="block text-xs uppercase tracking-widest text-foreground-muted mb-2">Note</label>
          <div class="flex gap-2">
            <button
              v-for="i in 5"
              :key="i"
              @click="newReview.rating = i"
              :class="['bg-transparent border-none p-0 cursor-pointer transition-colors', i <= newReview.rating ? 'text-foreground' : 'text-foreground-muted']"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" :fill="i <= newReview.rating ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="mb-6">
          <label class="block text-xs uppercase tracking-widest text-foreground-muted mb-2">Entreprise inclusive ?</label>
          <div class="flex gap-2">
            <button
              @click="newReview.isInclusive = true"
              :class="['flex-1 py-3 px-4 rounded-lg text-sm cursor-pointer transition-all', newReview.isInclusive ? 'bg-foreground text-background border-foreground' : 'bg-background-card text-foreground-muted border border-border/10']"
            >
              Oui
            </button>
            <button
              @click="newReview.isInclusive = false"
              :class="['flex-1 py-3 px-4 rounded-lg text-sm cursor-pointer transition-all', !newReview.isInclusive ? 'bg-foreground text-background border-foreground' : 'bg-background-card text-foreground-muted border border-border/10']"
            >
              Non
            </button>
          </div>
        </div>

        <div class="mb-6">
          <label class="block text-xs uppercase tracking-widest text-foreground-muted mb-2">Commentaire (optionnel)</label>
          <textarea v-model="newReview.comment" class="w-full px-4 py-3 bg-background-card border border-border/10 rounded-lg text-foreground text-sm focus:outline-none focus:border-foreground-muted min-h-[100px] resize-y" placeholder="Votre expérience..."></textarea>
        </div>

        <div class="flex gap-4 mt-8">
          <button @click="showReviewModal = false" class="flex-1 py-3 px-6 bg-transparent border border-b-[3px] border-border/10 border-b-border/30 rounded-lg text-foreground cursor-pointer transition-all hover:border-foreground hover:-translate-y-0.5 active:translate-y-px active:border-b">Annuler</button>
          <button @click="submitReview" class="flex-1 py-3 px-6 bg-foreground border border-b-[3px] border-foreground border-b-foreground-muted/50 text-background rounded-lg cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-glow active:translate-y-px active:border-b active:shadow-none">Envoyer</button>
        </div>
      </div>
    </div>
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
