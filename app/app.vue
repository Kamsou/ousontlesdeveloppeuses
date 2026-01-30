<script setup lang="ts">
const { $clientPosthog } = useNuxtApp()
const { data, status, signIn, signOut } = useAuth()
const route = useRoute()
const isQg = computed(() => route.path.startsWith('/qg'))

const { data: isAdmin, refresh: refreshAdmin } = useFetch('/api/admin/check', {
  immediate: false,
  default: () => false
})

const { data: profile, refresh: refreshProfile } = useLazyFetch<{ name: string } | null>('/api/developers/me', {
  immediate: false,
  default: () => null
})

const displayName = computed(() => profile.value?.name || data.value?.user?.name)

const menuOpen = ref(false)
const userMenuOpen = ref(false)
const resourcesMenuOpen = ref(false)

function handleClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.user-menu')) {
    userMenuOpen.value = false
  }
  if (!target.closest('.resources-menu')) {
    resourcesMenuOpen.value = false
  }
}

function handleSignIn(source: string) {
  $clientPosthog?.capture('signup_clicked', { source })
  signIn('github')
}

watch(() => status.value, (newStatus, oldStatus) => {
  if (newStatus === 'authenticated') {
    refreshAdmin()
    refreshProfile()
    const user = data.value?.user
    $clientPosthog?.identify((user as any)?.id, { name: user?.name, email: user?.email })

    if (oldStatus === 'unauthenticated') {
      $clientPosthog?.capture('signup_completed')
    }
  } else if (newStatus === 'unauthenticated') {
    $clientPosthog?.reset()
  }
}, { immediate: true })

