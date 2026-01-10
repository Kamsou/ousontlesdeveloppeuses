<script setup lang="ts">
const { data, status, signIn, signOut } = useAuth()
const route = useRoute()
const isHome = computed(() => route.path === '/')
const menuOpen = ref(false)
const userMenuOpen = ref(false)

const { data: isAdmin, refresh: refreshAdmin } = useFetch('/api/admin/check', {
  immediate: status.value === 'authenticated',
  default: () => false
})

watch(() => status.value, (newStatus) => {
  if (newStatus === 'authenticated') {
    refreshAdmin()
  }
})

watch(() => route.path, () => {
  menuOpen.value = false
  userMenuOpen.value = false
})

function handleClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.user-menu')) {
    userMenuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="min-h-screen flex flex-col relative bg-bg text-text">
    <header class="fixed top-0 left-0 right-0 z-50 px-4 md:px-8 py-4 backdrop-blur-xl bg-bg/80 border-b border-border">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center gap-3 no-underline text-text group z-10">
          <span class="flex flex-col gap-[3px] w-[18px]">
            <span class="h-0.5 bg-text rounded-sm transition-all duration-300 w-full group-hover:w-2/5"></span>
            <span class="h-0.5 bg-text rounded-sm transition-all duration-300 w-[70%] group-hover:w-full"></span>
            <span class="h-0.5 bg-text rounded-sm transition-all duration-300 w-2/5 group-hover:w-[70%]"></span>
          </span>
          <span class="font-display text-base font-semibold tracking-widest">OSLD</span>
        </NuxtLink>

        <nav class="hidden lg:flex gap-6 absolute left-1/2 -translate-x-1/2">
          <NuxtLink v-if="!isHome" to="/" class="text-text-muted no-underline text-sm font-medium transition-colors hover:text-text whitespace-nowrap">Accueil</NuxtLink>
          <NuxtLink to="/annuaire" class="text-text-muted no-underline text-sm font-medium transition-colors hover:text-text whitespace-nowrap">Annuaire</NuxtLink>
          <NuxtLink to="/speakers" class="text-text-muted no-underline text-sm font-medium transition-colors hover:text-text whitespace-nowrap">Speakeuses</NuxtLink>
          <NuxtLink to="/entreprises" class="text-text-muted no-underline text-sm font-medium transition-colors hover:text-text whitespace-nowrap">Entreprises</NuxtLink>
          <NuxtLink to="/experience" class="text-text-muted no-underline text-sm font-medium transition-colors hover:text-text whitespace-nowrap">Quiz</NuxtLink>
          <a href="https://github.com/Kamsou/ousontlesdevs" target="_blank" rel="noopener noreferrer" class="text-text-muted no-underline text-sm font-medium transition-colors hover:text-text whitespace-nowrap">Contribuer</a>
        </nav>

        <div class="flex items-center gap-4">
          <template v-if="status === 'loading'">
            <div class="w-10 h-10 bg-bg-card rounded-full opacity-50"></div>
          </template>
          <template v-else-if="status !== 'authenticated'">
            <button @click="signIn('github')" class="hidden lg:inline-flex items-center gap-2 px-5 py-2.5 rounded-sm text-sm font-medium cursor-pointer transition-all border-none bg-text text-bg hover:bg-text-muted">
              <svg class="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Connexion GitHub
            </button>
          </template>
          <template v-else>
            <div class="hidden lg:block relative user-menu">
              <button @click.stop="userMenuOpen = !userMenuOpen" class="flex items-center gap-2 cursor-pointer bg-transparent border-none">
                <img :src="data?.user?.image || ''" :alt="data?.user?.name || ''" class="w-9 h-9 rounded-full border-2 border-primary" />
                <svg :class="['w-4 h-4 text-text-muted transition-transform', userMenuOpen ? 'rotate-180' : '']" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>
              <div v-if="userMenuOpen" class="absolute right-0 top-full mt-2 w-48 py-2 bg-bg border border-border rounded-lg shadow-xl">
                <div class="px-4 py-2 border-b border-border">
                  <p class="font-medium text-sm text-text truncate">{{ data?.user?.name }}</p>
                </div>
                <NuxtLink to="/profil" class="flex items-center gap-2 px-4 py-2 text-sm text-text-muted no-underline hover:bg-border/30 hover:text-text transition-colors">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  Mon profil
                </NuxtLink>
                <NuxtLink v-if="isAdmin" to="/admin" class="flex items-center gap-2 px-4 py-2 text-sm text-primary no-underline hover:bg-border/30 transition-colors">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="7" height="7"/>
                    <rect x="14" y="3" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/>
                  </svg>
                  Dashboard
                </NuxtLink>
                <button @click="signOut()" class="flex items-center gap-2 w-full px-4 py-2 text-sm text-text-muted bg-transparent border-none cursor-pointer hover:bg-border/30 hover:text-text transition-colors">
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
              <img :src="data?.user?.image || ''" :alt="data?.user?.name || ''" class="w-9 h-9 rounded-full border-2 border-primary" />
            </NuxtLink>
          </template>

          <button @click="menuOpen = !menuOpen" class="lg:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5 cursor-pointer bg-transparent border-none">
            <span :class="['h-0.5 w-5 bg-text rounded-sm transition-all duration-300', menuOpen ? 'rotate-45 translate-y-2' : '']"></span>
            <span :class="['h-0.5 w-5 bg-text rounded-sm transition-all duration-300', menuOpen ? 'opacity-0' : '']"></span>
            <span :class="['h-0.5 w-5 bg-text rounded-sm transition-all duration-300', menuOpen ? '-rotate-45 -translate-y-2' : '']"></span>
          </button>
        </div>
      </div>
    </header>

    <div v-if="menuOpen" class="fixed inset-0 z-40 bg-bg pt-20 px-6 lg:hidden">
      <nav class="flex flex-col gap-6 py-8">
        <NuxtLink v-if="!isHome" to="/" class="text-text no-underline text-2xl font-medium">Accueil</NuxtLink>
        <NuxtLink to="/annuaire" class="text-text no-underline text-2xl font-medium">Annuaire</NuxtLink>
        <NuxtLink to="/speakers" class="text-text no-underline text-2xl font-medium">Speakeuses</NuxtLink>
        <NuxtLink to="/entreprises" class="text-text no-underline text-2xl font-medium">Entreprises</NuxtLink>
        <NuxtLink to="/experience" class="text-text no-underline text-2xl font-medium">Ton Profil dev</NuxtLink>
        <a href="https://github.com/Kamsou/ousontlesdevs" target="_blank" rel="noopener noreferrer" class="text-text no-underline text-2xl font-medium">Contribuer</a>
      </nav>
      <div class="pt-6 border-t border-border">
        <template v-if="status !== 'authenticated'">
          <button @click="signIn('github')" class="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-base font-medium cursor-pointer transition-all border-none bg-text text-bg hover:bg-text-muted">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            Connexion GitHub
          </button>
        </template>
        <template v-else>
          <div class="flex flex-col gap-4">
            <NuxtLink v-if="isAdmin" to="/admin" class="text-primary no-underline text-xl font-medium">Admin</NuxtLink>
            <NuxtLink to="/profil" class="flex items-center gap-3 no-underline text-text">
              <img :src="data?.user?.image || ''" :alt="data?.user?.name || ''" class="w-10 h-10 rounded-full border-2 border-primary" />
              <span class="font-medium">{{ data?.user?.name }}</span>
            </NuxtLink>
            <button @click="signOut()" class="inline-flex items-center justify-center px-6 py-3 rounded-lg text-base font-medium cursor-pointer transition-all bg-transparent text-text-muted border border-border hover:bg-bg-card hover:text-text">Déconnexion</button>
          </div>
        </template>
      </div>
    </div>

    <main class="flex-1 relative z-[1] pt-20">
      <NuxtPage />
    </main>

    <footer class="relative z-[1] text-center py-8 text-text-muted text-sm border-t border-border">
      <p>Fait pour toutes les développeuses par <a href="https://linkedin.com/in/camillecoutens" target="_blank" rel="noopener noreferrer" class="text-text-muted underline underline-offset-2 decoration-border hover:text-primary hover:decoration-primary transition-colors">Camille Coutens</a></p>
    </footer>
  </div>
</template>

