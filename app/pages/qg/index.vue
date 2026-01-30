<script setup lang="ts">
import { useAuth } from '#imports'
import type { QgProfile, QgActivity, HelpRequest, Offer } from '~/types/qg'

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
const { data: requests, status: requestsStatus, refresh: refreshRequests } = useLazyFetch<HelpRequest[]>('/api/help-requests')
const { data: activity, status: activityStatus, refresh: refreshActivity } = useLazyFetch<QgActivity>('/api/qg/activity')
const { data: myProjects, status: projectsStatus, refresh: refreshProjects } = useLazyFetch<any[]>('/api/side-projects/mine')
const { data: offers, status: offersStatus, refresh: refreshOffers } = useLazyFetch<Offer[]>('/api/offers')
const { data: profile, refresh: refreshProfile } = await useFetch<QgProfile | null>('/api/developers/me')
type TabType = 'entraide' | 'offres' | 'profil'

const activeTab = ref<TabType>(
  route.query.tab === 'profil' ? 'profil' :
  (route.query.tab === 'offres' || route.query.tab === 'projects') ? 'offres' : 'entraide'
)
const showOptInModal = ref(false)
const isLoadingRequests = computed(() => requestsStatus.value === 'pending')
const isLoadingActivity = computed(() => activityStatus.value === 'pending')
const isLoadingProjects = computed(() => projectsStatus.value === 'pending')
const isLoadingOffers = computed(() => offersStatus.value === 'pending')

const openRequests = computed(() =>
  requests.value?.filter(r => r.status === 'open') || []
)
const closedRequests = computed(() =>
  requests.value?.filter(r => r.status === 'closed') || []
)
const myOffers = computed(() =>
  offers.value?.filter(o => o.developer?.id === profile.value?.id) || []
)
const isNewProfile = computed(() => !profile.value)
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
  const wasNew = isNewProfile.value
  await Promise.all([refreshProfile(), refreshActivity()])
  if (wasNew) {
    activeTab.value = 'entraide'
  }
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
watch(() => route.query.tab, (tab) => {
  activeTab.value = tab === 'profil' ? 'profil' : (tab === 'offres' || tab === 'projects') ? 'offres' : 'entraide'
})