watch(() => route.path, () => {
  menuOpen.value = false
  userMenuOpen.value = false
  resourcesMenuOpen.value = false
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="min-h-screen flex flex-col relative bg-background text-foreground">
    <header v-if="!isQg" class="fixed top-0 left-0 right-0 z-50 px-4 md:px-8 py-4 backdrop-blur-xl bg-background/80 border-b border-border">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center gap-3 no-underline text-foreground group z-10">
          <span class="flex flex-col gap-[3px] w-[18px]">
            <span class="h-0.5 bg-foreground rounded-sm transition-all duration-300 w-full group-hover:w-2/5"></span>
            <span class="h-0.5 bg-foreground rounded-sm transition-all duration-300 w-[70%] group-hover:w-full"></span>
            <span class="h-0.5 bg-foreground rounded-sm transition-all duration-300 w-2/5 group-hover:w-[70%]"></span>
          </span>
          <span class="font-display text-base font-semibold tracking-widest">OSLD</span>
        </NuxtLink>

        <nav aria-label="Navigation principale" class="hidden lg:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
          <NuxtLink to="/annuaire" :class="['no-underline text-sm font-medium transition-colors whitespace-nowrap', route.path.startsWith('/annuaire') || route.path.startsWith('/profil/') ? 'text-foreground' : 'text-foreground-muted hover:text-foreground']">Annuaire</NuxtLink>
          <NuxtLink to="/speakers" :class="['no-underline text-sm font-medium transition-colors whitespace-nowrap', route.path === '/speakers' ? 'text-foreground' : 'text-foreground-muted hover:text-foreground']">Speakeuses</NuxtLink>
          <div class="relative resources-menu">
            <button
              @click.stop="resourcesMenuOpen = !resourcesMenuOpen"
              :class="['flex items-center gap-1 text-sm font-medium transition-colors whitespace-nowrap cursor-pointer bg-transparent border-none', ['/entreprises', '/programmes', '/podcasts'].includes(route.path) ? 'text-foreground' : 'text-foreground-muted hover:text-foreground']"
            >
              Ressources
              <svg :class="['w-3.5 h-3.5 transition-transform', resourcesMenuOpen ? 'rotate-180' : '']" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </button>
            <div v-if="resourcesMenuOpen" class="absolute left-0 top-full mt-2 w-44 py-2 bg-background border border-border rounded-lg shadow-xl">
              <NuxtLink to="/entreprises" :class="['flex items-center gap-2 px-4 py-2 text-sm no-underline transition-colors', route.path === '/entreprises' ? 'text-foreground bg-border/30' : 'text-foreground-muted hover:bg-border/30 hover:text-foreground']">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 21h18M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/>
                </svg>
                Entreprises
              </NuxtLink>
              <NuxtLink to="/programmes" :class="['flex items-center gap-2 px-4 py-2 text-sm no-underline transition-colors', route.path === '/programmes' ? 'text-foreground bg-border/30' : 'text-foreground-muted hover:bg-border/30 hover:text-foreground']">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                </svg>
                Programmes
              </NuxtLink>
              <NuxtLink to="/podcasts" :class="['flex items-center gap-2 px-4 py-2 text-sm no-underline transition-colors', route.path === '/podcasts' ? 'text-foreground bg-border/30' : 'text-foreground-muted hover:bg-border/30 hover:text-foreground']">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
                Podcasts
              </NuxtLink>
            </div>
          </div>
          <NuxtLink to="/experience" :class="['no-underline text-sm font-medium transition-all whitespace-nowrap px-3 py-1 rounded-full border', route.path === '/experience' ? 'text-foreground border-foreground/40' : 'text-foreground-muted border-border hover:text-foreground hover:border-foreground/40']">Quiz</NuxtLink>
          <a href="https://github.com/Kamsou/ousontlesdevs" target="_blank" rel="noopener noreferrer" class="text-foreground-muted no-underline text-sm font-medium transition-colors hover:text-foreground whitespace-nowrap flex items-center gap-1.5">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            Contribuer
          </a>
        </nav>

        <div class="flex items-center gap-4">
          <template v-if="status === 'loading'">
            <div class="w-10 h-10 bg-background-card rounded-full opacity-50"></div>
          </template>
          <template v-else-if="status !== 'authenticated'">
            <button @click="handleSignIn('header')" class="hidden lg:inline-flex items-center gap-2 px-5 py-2.5 rounded-sm text-sm font-medium cursor-pointer transition-all bg-foreground border border-b-[3px] border-foreground border-b-foreground-muted/50 text-background hover:-translate-y-0.5 hover:shadow-glow active:translate-y-px active:border-b active:shadow-none">
              <svg class="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Connexion GitHub
            </button>
          </template>
          <template v-else>
            <div class="hidden lg:block relative user-menu">
              <button @click.stop="userMenuOpen = !userMenuOpen" class="flex items-center gap-2 cursor-pointer bg-transparent border-none">
                <img :src="data?.user?.image || ''" :alt="data?.user?.name || ''" class="w-9 h-9 rounded-full border-2 border-foreground/30" />
                <svg :class="['w-4 h-4 text-foreground-muted transition-transform', userMenuOpen ? 'rotate-180' : '']" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>
              <div v-if="userMenuOpen" class="absolute right-0 top-full mt-2 w-48 py-2 bg-background border border-border rounded-lg shadow-xl">
                <div class="px-4 py-2 border-b border-border">
                  <p class="font-medium text-sm text-foreground truncate">{{ displayName }}</p>
                </div>
                <NuxtLink to="/qg" class="flex items-center gap-2 px-4 py-2 text-sm text-foreground-muted no-underline hover:bg-border/30 hover:text-foreground transition-colors">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                  Mon QG
                </NuxtLink>
                <NuxtLink v-if="isAdmin" to="/admin" class="flex items-center gap-2 px-4 py-2 text-sm text-foreground-muted no-underline hover:bg-border/30 hover:text-foreground transition-colors">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="7" height="7"/>
                    <rect x="14" y="3" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/>
                  </svg>
                  Dashboard
                </NuxtLink>
                <button @click="signOut()" class="flex items-center gap-2 w-full px-4 py-2 text-sm text-foreground-muted bg-transparent border-none cursor-pointer hover:bg-border/30 hover:text-foreground transition-colors">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Déconnexion
                </button>
              </div>
            </div>
            <NuxtLink to="/profil" class="lg:hidden">
              <img :src="data?.user?.image || ''" :alt="data?.user?.name || ''" class="w-9 h-9 rounded-full border-2 border-foreground/30" />
            </NuxtLink>
          </template>

          <button @click="menuOpen = !menuOpen" :aria-label="menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'" :aria-expanded="menuOpen" class="lg:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5 cursor-pointer bg-transparent border-none">
            <span :class="['h-0.5 w-5 bg-foreground rounded-sm transition-all duration-300', menuOpen ? 'rotate-45 translate-y-2' : '']"></span>
            <span :class="['h-0.5 w-5 bg-foreground rounded-sm transition-all duration-300', menuOpen ? 'opacity-0' : '']"></span>
            <span :class="['h-0.5 w-5 bg-foreground rounded-sm transition-all duration-300', menuOpen ? '-rotate-45 -translate-y-2' : '']"></span>
          </button>
        </div>
      </div>
    </header>

    <div v-if="menuOpen && !isQg" class="fixed inset-0 z-40 bg-background pt-20 px-6 lg:hidden overflow-y-auto flex flex-col">
      <nav aria-label="Navigation mobile" class="flex flex-col gap-1 py-6 flex-1">
        <NuxtLink to="/annuaire" :class="['no-underline text-lg font-medium px-3 py-2.5 rounded-xl transition-colors', route.path.startsWith('/annuaire') || route.path.startsWith('/profil/') ? 'text-foreground bg-white/5' : 'text-foreground-muted']">Annuaire</NuxtLink>
        <NuxtLink to="/speakers" :class="['no-underline text-lg font-medium px-3 py-2.5 rounded-xl transition-colors', route.path === '/speakers' ? 'text-foreground bg-white/5' : 'text-foreground-muted']">Speakeuses</NuxtLink>
        <div class="flex flex-col gap-0.5 mt-1">
          <span :class="['text-lg font-medium px-3 py-2.5', ['/entreprises', '/programmes', '/podcasts'].includes(route.path) ? 'text-foreground' : 'text-foreground-muted']">Ressources</span>
          <div class="flex flex-col gap-0.5 ml-3 pl-3 border-l border-border/30">
            <NuxtLink to="/entreprises" :class="['no-underline text-base px-3 py-2 rounded-xl transition-colors', route.path === '/entreprises' ? 'text-foreground bg-white/5' : 'text-foreground-muted']">Entreprises</NuxtLink>
            <NuxtLink to="/programmes" :class="['no-underline text-base px-3 py-2 rounded-xl transition-colors', route.path === '/programmes' ? 'text-foreground bg-white/5' : 'text-foreground-muted']">Programmes</NuxtLink>
            <NuxtLink to="/podcasts" :class="['no-underline text-base px-3 py-2 rounded-xl transition-colors', route.path === '/podcasts' ? 'text-foreground bg-white/5' : 'text-foreground-muted']">Podcasts</NuxtLink>
          </div>
        </div>
        <NuxtLink to="/experience" :class="['no-underline text-lg font-medium px-3 py-2.5 rounded-xl transition-colors inline-flex items-center gap-2 mt-1', route.path === '/experience' ? 'text-foreground bg-white/5' : 'text-foreground-muted']">
          Quiz
          <span class="text-[10px] px-1.5 py-0.5 rounded-full border border-foreground/20 text-foreground-muted leading-none">Fun</span>
        </NuxtLink>
        <a href="https://github.com/Kamsou/ousontlesdevs" target="_blank" rel="noopener noreferrer" class="text-foreground-muted no-underline text-lg font-medium px-3 py-2.5 rounded-xl inline-flex items-center gap-2.5">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          Contribuer
        </a>
      </nav>

      <div class="py-6 border-t border-border/20">
        <template v-if="status !== 'authenticated'">
          <button @click="handleSignIn('mobile_menu')" class="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm font-medium cursor-pointer transition-all bg-foreground border border-b-[3px] border-foreground border-b-foreground-muted/50 text-background hover:-translate-y-0.5 hover:shadow-glow active:translate-y-px active:border-b active:shadow-none">
            <svg class="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            Connexion GitHub
          </button>
        </template>
        <template v-else>
          <div class="flex flex-col gap-3">
            <NuxtLink to="/qg" class="flex items-center gap-3 no-underline text-foreground px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors">
              <img :src="data?.user?.image || ''" :alt="data?.user?.name || ''" class="w-10 h-10 rounded-full border-2 border-foreground/30" />
              <div class="flex flex-col min-w-0">
                <span class="font-medium text-sm truncate">{{ displayName }}</span>
                <span class="text-xs text-foreground-muted">Mon QG</span>
              </div>
            </NuxtLink>
            <NuxtLink v-if="isAdmin" to="/admin" class="text-foreground-muted no-underline text-sm font-medium px-3 py-2 rounded-xl hover:bg-white/5 hover:text-foreground transition-colors">Admin</NuxtLink>
            <button @click="signOut()" class="w-full inline-flex items-center justify-center px-6 py-3 rounded-full text-sm cursor-pointer transition-all border border-b-[3px] border-border border-b-foreground-muted/50 bg-transparent text-foreground-muted hover:text-foreground hover:border-foreground-muted/40 hover:bg-foreground/[0.03] hover:-translate-y-0.5 active:translate-y-px active:border-b active:shadow-none">Déconnexion</button>
          </div>
        </template>
      </div>
    </div>

    <main :class="['flex-1 relative z-[1]', isQg ? '' : 'pt-20']">
      <NuxtPage />
    </main>

    <footer v-if="!isQg" class="relative z-[1] text-center py-8 text-foreground-muted text-sm border-t border-border">
      <p>Fait pour toutes les développeuses par <a href="https://linkedin.com/in/camillecoutens" target="_blank" rel="noopener noreferrer" class="text-foreground-muted underline underline-offset-2 decoration-border hover:text-foreground hover:decoration-foreground transition-colors">Camille Coutens</a></p>
      <span class="inline-flex gap-4 mt-3">
        <NuxtLink to="/coc" class="text-foreground-muted underline underline-offset-2 decoration-border hover:text-foreground transition-colors">Code de conduite</NuxtLink>
        <NuxtLink to="/legal" class="text-foreground-muted underline underline-offset-2 decoration-border hover:text-foreground transition-colors">Mentions légales</NuxtLink>
      </span>
    </footer>

    <ToastContainer />
  </div>
</template>

