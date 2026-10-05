<script setup lang="ts">
import { QG_FROZEN } from '#shared/utils/qg'
import { useAuth } from '#imports'
import type { QgProfile, QgActivity, HelpRequest, Offer } from '~/types/qg'

definePageMeta({
  middleware: 'sidebase-auth'
})

useSeoMeta({
  title: 'Mon espace',
  robots: 'noindex'
})

const route = useRoute()
const router = useRouter()
const { $clientPosthog } = useNuxtApp()
const { data: session } = useAuth()
const noProfileCheckedAt = useState<number>('no-profile-checked-at', () => 0)
const { isDark, toggle: toggleTheme } = useQgTheme()
const themeLabel = computed(() => {
  if (isDark.value) return 'Passer en mode clair'
  return 'Passer en mode sombre'
})
const { data: requests, status: requestsStatus, refresh: refreshRequests } = useLazyFetch<HelpRequest[]>('/api/help-requests', { immediate: !QG_FROZEN })
const { data: activity, status: activityStatus, refresh: refreshActivity } = useLazyFetch<QgActivity>('/api/qg/activity')
const { data: myProjects, status: projectsStatus, refresh: refreshProjects } = useLazyFetch<any[]>('/api/side-projects/mine', { immediate: !QG_FROZEN })
const { data: offers, status: offersStatus, refresh: refreshOffers } = useLazyFetch<Offer[]>('/api/offers', { immediate: !QG_FROZEN })
const { data: profile, error: profileError, refresh: refreshProfile } = await useFetch<QgProfile | null>('/api/developers/me', {
  default: () => null
})

if (!profile.value && !profileError.value) {
  noProfileCheckedAt.value = Date.now()
  await navigateTo('/join', { replace: true })
}
const { data: isAdmin } = useLazyFetch('/api/admin/check', {
  default: () => false
})

const TABS = {
  ENTRAIDE: 'entraide',
  CHALLENGES: 'challenges',
  OPPORTUNITES: 'opportunites',
  PROFIL: 'profil',
} as const

const TAB_ALIASES = {
  offres: TABS.OPPORTUNITES,
  projects: TABS.OPPORTUNITES,
} as const

type TabType = typeof TABS[keyof typeof TABS]

const DEFAULT_TAB: TabType = QG_FROZEN ? TABS.PROFIL : TABS.ENTRAIDE

