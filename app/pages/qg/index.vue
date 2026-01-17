<script setup lang="ts">
interface Profile {
  id: number
  name: string
  email: string | null
  avatarUrl: string | null
  bio: string | null
  location: string | null
  yearsExperience: number | null
  website: string | null
  githubUrl: string | null
  linkedinUrl: string | null
  twitterUrl: string | null
  profileType: string | null
  profilePhrase: string | null
  skills: string[]
  openTo: string[]
  speakerProfile: {
    topics: string[]
    available: boolean | null
    remoteOk: boolean | null
    travelWilling: boolean | null
  } | null
  emailOptIn: boolean
  emailOptInAsked: boolean
}

definePageMeta({
  middleware: 'sidebase-auth'
})

useSeoMeta({
  title: 'Mon QG | OSLD',
  robots: 'noindex'
})

import { openToOptions } from '~/utils/constants'

const route = useRoute()
const router = useRouter()
const { $clientPosthog } = useNuxtApp()
const { data: session, signOut } = useAuth()

const firstName = computed(() => session.value?.user?.name?.split(' ')[0] || 'toi')

// Onglet actif (dashboard ou profil)
const activeTab = ref<'dashboard' | 'profil'>(
  route.query.tab === 'profil' ? 'profil' : 'dashboard'
)

watch(activeTab, (tab) => {
  router.replace({ query: tab === 'profil' ? { tab: 'profil' } : {} })
})

// Data pour le dashboard
const { data: requests, status: requestsStatus, refresh: refreshRequests } = useLazyFetch('/api/help-requests')
const isLoadingRequests = computed(() => requestsStatus.value === 'pending')

// Activité narrative
interface Activity {
  isNew: boolean
  weeklyContactsReceived?: number
  weeklyContactsSent?: number
  recentExchanges?: { type: 'sent' | 'received'; name: string; avatarUrl?: string; helpRequestTitle?: string }[]
  totalHelpGiven?: number
  profileComplete?: boolean
  memberSince?: string
}
const { data: activity, status: activityStatus } = useLazyFetch<Activity>('/api/qg/activity')
const isLoadingActivity = computed(() => activityStatus.value === 'pending')
const openRequests = computed(() =>
  requests.value?.filter((r: any) => r.status === 'open') || []
)
const closedRequests = computed(() =>
  requests.value?.filter((r: any) => r.status === 'closed') || []
)

const feedPage = ref(1)
const feedData = ref<{ requests: any[]; pagination: { hasMore: boolean; total: number } } | null>(null)
const isLoadingFeed = ref(false)
const isLoadingMore = ref(false)

async function loadFeed(page = 1) {
  if (page === 1) {
    isLoadingFeed.value = true
  } else {
    isLoadingMore.value = true
  }

  try {
    const data = await $fetch<{ requests: any[]; pagination: { hasMore: boolean; total: number } }>('/api/help-requests/feed', {
      query: { page }
    })

    if (page === 1) {
      feedData.value = data
    } else if (feedData.value) {
      feedData.value.requests.push(...data.requests)
      feedData.value.pagination = data.pagination
    }
    feedPage.value = page
  } catch {
  } finally {
    isLoadingFeed.value = false
    isLoadingMore.value = false
  }
}

function loadMoreFeed() {
  loadFeed(feedPage.value + 1)
}

onMounted(() => {
  loadFeed()
})

const closingRequestId = ref<number | null>(null)
const showClosedRequests = ref(false)

async function markAsResolved(requestId: number, e: Event) {
  e.preventDefault()
  e.stopPropagation()

  closingRequestId.value = requestId
  try {
    await $fetch(`/api/help-requests/${requestId}`, {
      method: 'PATCH',
      body: { status: 'closed' }
    })
    await refreshRequests()
  } catch (error) {
    console.error('Erreur:', error)
  } finally {
    closingRequestId.value = null
  }
}

// Data pour le profil
const { data: profile, refresh: refreshProfile } = await useFetch<Profile | null>('/api/developers/me')
const isNewProfile = computed(() => !profile.value)

const validProfileTypes = [
  "L'Architecte", 'La Détective', 'La Speedrunner', 'La Perfectionniste',
  'La Connectrice', "L'Exploratrice", 'La Gardienne', 'La Créative'
]

const hasValidExperienceProfile = computed(() => {
  return profile.value?.profileType &&
    profile.value?.profilePhrase &&
    validProfileTypes.includes(profile.value.profileType)
})

