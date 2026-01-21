<script setup lang="ts">
import { useAuth } from '#imports'

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

interface Activity {
  isNew: boolean
  weeklyContactsReceived?: number
  weeklyContactsSent?: number
  recentExchanges?: { type: 'sent' | 'received'; name: string; avatarUrl?: string; helpRequestTitle?: string }[]
  totalHelpGiven?: number
  profileComplete?: boolean
  missingFields?: string[]
  memberSince?: string
}

definePageMeta({
  middleware: 'sidebase-auth'
})

useSeoMeta({
  title: 'Mon QG',
  robots: 'noindex'
})

const route = useRoute()
const router = useRouter()
const { $clientPosthog } = useNuxtApp()
const { data: session } = useAuth()

type TabType = 'entraide' | 'projects' | 'profil'

const activeTab = ref<TabType>(
  route.query.tab === 'profil' ? 'profil' :
  route.query.tab === 'projects' ? 'projects' : 'entraide'
)

watch(() => route.query.tab, (tab) => {
  activeTab.value = tab === 'profil' ? 'profil' : tab === 'projects' ? 'projects' : 'entraide'
})

watch(activeTab, (tab) => {
  router.replace({ query: tab === 'entraide' ? {} : { tab } })
})

const { data: requests, status: requestsStatus, refresh: refreshRequests } = useLazyFetch('/api/help-requests')
const isLoadingRequests = computed(() => requestsStatus.value === 'pending')

const { data: activity, status: activityStatus, refresh: refreshActivity } = useLazyFetch<Activity>('/api/qg/activity')
const isLoadingActivity = computed(() => activityStatus.value === 'pending')

const openRequests = computed(() =>
  requests.value?.filter((r: any) => r.status === 'open') || []
)
const closedRequests = computed(() =>
  requests.value?.filter((r: any) => r.status === 'closed') || []
)

const { data: myProjects, status: projectsStatus, refresh: refreshProjects } = useLazyFetch<any[]>('/api/side-projects/mine')
const isLoadingProjects = computed(() => projectsStatus.value === 'pending')

const { data: profile, refresh: refreshProfile } = await useFetch<Profile | null>('/api/developers/me')
const isNewProfile = computed(() => !profile.value)

const showOptInModal = ref(false)

onMounted(() => {
  const shouldShow = isNewProfile.value || (profile.value && !profile.value.emailOptInAsked)
  if (shouldShow) {
    showOptInModal.value = true
  }
})

async function handleOptInChoice(choice: boolean) {
  showOptInModal.value = false
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
    }
  }
}

async function handleMarkResolved(requestId: number) {
  try {
    await $fetch(`/api/help-requests/${requestId}`, {
      method: 'PATCH',
      body: { status: 'closed' }
    })
    await refreshRequests()
  } catch (error) {
    console.error('Erreur:', error)
  }
}

async function handleProfileSaved() {
  await Promise.all([refreshProfile(), refreshActivity()])
  activeTab.value = 'entraide'
}

async function handleMarkProjectCompleted(projectId: number) {
  try {
    await $fetch(`/api/side-projects/${projectId}`, {
      method: 'PATCH',
      body: { status: 'completed' }
    })
    await refreshProjects()
  } catch (error) {
    console.error('Erreur:', error)
  }
}
</script>

