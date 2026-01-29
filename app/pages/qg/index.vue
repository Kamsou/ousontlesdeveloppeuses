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
  communityNewMembers?: number
  communityHelpRequests?: number
  communityNewProjects?: number
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
    <header class="sticky top-0 z-50 px-4 md:px-8 py-3 backdrop-blur-xl bg-background/80 border-b border-border/20">
      <div class="max-w-3xl mx-auto flex items-center justify-between">
        <NuxtLink to="/annuaire" class="flex items-center gap-2 no-underline text-foreground-muted hover:text-foreground transition-colors text-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Retour
        </NuxtLink>
        <h1 class="font-display text-sm font-semibold tracking-widest text-foreground-muted m-0">MON QG</h1>
        <img v-if="session?.user?.image" :src="session.user.image" :alt="session.user.name || ''" class="w-8 h-8 rounded-full border border-border" />
        <span v-else class="w-8 h-8 rounded-full bg-border/50"></span>
      </div>
    </header>

    <div class="max-w-3xl mx-auto px-6 pt-4 md:pt-8">
      <QgWeeklyActivity
        v-if="!isLoadingActivity && activity && !activity.isNew"
        :activity="activity"
        class="mb-4 md:mb-6"
        @go-to-profile="activeTab = 'profil'"
      />
    </div>

    <nav class="hidden md:block sticky top-[49px] z-40 bg-background border-b border-border/20">
      <div class="max-w-3xl mx-auto px-6 flex gap-6">
        <button
          @click="activeTab = 'entraide'"
          :class="[
            'pt-3 pb-3 text-sm font-medium transition-colors relative',
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
            'pt-3 pb-3 text-sm font-medium transition-colors relative',
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
            'pt-3 pb-3 text-sm font-medium transition-colors relative',
            activeTab === 'profil'
              ? 'text-foreground'
              : 'text-foreground-muted hover:text-foreground'
          ]"
        >
          Profil
          <span v-if="activeTab === 'profil'" class="absolute bottom-0 left-0 right-0 h-px bg-foreground"></span>
        </button>
      </div>
    </nav>

    <nav class="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/20 pb-[env(safe-area-inset-bottom)]">
      <div class="flex justify-around">
        <button
          @click="activeTab = 'entraide'"
          :class="[
            'flex flex-col items-center gap-1 pt-2.5 pb-2 px-4 text-[11px] font-medium transition-colors',
            activeTab === 'entraide' ? 'text-foreground' : 'text-foreground-muted'
          ]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" :stroke="activeTab === 'entraide' ? 'currentColor' : 'currentColor'" stroke-width="1.5">
            <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          Entraide
        </button>
        <button
          @click="activeTab = 'projects'"
          :class="[
            'flex flex-col items-center gap-1 pt-2.5 pb-2 px-4 text-[11px] font-medium transition-colors',
            activeTab === 'projects' ? 'text-foreground' : 'text-foreground-muted'
          ]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
          </svg>
          Projects
        </button>
        <button
          @click="activeTab = 'profil'"
          :class="[
            'flex flex-col items-center gap-1 pt-2.5 pb-2 px-4 text-[11px] font-medium transition-colors',
            activeTab === 'profil' ? 'text-foreground' : 'text-foreground-muted'
          ]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
          Profil
        </button>
      </div>
    </nav>

    <div class="max-w-3xl mx-auto px-6 py-4 md:py-8 pb-24 md:pb-8">
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