const form = reactive({
  name: '',
  bio: '',
  location: '',
  yearsExperience: null as number | null,
  website: '',
  linkedinUrl: '',
  twitterUrl: '',
  skills: [] as string[],
  openTo: [] as string[],
  speakerTopics: [] as string[],
  remoteOk: true,
  travelWilling: false,
  emailOptIn: false,
  cocAccepted: false
})

const newSkill = ref('')
const newTopic = ref('')
const saving = ref(false)
const error = ref('')
const deleting = ref(false)
const showOptInModal = ref(false)

watch(profile, (p) => {
  if (p) {
    form.name = p.name || ''
    form.bio = p.bio || ''
    form.location = p.location || ''
    form.yearsExperience = p.yearsExperience
    form.website = p.website || ''
    form.linkedinUrl = p.linkedinUrl || ''
    form.twitterUrl = p.twitterUrl || ''
    form.skills = p.skills || []
    form.openTo = p.openTo || []
    form.speakerTopics = p.speakerProfile?.topics || []
    form.remoteOk = p.speakerProfile?.remoteOk ?? true
    form.travelWilling = p.speakerProfile?.travelWilling ?? false
    form.emailOptIn = p.emailOptIn ?? false
  } else if (session.value?.user) {
    form.name = session.value.user.name || ''
  }
}, { immediate: true })

onMounted(() => {
  const shouldShow = isNewProfile.value || (profile.value && !profile.value.emailOptInAsked)
  if (shouldShow) {
    showOptInModal.value = true
  }
})

function addSkill() {
  if (newSkill.value && !form.skills.includes(newSkill.value)) {
    form.skills.push(newSkill.value)
    newSkill.value = ''
  }
}

function removeSkill(skill: string) {
  form.skills = form.skills.filter(s => s !== skill)
}

function addTopic() {
  if (newTopic.value && !form.speakerTopics.includes(newTopic.value)) {
    form.speakerTopics.push(newTopic.value)
    newTopic.value = ''
  }
}

function removeTopic(topic: string) {
  form.speakerTopics = form.speakerTopics.filter(t => t !== topic)
}

function toggleOpenTo(value: string) {
  const index = form.openTo.indexOf(value)
  if (index > -1) {
    form.openTo.splice(index, 1)
  } else {
    form.openTo.push(value)
  }
}

async function handleOptInChoice(choice: boolean) {
  showOptInModal.value = false
  form.emailOptIn = choice
  $clientPosthog?.capture('email_optin_response', { accepted: choice })

  if (profile.value) {
    try {
      await $fetch(`/api/developers/${profile.value.id}`, {
        method: 'PUT',
        body: { emailOptIn: choice }
      })
      profile.value.emailOptIn = choice
      profile.value.emailOptInAsked = true
    } catch {
      form.emailOptIn = !choice
    }
  }
}

async function save() {
  saving.value = true
  error.value = ''

  try {
    if (isNewProfile.value) {
      await $fetch('/api/developers', {
        method: 'POST',
        body: form
      })
      $clientPosthog?.capture('profile_created', {
        location: form.location,
        skills_count: form.skills.length,
        is_speaker: form.openTo.includes('conference')
      })
    } else {
      await $fetch(`/api/developers/${profile.value!.id}`, {
        method: 'PUT',
        body: form
      })
      $clientPosthog?.capture('profile_updated')
    }
    await refreshProfile()
    activeTab.value = 'dashboard'
  } catch (e: any) {
    error.value = e.data?.message || 'Une erreur est survenue'
  } finally {
    saving.value = false
  }
}

async function deleteProfile() {
  if (!confirm('Supprimer définitivement ton profil de l\'annuaire ? Cette action est irréversible.')) return

  deleting.value = true
  try {
    await $fetch('/api/developers/me', { method: 'DELETE' } as any)
    $clientPosthog?.capture('profile_deleted')
    await signOut({ callbackUrl: '/' })
  } catch (e: any) {
    error.value = e.data?.message || 'Erreur lors de la suppression'
    deleting.value = false
  }
}
</script>