watch(activeTab, (tab) => {
  router.replace({ query: tab === 'entraide' ? {} : { tab } })
})
onMounted(() => {
  const shouldShow = isNewProfile.value || (profile.value && !profile.value.emailOptInAsked)
  if (shouldShow) {
    showOptInModal.value = true
  }
})
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
        <h1 class="font-display text-sm font-semibold tracking-widest text-primary m-0">MON QG</h1>
        <img v-if="session?.user?.image" :src="session.user.image" :alt="session.user.name || ''" class="w-8 h-8 rounded-full border border-border" />
        <span v-else class="w-8 h-8 rounded-full bg-border/50"></span>
      </div>
    </header>

    <div class="max-w-3xl mx-auto px-6 pt-4 md:pt-8">
      <div v-if="isLoadingActivity" class="mb-4 md:mb-6">
        <div class="h-4 w-28 bg-border/20 rounded animate-pulse mb-3"></div>
        <div class="flex flex-wrap gap-2">
          <div class="h-8 w-32 bg-border/20 rounded-full animate-pulse"></div>
          <div class="h-8 w-44 bg-border/20 rounded-full animate-pulse"></div>
        </div>
      </div>
      <QgWeeklyActivity
        v-else-if="activity && !activity.isNew"
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
          <span v-if="activeTab === 'entraide'" class="absolute bottom-0 left-0 right-0 h-px bg-primary"></span>
        </button>
        <button
          @click="activeTab = 'offres'"
          :class="[
            'pt-3 pb-3 text-sm font-medium transition-colors relative',
            activeTab === 'offres'
              ? 'text-foreground'
              : 'text-foreground-muted hover:text-foreground'
          ]"
        >
          Offres
          <span v-if="activeTab === 'offres'" class="absolute bottom-0 left-0 right-0 h-px bg-primary"></span>
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
          <span v-if="activeTab === 'profil'" class="absolute bottom-0 left-0 right-0 h-px bg-primary"></span>
        </button>
      </div>
    </nav>

    <nav class="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/20 pb-[env(safe-area-inset-bottom)]">
      <div class="flex justify-around">
        <button
          @click="activeTab = 'entraide'"
          :class="[
            'flex flex-col items-center gap-1 pt-2.5 pb-2 px-4 text-[11px] font-medium transition-colors',
            activeTab === 'entraide' ? 'text-primary' : 'text-foreground-muted'
          ]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" :stroke="activeTab === 'entraide' ? 'currentColor' : 'currentColor'" stroke-width="1.5">
            <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          Entraide
        </button>
        <button
          @click="activeTab = 'offres'"
          :class="[
            'flex flex-col items-center gap-1 pt-2.5 pb-2 px-4 text-[11px] font-medium transition-colors',
            activeTab === 'offres' ? 'text-primary' : 'text-foreground-muted'
          ]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
          </svg>
          Offres
        </button>
        <button
          @click="activeTab = 'profil'"
          :class="[
            'flex flex-col items-center gap-1 pt-2.5 pb-2 px-4 text-[11px] font-medium transition-colors',
            activeTab === 'profil' ? 'text-primary' : 'text-foreground-muted'
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
      <div v-if="activeTab === 'entraide'" class="space-y-10 md:space-y-14">
        <div v-if="!isLoadingActivity && activity?.profileComplete === false" class="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
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

        <section>
          <NuxtLink
            v-if="activity?.profileComplete !== false"
            to="/qg/ask"
            class="group block p-5 md:p-8 border border-b-[3px] border-primary/20 border-b-primary/60 rounded-2xl transition-all hover:border-primary/40 hover:bg-primary/[0.03] hover:shadow-glow hover:-translate-y-0.5 active:translate-y-px active:border-b active:shadow-none"
          >
            <div class="flex items-center justify-between gap-4">
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

        <QgFeed />

        <QgRequestsList
          :open-requests="openRequests"
          :closed-requests="closedRequests"
          :is-loading="isLoadingRequests"
          @mark-resolved="handleMarkResolved"
        />
      </div>

      <div v-else-if="activeTab === 'offres'">
        <div v-if="activity?.profileComplete !== false" class="flex flex-col sm:flex-row gap-3 mb-8 md:mb-12">
          <NuxtLink
            to="/qg/new-offer"
            class="group flex-1 block p-5 border border-b-[3px] border-primary/20 border-b-primary/60 rounded-2xl transition-all hover:border-primary/40 hover:bg-primary/[0.03] hover:shadow-glow hover:-translate-y-0.5 active:translate-y-px active:border-b active:shadow-none no-underline"
          >
            <div class="flex items-center gap-3">
              <span class="w-9 h-9 flex items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-primary">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
                </svg>
              </span>
              <div>
                <span class="block text-sm font-medium text-foreground">Poster une offre</span>
                <span class="block text-xs text-foreground-muted">Alternance, stage, CDI...</span>
              </div>
            </div>
          </NuxtLink>
          <NuxtLink
            to="/qg/new-project"
            class="group flex-1 block p-5 border border-b-[3px] border-primary/20 border-b-primary/60 rounded-2xl transition-all hover:border-primary/40 hover:bg-primary/[0.03] hover:shadow-glow hover:-translate-y-0.5 active:translate-y-px active:border-b active:shadow-none no-underline"
          >
            <div class="flex items-center gap-3">
              <span class="w-9 h-9 flex items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-primary">
                  <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
                </svg>
              </span>
              <div>
                <span class="block text-sm font-medium text-foreground">Side project</span>
                <span class="block text-xs text-foreground-muted">Trouve des contributrices</span>
              </div>
            </div>
          </NuxtLink>
        </div>
        <div v-else class="mb-8 md:mb-12 p-5 border border-border/20 rounded-2xl cursor-not-allowed">
          <p class="text-sm text-foreground-muted">Complète ton profil pour poster des offres ou des projets</p>
        </div>

        <QgOffersList
          :offers="offers || []"
          :is-loading="isLoadingOffers"
          :current-user-id="profile?.id"
        />

        <QgSideProjectsList />

        <div v-if="myOffers.length > 0 || (myProjects || []).length > 0" class="mt-16">
          <div class="flex items-center gap-3 mb-8">
            <h2 class="text-lg font-display font-medium">Tes publications</h2>
            <span class="flex-1 h-px bg-border/20"></span>
          </div>

          <QgMyOffersList
            :offers="myOffers"
            :is-loading="isLoadingOffers"
            @deleted="refreshOffers()"
          />

          <QgMyProjectsList
            :projects="myProjects || []"
            :is-loading="isLoadingProjects"
            @mark-completed="handleMarkProjectCompleted"
          />
        </div>
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