const navTabs: { key: TabType, label: string, icon: string }[] = QG_FROZEN
  ? []
  : [
      { key: TABS.ENTRAIDE, label: 'Entraide', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
      { key: TABS.OPPORTUNITES, label: 'Opportunités', icon: 'M2 9a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2zM16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16' },
      { key: TABS.PROFIL, label: 'Profil', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' }
    ]

function getTabFromQuery(tab: any): TabType {
  if (QG_FROZEN) return TABS.PROFIL
  if (tab === TABS.PROFIL) return TABS.PROFIL
  if (tab === TABS.CHALLENGES) return TABS.CHALLENGES
  if (tab === TABS.OPPORTUNITES || tab in TAB_ALIASES) {
    return TAB_ALIASES[tab as keyof typeof TAB_ALIASES] || TABS.OPPORTUNITES
  }
  return TABS.ENTRAIDE
}

const activeTab = ref<TabType>(getTabFromQuery(route.query.tab))
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

const lookingForDaysLeft = computed(() => {
  if (!profile.value?.lookingForSince || !profile.value?.lookingFor?.length) return null
  const since = new Date(profile.value.lookingForSince).getTime()
  const expiresAt = since + 30 * 24 * 60 * 60 * 1000
  return Math.ceil((expiresAt - Date.now()) / (24 * 60 * 60 * 1000))
})

const showLookingForBanner = computed(() => {
  if (lookingForDaysLeft.value === null) return false
  return lookingForDaysLeft.value <= 7
})

async function renewLookingFor() {
  if (!profile.value) return
  try {
    await $fetch(`/api/developers/${profile.value.id}`, {
      method: 'PUT',
      body: { lookingFor: profile.value.lookingFor }
    })
    await refreshProfile()
  } catch {
  }
}

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

async function retryProfile() {
  await refreshProfile()
  if (!profile.value && !profileError.value) await navigateTo('/join', { replace: true })
}

async function handleProfileSaved() {
  await Promise.all([refreshProfile(), refreshActivity()])
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
  activeTab.value = getTabFromQuery(tab)
})

watch(activeTab, (tab) => {
  router.replace({ query: tab === DEFAULT_TAB ? {} : { tab } })
  $clientPosthog?.capture('qg_tab_clicked', { tab })
})
const toast = useToast()

onMounted(() => {
  if (profile.value && !profile.value.emailOptInAsked) {
    showOptInModal.value = true
  }
  if (route.query.renewed === '1') {
    toast.success('Recherche renouvelée pour 30 jours')
    router.replace({ query: { tab: route.query.tab } })
  }
  if (route.query.deactivated === '1') {
    toast.success('Recherche désactivée')
    router.replace({ query: { tab: route.query.tab } })
  }
})
</script>

<template>
  <ClientOnly>
    <QgOptInModal v-if="showOptInModal" @choice="handleOptInChoice" />
  </ClientOnly>

  <div class="min-h-screen bg-background">
    <div class="sticky top-0 z-50 backdrop-blur-xl bg-background/80">
    <header class="px-4 md:px-8 pt-3">
      <div class="max-w-5xl mx-auto flex items-center justify-between pb-3">
        <NuxtLink to="/directory" class="flex items-center gap-2 no-underline text-foreground-muted hover:text-foreground transition-colors text-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Retour
        </NuxtLink>
        <h1 class="font-display text-2xl font-bold uppercase tracking-wider text-primary m-0">MON ESPACE</h1>
        <div class="flex items-center gap-3">
          <NuxtLink v-if="isAdmin" to="/admin" class="flex items-center justify-center w-8 h-8 rounded-full border border-border/10 text-foreground-muted hover:text-foreground hover:border-foreground-muted transition-colors" title="Dashboard admin">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
          </NuxtLink>
          <button @click="toggleTheme" class="flex items-center justify-center w-8 h-8 rounded-full border border-border/10 text-foreground-muted hover:text-foreground hover:border-foreground-muted transition-colors" :title="themeLabel">
            <svg v-if="isDark" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </button>
          <img v-if="session?.user?.image" :src="optimizedAvatar(session.user.image, 64)" :alt="session.user.name || ''" class="w-8 h-8 rounded-full border border-border/10" />
          <span v-else class="w-8 h-8 rounded-full bg-border/50"></span>
        </div>
      </div>
    </header>

    <nav v-if="navTabs.length" class="hidden md:block">
      <div class="max-w-5xl mx-auto px-6 flex items-center gap-8">
        <button
          v-for="tab in navTabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          :class="[
            'pt-3.5 pb-3.5 text-xs font-semibold uppercase tracking-widest transition-colors relative focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary rounded-sm',
            activeTab === tab.key
              ? 'text-foreground'
              : 'text-foreground-muted hover:text-foreground'
          ]"
        >
          {{ tab.label }}
          <span v-if="activeTab === tab.key" class="absolute bottom-0 left-0 right-0 h-[3px] bg-primary"></span>
        </button>
      </div>
    </nav>
    </div>

    <nav v-if="navTabs.length" class="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/20 pb-[env(safe-area-inset-bottom)]">
      <div class="flex justify-around">
        <button
          v-for="tab in navTabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          :class="[
            'flex flex-col items-center gap-1 pt-2.5 pb-2 px-4 text-[11px] font-medium transition-colors focus:outline-none focus-visible:outline-2 focus-visible:outline-primary',
            activeTab === tab.key ? 'text-primary' : 'text-foreground-muted'
          ]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path :d="tab.icon"/>
          </svg>
          {{ tab.label }}
        </button>
      </div>
    </nav>

    <div :class="['max-w-5xl mx-auto px-6 py-6 md:py-10 md:pb-10', navTabs.length ? 'pb-24' : 'pb-10']">
      <ClientOnly v-if="!QG_FROZEN">
        <div v-if="isLoadingActivity" class="mb-6 md:mb-8">
          <div class="flex flex-wrap gap-2">
            <div class="h-8 w-32 bg-border/10 rounded-full animate-pulse"></div>
            <div class="h-8 w-44 bg-border/10 rounded-full animate-pulse"></div>
          </div>
        </div>
        <QgWeeklyActivity
          v-else-if="activity && !activity.isNew"
          :activity="activity"
          class="mb-6 md:mb-8"
          @go-to-profile="activeTab = TABS.PROFIL"
        />
        <template #fallback>
          <div class="mb-6 md:mb-8">
            <div class="flex flex-wrap gap-2">
              <div class="h-8 w-32 bg-border/10 rounded-full animate-pulse"></div>
              <div class="h-8 w-44 bg-border/10 rounded-full animate-pulse"></div>
            </div>
          </div>
        </template>
      </ClientOnly>

      <div v-if="showLookingForBanner && !QG_FROZEN" class="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p v-if="lookingForDaysLeft! <= 0" class="text-sm text-amber-700 dark:text-amber-400 font-medium">Ta recherche active a expiré</p>
          <p v-else class="text-sm text-amber-700 dark:text-amber-400 font-medium">Ta recherche active expire dans {{ lookingForDaysLeft }} jour{{ lookingForDaysLeft! > 1 ? 's' : '' }}</p>
          <p class="text-xs text-foreground-muted mt-1">Renouvelle-la pour rester visible dans l'annuaire.</p>
        </div>
        <button @click="renewLookingFor" class="px-5 py-2.5 bg-foreground text-background rounded-full text-sm font-medium cursor-pointer transition-all hover:-translate-y-0.5 shrink-0">
          Renouveler
        </button>
      </div>

      <div v-if="activeTab === TABS.ENTRAIDE">
        <QgIncompleteProfileBanner
          v-if="!QG_FROZEN && !isLoadingActivity && activity?.profileComplete === false"
          :missing-fields="activity?.missingFields || []"
          context="à l'entraide"
          class="mb-8"
          @go-to-profile="activeTab = TABS.PROFIL"
        />

        <section v-if="!QG_FROZEN" class="mb-8 md:mb-10">
          <NuxtLink
            v-if="activity?.profileComplete !== false"
            to="/qg/ask"
            class="group block bg-primary p-6 md:p-8 rounded-2xl transition-all hover:brightness-110 hover:-translate-y-0.5 active:translate-y-px no-underline"
          >
            <div class="flex items-center justify-between gap-4">
              <div>
                <h2 class="text-xl md:text-2xl font-display font-bold uppercase tracking-wide text-white">
                  Un problème ?
                </h2>
                <p class="text-white/80 text-sm mt-1">
                  Décris ton souci, la communauté t'aide.
                </p>
              </div>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-white shrink-0 group-hover:translate-x-1 transition-transform">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </div>
          </NuxtLink>
          <div
            v-else
            class="block bg-foreground/[0.04] border-2 border-border/10 p-6 md:p-8 rounded-2xl cursor-not-allowed"
          >
            <div class="flex items-start justify-between gap-4">
              <div>
                <h2 class="text-xl md:text-2xl font-display font-bold uppercase tracking-wide text-foreground-muted/30">
                  Un problème ?
                </h2>
                <p class="text-foreground-muted/20 text-sm mt-1">
                  Complète ton profil pour demander de l'aide
                </p>
              </div>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-foreground-muted/15 shrink-0">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
          </div>
        </section>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
          <aside class="lg:col-span-4">
            <div class="lg:sticky lg:top-[100px]">
              <div class="p-5 rounded-2xl border-2 border-border/15">
                <h2 class="text-sm font-display font-bold uppercase tracking-wide mb-5">Tes demandes</h2>

                <div v-if="isLoadingRequests || openRequests.length > 0 || closedRequests.length > 0">
                  <QgRequestsList
                    :open-requests="openRequests"
                    :closed-requests="closedRequests"
                    :is-loading="isLoadingRequests"
                    @mark-resolved="handleMarkResolved"
                  />
                </div>
                <div v-else class="py-8 text-center">
                  <p class="text-foreground-muted text-xs">Aucun problème posté</p>
                </div>
              </div>
            </div>
          </aside>

          <section class="lg:col-span-8">
            <QgFeed :is-admin="isAdmin" />
          </section>
        </div>
      </div>

      <div v-if="activeTab === TABS.CHALLENGES">
        <QgIncompleteProfileBanner
          v-if="!isLoadingActivity && activity?.profileComplete === false"
          :missing-fields="activity?.missingFields || []"
          context="aux challenges"
          class="mb-8"
          @go-to-profile="activeTab = TABS.PROFIL"
        />
        <QgChallenges v-else />
      </div>

      <div v-if="activeTab === TABS.OPPORTUNITES">
        <template v-if="QG_FROZEN" />
        <div v-else-if="activity?.profileComplete !== false" class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 md:mb-10">
          <NuxtLink
            to="/qg/new-offer"
            class="group block bg-primary p-5 rounded-2xl transition-all hover:brightness-110 hover:-translate-y-0.5 active:translate-y-px no-underline"
          >
            <div class="flex items-center justify-between">
              <div>
                <span class="block text-sm font-bold text-white uppercase tracking-wide">Poster une offre</span>
                <span class="block text-xs text-white/80 mt-0.5">Alternance, stage, CDI...</span>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-white/80 shrink-0 group-hover:translate-x-0.5 transition-transform">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </div>
          </NuxtLink>
          <NuxtLink
            to="/qg/new-project"
            class="group block border-2 border-primary/30 p-5 rounded-2xl transition-all hover:border-primary/60 hover:bg-primary/[0.05] hover:-translate-y-0.5 active:translate-y-px no-underline"
          >
            <div class="flex items-center justify-between">
              <div>
                <span class="block text-sm font-bold text-foreground uppercase tracking-wide">Side project</span>
                <span class="block text-xs text-foreground-muted mt-0.5">Trouve des contributrices</span>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-primary shrink-0 group-hover:translate-x-0.5 transition-transform">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </div>
          </NuxtLink>
        </div>
        <QgIncompleteProfileBanner
          v-else
          :missing-fields="activity?.missingFields || []"
          context="aux opportunités"
          class="mb-8"
          @go-to-profile="activeTab = TABS.PROFIL"
        />

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
          <aside class="lg:col-span-4">
            <div class="lg:sticky lg:top-[100px]">
              <div class="p-5 rounded-2xl border-2 border-border/15">
                <h2 class="text-sm font-display font-bold uppercase tracking-wide mb-5">Tes publications</h2>

                <div v-if="myOffers.length > 0 || (myProjects || []).length > 0">
                  <QgMyOffersList
                    :offers="myOffers"
                    :is-loading="isLoadingOffers"
                    :current-user-id="profile?.id"
                    @deleted="refreshOffers()"
                  />
                  <QgMyProjectsList
                    :projects="myProjects || []"
                    :is-loading="isLoadingProjects"
                    @mark-completed="handleMarkProjectCompleted"
                  />
                </div>
                <div v-else class="py-8 text-center">
                  <p class="text-foreground-muted text-xs">Aucune publication</p>
                </div>
              </div>
            </div>
          </aside>

          <section class="lg:col-span-8 space-y-10">
            <QgOffersList
              :offers="offers || []"
              :is-loading="isLoadingOffers"
              :current-user-id="profile?.id"
            />
            <QgSideProjectsList />
          </section>
        </div>
      </div>

      <div v-if="activeTab === TABS.PROFIL" class="max-w-6xl">
        <div v-if="profileError" role="alert" class="max-w-3xl p-6 rounded-2xl border border-border/15">
          <p class="font-display text-xl font-medium">On n'arrive pas à charger ton profil.</p>
          <p class="mt-2 text-sm text-foreground-muted">Ce n'est pas de ton fait : réessaie dans un instant.</p>
          <button type="button" class="mt-5 px-5 py-2.5 rounded-full border border-border/20 text-sm cursor-pointer hover:border-foreground/50 transition-colors" @click="retryProfile">
            Réessayer
          </button>
        </div>
        <QgProfileSummary
          v-if="QG_FROZEN && profile"
          :profile="profile"
          :activity="activity ?? null"
          :looking-for-days-left="lookingForDaysLeft"
          class="mb-10 max-w-3xl"
          @renew="renewLookingFor"
        />
        <QgProfileForm
          v-if="profile"
          :profile="profile"
          @saved="handleProfileSaved"
        />
      </div>
    </div>
  </div>
</template>