<template>
  <ClientOnly>
    <QgOptInModal v-if="showOptInModal" @choice="handleOptInChoice" />
  </ClientOnly>

  <div class="min-h-screen bg-background">
    <div class="max-w-3xl mx-auto px-6 pt-4 md:pt-8">
      <QgWeeklyActivity
        v-if="!isLoadingActivity && activity && !activity.isNew"
        :activity="activity"
        class="mb-4 md:mb-6"
        @go-to-profile="activeTab = 'profil'"
      />
    </div>

    <nav class="sticky top-14 z-40 bg-background md:relative md:top-0 border-b border-border/20">
      <div class="max-w-3xl mx-auto px-6 flex items-center gap-4 md:gap-6 pt-3 md:pt-0">
        <h1 class="font-display text-lg font-medium pb-3 md:pb-4">Mon QG</h1>
        <div class="flex gap-4 md:gap-6">
          <button
            @click="activeTab = 'entraide'"
            :class="[
              'pb-3 md:pb-4 text-sm font-medium transition-colors relative',
              activeTab === 'entraide'
                ? 'text-foreground'
                : 'text-foreground-muted hover:text-foreground'
            ]"
          >
            Entraide
            <span v-if="activeTab === 'entraide'" class="absolute bottom-0 left-0 right-0 h-px bg-foreground"></span>
          </button>
          <button
            @click="activeTab = 'projects'"
            :class="[
              'pb-3 md:pb-4 text-sm font-medium transition-colors relative',
              activeTab === 'projects'
                ? 'text-foreground'
                : 'text-foreground-muted hover:text-foreground'
            ]"
          >
            Side Projects
            <span v-if="activeTab === 'projects'" class="absolute bottom-0 left-0 right-0 h-px bg-foreground"></span>
          </button>
          <button
            @click="activeTab = 'profil'"
            :class="[
              'pb-3 md:pb-4 text-sm font-medium transition-colors relative',
              activeTab === 'profil'
                ? 'text-foreground'
                : 'text-foreground-muted hover:text-foreground'
            ]"
          >
            Profil
            <span v-if="activeTab === 'profil'" class="absolute bottom-0 left-0 right-0 h-px bg-foreground"></span>
          </button>
        </div>
      </div>
    </nav>

    <div class="max-w-3xl mx-auto px-6 py-4 md:py-8">
      <div v-if="activeTab === 'entraide'">
        <div v-if="!isLoadingActivity && activity?.profileComplete === false" class="mb-6 md:mb-8 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
          <div class="flex items-start gap-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-amber-400 shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div>
              <p class="text-sm text-foreground font-medium mb-1">Profil incomplet</p>
              <p class="text-xs text-foreground-muted mb-3">
                Pour accéder à l'entraide, il te manque : <span class="text-amber-400">{{ activity?.missingFields?.join(', ') }}</span>
              </p>
              <button
                @click="activeTab = 'profil'"
                class="text-xs text-amber-400 hover:text-amber-300 underline transition-colors"
              >
                Compléter mon profil
              </button>
            </div>
          </div>
        </div>

        <section class="mb-8 md:mb-16">
          <NuxtLink
            v-if="activity?.profileComplete !== false"
            to="/qg/ask"
            class="group block p-5 md:p-8 border border-border/30 rounded-2xl transition-all hover:border-primary/30 hover:bg-primary/[0.02]"
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
          <div
            v-else
            class="block p-5 md:p-8 border border-border/20 rounded-2xl cursor-not-allowed"
          >
            <div class="flex items-start justify-between gap-4">
              <div>
                <h2 class="text-xl md:text-2xl font-display font-medium mb-2 text-foreground-muted">
                  Besoin d'un coup de main ?
                </h2>
                <p class="text-foreground-muted/60 text-sm">
                  Complète ton profil pour demander de l'aide
                </p>
              </div>
              <span class="w-10 h-10 flex items-center justify-center rounded-full bg-border/20 shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-foreground-muted/50">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </span>
            </div>
          </div>
        </section>

        <QgRequestsList
          :open-requests="openRequests"
          :closed-requests="closedRequests"
          :is-loading="isLoadingRequests"
          @mark-resolved="handleMarkResolved"
        />

        <QgFeed />
      </div>

      <div v-else-if="activeTab === 'projects'">
        <section class="mb-8 md:mb-16">
          <NuxtLink
            v-if="activity?.profileComplete !== false"
            to="/qg/new-project"
            class="group block p-5 md:p-8 border border-border/30 rounded-2xl transition-all hover:border-green-500/30 hover:bg-green-500/[0.02]"
          >
            <div class="flex items-start justify-between gap-4">
              <div>
                <h2 class="text-xl md:text-2xl font-display font-medium mb-2">
                  Propose ton side project
                </h2>
                <p class="text-foreground-muted text-sm">
                  Trouve des contributrices pour ton projet.
                </p>
              </div>
              <span class="w-10 h-10 flex items-center justify-center rounded-full bg-green-500/10 group-hover:bg-green-500/20 transition-colors shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-green-400">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </span>
            </div>
          </NuxtLink>
          <div
            v-else
            class="block p-5 md:p-8 border border-border/20 rounded-2xl cursor-not-allowed"
          >
            <div class="flex items-start justify-between gap-4">
              <div>
                <h2 class="text-xl md:text-2xl font-display font-medium mb-2 text-foreground-muted">
                  Propose ton side project
                </h2>
                <p class="text-foreground-muted/60 text-sm">
                  Complète ton profil pour proposer un projet
                </p>
              </div>
              <span class="w-10 h-10 flex items-center justify-center rounded-full bg-border/20 shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-foreground-muted/50">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </span>
            </div>
          </div>
        </section>

        <QgMyProjectsList
          :projects="myProjects || []"
          :is-loading="isLoadingProjects"
          @mark-completed="handleMarkProjectCompleted"
        />

        <QgSideProjectsList />
      </div>

      <div v-else>
        <QgProfileForm
          :profile="profile ?? null"
          :session-user-name="session?.user?.name || undefined"
          @saved="handleProfileSaved"
        />
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