<template>
  <ClientOnly>
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showOptInModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/90 backdrop-blur-md" @click="handleOptInChoice(false)" />
          <dialog open role="dialog" aria-labelledby="optin-title" aria-describedby="optin-desc" class="relative bg-background border border-border rounded-3xl p-10 max-w-lg w-full overflow-hidden">
            <div class="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
            <div class="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" aria-hidden="true" />

            <div class="relative">
              <p class="text-[0.65rem] uppercase tracking-[0.3em] text-primary mb-6" aria-hidden="true">Psst...</p>

              <h2 id="optin-title" class="font-display text-3xl md:text-4xl font-medium leading-tight mb-4 text-foreground">
                Attends, lis ça<br />
                <span class="text-foreground">avant de fermer</span>
              </h2>

              <p id="optin-desc" class="text-foreground-muted text-base leading-relaxed mb-8 max-w-sm">
                News sur l'avancée du projet, sondages pour améliorer l'app ensemble. On construit ça avec toi.
              </p>

              <div class="flex flex-col sm:flex-row gap-3">
                <button
                  @click="handleOptInChoice(true)"
                  class="group flex-1 px-6 py-4 bg-foreground text-background rounded-full font-medium transition-all hover:bg-primary flex items-center justify-center gap-2"
                >
                  Je veux ça
                  <svg class="w-4 h-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
                <button
                  @click="handleOptInChoice(false)"
                  class="px-6 py-4 bg-transparent text-foreground-muted rounded-full font-medium transition-all hover:text-foreground"
                >
                  Pas maintenant
                </button>
              </div>

              <p class="text-[0.7rem] text-foreground-muted mt-6">
                Zéro spam. Désinscription en 1 clic. Promis.
              </p>
            </div>
          </dialog>
        </div>
      </Transition>
    </Teleport>
  </ClientOnly>

  <div class="min-h-screen bg-background">
    <div class="max-w-3xl mx-auto px-6 py-16">
      <div class="mb-16">
        <div class="flex items-center gap-4 mb-1">
          <h1 class="font-display text-2xl font-medium">{{ firstName }}</h1>
          <div class="h-px flex-1 bg-border/30"></div>
        </div>
        <p class="text-foreground-muted text-sm">Ton espace perso</p>
      </div>

      <nav class="flex gap-8 mb-16 border-b border-border/20 -mx-6 px-6">
        <button
          @click="activeTab = 'dashboard'"
          :class="[
            'pb-4 text-sm font-medium transition-colors relative',
            activeTab === 'dashboard'
              ? 'text-foreground'
              : 'text-foreground-muted hover:text-foreground'
          ]"
        >
          Entraide
          <span v-if="activeTab === 'dashboard'" class="absolute bottom-0 left-0 right-0 h-px bg-foreground"></span>
        </button>
        <button
          @click="activeTab = 'profil'"
          :class="[
            'pb-4 text-sm font-medium transition-colors relative',
            activeTab === 'profil'
              ? 'text-foreground'
              : 'text-foreground-muted hover:text-foreground'
          ]"
        >
          Profil
          <span v-if="activeTab === 'profil'" class="absolute bottom-0 left-0 right-0 h-px bg-foreground"></span>
        </button>
      </nav>

      <div v-if="activeTab === 'dashboard'">
        <section class="mb-16">
          <NuxtLink
            to="/qg/ask"
            class="group block p-6 md:p-8 border border-border/30 rounded-2xl hover:border-primary/30 hover:bg-primary/[0.02] transition-all"
          >
            <div class="flex items-start justify-between gap-4">
              <div>
                <h2 class="text-xl md:text-2xl font-display font-medium mb-2">
                  Besoin d'un coup de main ?
                </h2>
                <p class="text-foreground-muted text-sm">
                  Décris ton blocage, on te trouve quelqu'un.
                </p>
              </div>
              <span class="w-10 h-10 flex items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-primary">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </span>
            </div>
          </NuxtLink>
        </section>

        <section class="mb-16">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-display font-medium">Tes demandes</h2>
            <span v-if="openRequests.length > 0" class="flex items-center gap-2 px-2.5 py-1 bg-amber-500/10 rounded-full">
              <span class="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></span>
              <span class="text-xs text-amber-400">{{ openRequests.length }} en cours</span>
            </span>
          </div>

          <div v-if="isLoadingRequests" class="space-y-3">
            <div v-for="i in 2" :key="i" class="p-4 border border-border/30 rounded-xl animate-pulse">
              <div class="h-4 bg-border/20 rounded w-1/2 mb-2"></div>
              <div class="h-3 bg-border/20 rounded w-1/4"></div>
            </div>
          </div>

          <div v-else-if="openRequests.length === 0 && closedRequests.length === 0" class="py-10 text-center border border-dashed border-border/30 rounded-xl">
            <p class="text-foreground-muted text-sm mb-1">Tu n'as pas encore de demande</p>
            <p class="text-foreground-muted text-xs">Crée-en une pour recevoir de l'aide</p>
          </div>

          <div v-else class="space-y-2">
            <NuxtLink
              v-for="request in openRequests"
              :key="request.id"
              :to="`/qg/requests/${request.id}`"
              class="flex items-center gap-4 p-4 border border-border/30 rounded-xl hover:border-border/60 hover:bg-white/[0.02] transition-all group"
            >
              <span class="w-2 h-2 bg-amber-400 rounded-full shrink-0"></span>
              <div class="min-w-0 flex-1">
                <span class="text-sm font-medium text-foreground group-hover:text-foreground-muted transition-colors truncate block">
                  {{ request.title }}
                </span>
                <div v-if="request.techs?.length" class="flex items-center gap-1.5 mt-1.5">
                  <span
                    v-for="tech in request.techs.slice(0, 3)"
                    :key="tech.id"
                    class="px-2 py-0.5 bg-white/5 rounded text-xs text-foreground-muted/70"
                  >
                    {{ tech.techName }}
                  </span>
                  <span v-if="request.techs.length > 3" class="text-xs text-foreground-muted/40">
                    +{{ request.techs.length - 3 }}
                  </span>
                </div>
              </div>
              <button
                @click="markAsResolved(request.id, $event)"
                :disabled="closingRequestId === request.id"
                class="p-2 text-foreground-muted/30 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-all disabled:opacity-50"
                title="Marquer résolu"
              >
                <span v-if="closingRequestId === request.id" class="block w-4 h-4 border-2 border-foreground-muted/40 border-t-transparent rounded-full animate-spin"></span>
                <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </button>
            </NuxtLink>

            <div v-for="request in closedRequests.slice(0, showClosedRequests ? undefined : 0)" :key="request.id">
              <NuxtLink
                :to="`/qg/requests/${request.id}`"
                class="flex items-center gap-4 p-4 rounded-xl hover:bg-white/[0.02] transition-all group"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-green-500/50 shrink-0">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <span class="text-sm text-foreground-muted/60 group-hover:text-foreground-muted transition-colors truncate">
                  {{ request.title }}
                </span>
              </NuxtLink>
            </div>

            <button
              v-if="closedRequests.length > 0"
              @click="showClosedRequests = !showClosedRequests"
              class="flex items-center gap-2 px-4 py-2 text-foreground-muted/50 hover:text-foreground-muted transition-colors text-xs"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                :class="['transition-transform', showClosedRequests ? 'rotate-180' : '']"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
              {{ showClosedRequests ? 'Masquer' : `Voir ${closedRequests.length} résolu${closedRequests.length > 1 ? 'es' : 'e'}` }}
            </button>
          </div>
        </section>

        <section v-if="!isLoadingActivity && activity && !activity.isNew" class="mb-16">
          <h2 class="text-lg font-display font-medium mb-4">Cette semaine</h2>
          <div class="flex flex-wrap gap-3">
            <div v-if="activity.weeklyContactsReceived && activity.weeklyContactsReceived > 0" class="flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/10 rounded-full">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-primary">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span class="text-sm text-foreground">
                <span class="font-medium">{{ activity.weeklyContactsReceived }}</span>
                {{ activity.weeklyContactsReceived === 1 ? 'message reçu' : 'messages reçus' }}
              </span>
            </div>

            <div v-if="activity.weeklyContactsSent && activity.weeklyContactsSent > 0" class="flex items-center gap-2 px-4 py-2 bg-green-500/5 border border-green-500/10 rounded-full">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-green-400">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
              <span class="text-sm text-foreground">
                <span class="font-medium">{{ activity.weeklyContactsSent }}</span>
                {{ activity.weeklyContactsSent === 1 ? 'message envoyé' : 'messages envoyés' }}
              </span>
            </div>

            <div v-if="activity.profileComplete === false" class="flex items-center gap-2 px-4 py-2 bg-amber-500/5 border border-amber-500/10 rounded-full">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-amber-400">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <button @click="activeTab = 'profil'" class="text-sm text-foreground hover:text-amber-400 transition-colors">
                Profil incomplet
              </button>
            </div>

            <div v-if="activity.profileComplete" class="flex items-center gap-2 px-4 py-2 bg-green-500/5 border border-green-500/10 rounded-full">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-green-400">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <span class="text-sm text-foreground-muted">Profil complet</span>
            </div>

            <div v-if="!activity.weeklyContactsReceived && !activity.weeklyContactsSent" class="flex items-center gap-2 px-4 py-2 bg-white/5 border border-border/20 rounded-full">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-foreground-muted">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span class="text-sm text-foreground-muted">Pas d'échanges cette semaine</span>
            </div>
          </div>

          <p v-if="activity.totalHelpGiven && activity.totalHelpGiven > 0" class="text-xs text-foreground-muted/50 mt-4">
            Tu as proposé ton aide {{ activity.totalHelpGiven }} fois au total
          </p>
        </section>

        <section>
          <h2 class="text-lg font-display font-medium mb-6">Coups de main demandés</h2>

          <div v-if="isLoadingFeed" class="space-y-4">
            <div v-for="i in 3" :key="i" class="p-4 border border-border/20 rounded-xl animate-pulse">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-8 h-8 bg-border/20 rounded-full"></div>
                <div class="h-4 bg-border/20 rounded w-24"></div>
              </div>
              <div class="h-4 bg-border/20 rounded w-3/4 mb-2"></div>
              <div class="h-3 bg-border/20 rounded w-1/4"></div>
            </div>
          </div>

          <div v-else-if="!feedData?.requests?.length" class="py-12 text-center border border-dashed border-border/20 rounded-xl">
            <p class="text-foreground-muted/50 text-sm">Aucune demande pour le moment</p>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="request in feedData.requests"
              :key="request.id"
              class="p-4 border border-border/20 rounded-xl hover:border-border/40 transition-colors"
            >
              <div class="flex items-center justify-between gap-3 mb-3">
                <NuxtLink
                  :to="`/annuaire/${request.developer?.id}`"
                  class="flex items-center gap-3 min-w-0 group/dev"
                >
                  <img
                    v-if="request.developer?.avatarUrl"
                    :src="request.developer.avatarUrl"
                    :alt="request.developer.name"
                    class="w-8 h-8 rounded-full object-cover"
                  />
                  <div v-else class="w-8 h-8 rounded-full bg-border/30 flex items-center justify-center">
                    <span class="text-xs text-foreground-muted">{{ request.developer?.name?.charAt(0) || '?' }}</span>
                  </div>
                  <span class="text-sm text-foreground-muted group-hover/dev:text-foreground transition-colors truncate">{{ request.developer?.name }}</span>
                </NuxtLink>
                <a
                  v-if="request.developer?.linkedinUrl"
                  :href="request.developer.linkedinUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center gap-1.5 px-3 py-1.5 text-xs text-foreground-muted hover:text-[#0A66C2] hover:bg-[#0A66C2]/10 rounded-full transition-colors"
                  title="Voir le profil LinkedIn"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  <span>LinkedIn</span>
                </a>
              </div>

              <p class="text-sm font-medium text-foreground mb-2">{{ request.title }}</p>

              <div v-if="request.techs?.length" class="flex flex-wrap gap-1.5">
                <span
                  v-for="tech in request.techs.slice(0, 4)"
                  :key="tech.id"
                  class="px-2 py-0.5 bg-white/5 rounded text-xs text-foreground-muted/70"
                >
                  {{ tech.techName }}
                </span>
                <span v-if="request.techs.length > 4" class="text-xs text-foreground-muted/40">
                  +{{ request.techs.length - 4 }}
                </span>
              </div>
            </div>

            <button
              v-if="feedData.pagination?.hasMore"
              @click="loadMoreFeed"
              :disabled="isLoadingMore"
              class="w-full py-3 text-sm text-foreground-muted hover:text-foreground border border-border/20 hover:border-border/40 rounded-xl transition-colors disabled:opacity-50"
            >
              {{ isLoadingMore ? 'Chargement...' : 'Voir plus' }}
            </button>
          </div>
        </section>
      </div>

      <div v-else>
        <ClientOnly>
          <div v-if="isNewProfile" class="mb-8 p-4 bg-primary/10 border border-primary/30 rounded-xl">
            <p class="text-sm text-foreground">
              Cet annuaire est réservé aux <strong>développeuses basées en France</strong>.
              Merci de renseigner ta ville française dans le champ "Ville" ci-dessous.
            </p>
          </div>
        </ClientOnly>

        <ClientOnly>
          <section v-if="hasValidExperienceProfile" class="mb-10 relative group">
            <div class="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div class="relative p-6 md:p-8 border border-border/50 rounded-2xl">
              <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div class="flex-1 min-w-0">
                  <span class="text-[0.6rem] uppercase tracking-[0.25em] text-foreground-muted mb-2 block">Ton profil quiz</span>
                  <p class="font-display text-2xl md:text-3xl font-medium tracking-tight mb-1">{{ profile?.profileType }}</p>
                  <p class="text-foreground-muted text-sm leading-relaxed">{{ profile?.profilePhrase }}</p>
                </div>
                <NuxtLink to="/experience" class="group/btn flex items-center gap-3 px-5 py-3 border border-border/50 rounded-full hover:border-foreground/30 hover:bg-white/[0.02] transition-all duration-300 shrink-0">
                  <span class="text-sm text-foreground-muted group-hover/btn:text-foreground transition-colors">Refaire</span>
                  <span class="w-6 h-6 flex items-center justify-center rounded-full bg-white/5 group-hover/btn:bg-white/10 transition-colors">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-foreground-muted group-hover/btn:text-foreground transition-colors">
                      <path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
                    </svg>
                  </span>
                </NuxtLink>
              </div>
            </div>
          </section>
        </ClientOnly>

        <ClientOnly>
          <template #fallback>
            <div class="animate-pulse space-y-8">
              <div class="py-8 border-b border-border">
                <div class="h-6 bg-border/50 rounded w-24 mb-6"></div>
                <div class="space-y-6">
                  <div class="h-12 bg-border/50 rounded"></div>
                  <div class="h-24 bg-border/50 rounded"></div>
                </div>
              </div>
            </div>
          </template>

          <form @submit.prevent="save">
            <div v-if="error" class="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 mb-8">{{ error }}</div>

            <section class="py-8 border-b border-border">
              <h2 class="font-display text-xl font-medium mb-6">Identité</h2>

              <div class="flex flex-col gap-6">
                <div class="flex flex-col gap-2">
                  <label for="name" class="text-xs uppercase tracking-wide text-foreground-muted">Nom *</label>
                  <input id="name" v-model="form.name" type="text" required class="px-4 py-3 bg-background-card border border-border rounded-lg text-foreground text-sm transition-colors focus:outline-none focus:border-foreground-muted" />
                </div>

                <div class="flex flex-col gap-2">
                  <label for="bio" class="text-xs uppercase tracking-wide text-foreground-muted">Bio</label>
                  <textarea id="bio" v-model="form.bio" rows="3" placeholder="Ce que tu fais, ce qui te passionne..." class="px-4 py-3 bg-background-card border border-border rounded-lg text-foreground text-sm transition-colors focus:outline-none focus:border-foreground-muted resize-y min-h-[80px] placeholder:text-foreground-muted"></textarea>
                </div>
              </div>
            </section>

            <section class="py-8 border-b border-border">
              <h2 class="font-display text-xl font-medium mb-6">Localisation & Expérience</h2>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="flex flex-col gap-2">
                  <label for="location" class="text-xs uppercase tracking-wide text-foreground-muted">Ville</label>
                  <input id="location" v-model="form.location" type="text" placeholder="Paris" class="px-4 py-3 bg-background-card border border-border rounded-lg text-foreground text-sm transition-colors focus:outline-none focus:border-foreground-muted placeholder:text-foreground-muted" />
                </div>

                <div class="flex flex-col gap-2">
                  <label for="years-experience" class="text-xs uppercase tracking-wide text-foreground-muted">Années d'expérience</label>
                  <input id="years-experience" v-model.number="form.yearsExperience" type="number" min="0" max="50" class="px-4 py-3 bg-background-card border border-border rounded-lg text-foreground text-sm transition-colors focus:outline-none focus:border-foreground-muted" />
                </div>
              </div>
            </section>

            <section class="py-8 border-b border-border">
              <h2 id="competences-label" class="font-display text-xl font-medium mb-6">Compétences</h2>

              <div class="flex gap-2 mb-4">
                <input
                  id="new-skill"
                  v-model="newSkill"
                  type="text"
                  placeholder="Vue.js, TypeScript, Node..."
                  aria-labelledby="competences-label"
                  class="flex-1 px-4 py-3 bg-background-card border border-border rounded-lg text-foreground text-sm transition-colors focus:outline-none focus:border-foreground-muted placeholder:text-foreground-muted"
                  @keydown.enter.prevent="addSkill"
                />
                <button type="button" @click="addSkill" class="px-6 py-3 bg-background-card border border-border rounded-lg text-foreground cursor-pointer transition-all hover:bg-background-card-hover">Ajouter</button>
              </div>

              <div class="flex flex-wrap gap-2">
                <span v-for="skill in form.skills" :key="skill" class="flex items-center gap-2 px-4 py-2 bg-background-card border border-border rounded-full text-sm">
                  {{ skill }}
                  <button type="button" @click="removeSkill(skill)" class="bg-transparent border-none text-foreground-muted cursor-pointer text-lg leading-none p-0 hover:text-foreground">&times;</button>
                </span>
                <span v-if="form.skills.length === 0" class="text-sm text-foreground-muted">Aucune compétence ajoutée</span>
              </div>
            </section>

            <section class="py-8 border-b border-border">
              <h2 class="font-display text-xl font-medium mb-2">Disponible pour</h2>
              <p class="text-foreground-muted text-sm mb-6">Qu'est-ce qui t'intéresse ?</p>

              <div class="flex flex-col md:flex-row flex-wrap gap-3">
                <button
                  v-for="option in openToOptions"
                  :key="option.value"
                  type="button"
                  :class="[
                    'px-6 py-3 border rounded-full cursor-pointer text-sm transition-all w-full md:w-auto text-center',
                    form.openTo.includes(option.value)
                      ? 'bg-foreground border-foreground text-background'
                      : 'bg-transparent border-border text-foreground-muted hover:border-foreground hover:text-foreground'
                  ]"
                  @click="toggleOpenTo(option.value)"
                >
                  {{ option.label }}
                </button>
              </div>

              <div v-if="form.openTo.includes('conference')" class="mt-8 pt-8 border-t border-border/50">
                <h3 class="font-medium text-lg mb-2">Profil Speakeuse</h3>
                <p class="text-foreground-muted text-sm mb-6">Infos pour les organisateurs d'événements</p>

                <div class="flex flex-col gap-2 mb-4">
                  <label for="new-topic" class="text-xs uppercase tracking-wide text-foreground-muted">Sujets de talk</label>
                  <div class="flex gap-2 mb-4">
                    <input
                      id="new-topic"
                      v-model="newTopic"
                      type="text"
                      placeholder="Vue.js, Women in Tech..."
                      class="flex-1 px-4 py-3 bg-background-card border border-border rounded-lg text-foreground text-sm transition-colors focus:outline-none focus:border-foreground-muted placeholder:text-foreground-muted"
                      @keydown.enter.prevent="addTopic"
                    />
                    <button type="button" @click="addTopic" class="px-6 py-3 bg-background-card border border-border rounded-lg text-foreground cursor-pointer transition-all hover:bg-background-card-hover">Ajouter</button>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <span v-for="topic in form.speakerTopics" :key="topic" class="flex items-center gap-2 px-4 py-2 bg-background-card border border-border rounded-full text-sm">
                      {{ topic }}
                      <button type="button" @click="removeTopic(topic)" class="bg-transparent border-none text-foreground-muted cursor-pointer text-lg leading-none p-0 hover:text-foreground">&times;</button>
                    </span>
                    <span v-if="form.speakerTopics.length === 0" class="text-sm text-foreground-muted">Aucun sujet ajouté</span>
                  </div>
                </div>

                <div class="flex flex-col md:flex-row gap-4 md:gap-8 mt-4">
                  <label class="flex items-center gap-2 cursor-pointer text-foreground-muted hover:text-foreground transition-colors">
                    <input v-model="form.remoteOk" type="checkbox" class="w-[18px] h-[18px] accent-foreground" />
                    <span>Disponible en remote</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer text-foreground-muted hover:text-foreground transition-colors">
                    <input v-model="form.travelWilling" type="checkbox" class="w-[18px] h-[18px] accent-foreground" />
                    <span>Prête à me déplacer</span>
                  </label>
                </div>
              </div>
            </section>

            <section class="py-8 border-b border-border">
              <h2 class="font-display text-xl font-medium mb-2">Liens</h2>
              <p class="text-foreground-muted text-sm mb-6">Où te trouver sur le web</p>

              <div class="flex flex-col gap-4">
                <div class="flex flex-col gap-2">
                  <label for="linkedin" class="text-xs uppercase tracking-wide text-foreground-muted">LinkedIn *</label>
                  <input id="linkedin" v-model="form.linkedinUrl" type="url" placeholder="https://linkedin.com/in/..." required class="px-4 py-3 bg-background-card border border-border rounded-lg text-foreground text-sm transition-colors focus:outline-none focus:border-foreground-muted placeholder:text-foreground-muted" />
                </div>

                <div class="flex flex-col gap-2">
                  <label for="website" class="text-xs uppercase tracking-wide text-foreground-muted">Site web / Portfolio</label>
                  <input id="website" v-model="form.website" type="url" placeholder="https://..." class="px-4 py-3 bg-background-card border border-border rounded-lg text-foreground text-sm transition-colors focus:outline-none focus:border-foreground-muted placeholder:text-foreground-muted" />
                </div>

                <div class="flex flex-col gap-2">
                  <label for="twitter" class="text-xs uppercase tracking-wide text-foreground-muted">Twitter / X</label>
                  <input id="twitter" v-model="form.twitterUrl" type="url" placeholder="https://twitter.com/..." class="px-4 py-3 bg-background-card border border-border rounded-lg text-foreground text-sm transition-colors focus:outline-none focus:border-foreground-muted placeholder:text-foreground-muted" />
                </div>
              </div>
            </section>

            <section class="py-8 border-b border-border">
              <h2 class="font-display text-xl font-medium mb-6">Préférences</h2>

              <label class="flex items-start gap-3 cursor-pointer group">
                <input
                  v-model="form.emailOptIn"
                  type="checkbox"
                  class="w-[18px] h-[18px] accent-primary mt-0.5 shrink-0"
                />
                <div class="flex flex-col gap-1">
                  <span class="text-foreground group-hover:text-primary transition-colors">
                    Recevoir les actualités OSLD
                  </span>
                  <span class="text-xs text-foreground-muted">
                    News sur l'avancée du projet, sondages pour améliorer l'app. Zéro spam.
                  </span>
                </div>
              </label>
            </section>

            <section v-if="isNewProfile" class="p-6 border border-primary/30 rounded-2xl bg-primary/5">
              <label class="flex items-start gap-3 cursor-pointer group">
                <input
                  v-model="form.cocAccepted"
                  type="checkbox"
                  class="w-[18px] h-[18px] accent-primary mt-0.5 shrink-0"
                />
                <div class="flex flex-col gap-1">
                  <span class="text-foreground group-hover:text-primary transition-colors">
                    J'accepte le code de conduite *
                  </span>
                  <span class="text-xs text-foreground-muted">
                    En cochant cette case, tu t'engages a respecter le
                    <NuxtLink to="/coc" target="_blank" class="text-primary underline hover:text-foreground transition-colors">code de conduite</NuxtLink>
                    de la communaute OSLD.
                  </span>
                </div>
              </label>
            </section>

            <div class="flex justify-end gap-4 pt-8">
              <button type="button" @click="activeTab = 'dashboard'" class="px-8 py-4 bg-transparent border border-border rounded-full text-foreground-muted text-sm transition-all hover:border-foreground hover:text-foreground">Annuler</button>
              <button type="submit" :disabled="saving || (isNewProfile && !form.cocAccepted)" class="px-8 py-4 bg-foreground border-none rounded-full text-background text-sm font-medium cursor-pointer transition-all hover:bg-foreground-muted disabled:opacity-50 disabled:cursor-not-allowed">
                {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
              </button>
            </div>
          </form>

          <section v-if="!isNewProfile" class="mt-16 pt-8 border-t border-red-500/20">
            <h2 class="text-sm font-medium text-red-400 mb-4">Zone de danger</h2>
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-red-500/20 rounded-xl">
              <div>
                <p class="text-sm text-foreground">Supprimer mon profil</p>
                <p class="text-xs text-foreground-muted mt-1">Cette action est irréversible.</p>
              </div>
              <button
                type="button"
                @click="deleteProfile"
                :disabled="deleting"
                class="px-6 py-3 bg-transparent border border-red-500/30 text-red-400 rounded-full text-sm cursor-pointer transition-all hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ deleting ? 'Suppression...' : 'Supprimer' }}
              </button>
            </div>
          </section>
        </ClientOnly>
      </div>
    </div>
  </div>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
