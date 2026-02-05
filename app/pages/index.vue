<script setup lang="ts">
import { openToOptions } from '~/utils/constants'

const { $clientPosthog } = useNuxtApp()
const { status, signIn } = useAuth()

useHead({
  titleTemplate: '%s',
})

useSeoMeta({
  title: 'Où Sont Les Développeuses (OSLD) - Annuaire des développeuses tech en France',
  description: 'Annuaire des développeuses tech en France : profils, speakeuses pour vos conférences, entreprises inclusives et entraide communautaire. Rejoignez OSLD.',
  ogTitle: 'Où Sont Les Développeuses - Annuaire & communauté tech',
  ogDescription: 'Annuaire des développeuses en France. Trouvez des profils tech, des speakeuses pour vos événements et des entreprises inclusives.',
  ogImage: 'https://ousontlesdeveloppeuses.fr/og-image.png',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Où Sont Les Développeuses - Annuaire & communauté tech',
  twitterDescription: 'Annuaire des développeuses en France. Profils tech, speakeuses, entreprises inclusives et entraide communautaire.',
  twitterImage: 'https://ousontlesdeveloppeuses.fr/og-image.png',
})

useSchemaOrg([
  defineWebSite({
    name: 'Où Sont Les Développeuses',
    alternateName: 'OSLD',
    description: 'Annuaire des développeuses tech en France',
    inLanguage: 'fr-FR',
  }),
  defineWebPage({
    name: 'Où Sont Les Développeuses - Annuaire des développeuses tech en France',
    description: 'Annuaire des développeuses tech en France : profils, speakeuses pour vos conférences, entreprises inclusives et entraide communautaire.',
  }),
])

const { data: statsData, status: statsStatus } = useLazyFetch('/api/stats', {
  server: false
})

const statsLoading = computed(() => statsStatus.value === 'pending')

function pluralize(count: number, singular: string, plural: string) {
  return count <= 1 ? singular : plural
}

function handleCreateProfile() {
  $clientPosthog?.capture('cta_clicked', { cta: 'create_profile' })
  if (status.value === 'authenticated') {
    navigateTo('/profil')
  } else {
    signIn('github')
  }
}

const stats = computed(() => {
  const devs = statsData.value?.developers || 0
  const companies = statsData.value?.companies || 0
  const locations = statsData.value?.locations || 0
  const speakers = statsData.value?.speakers || 0

  return [
    { value: devs, label: pluralize(devs, 'Développeuse', 'Développeuses') },
    { value: companies, label: pluralize(companies, 'Entreprise', 'Entreprises') },
    { value: locations, label: pluralize(locations, 'Ville', 'Villes') },
    { value: speakers, label: pluralize(speakers, 'Speakeuse', 'Speakeuses') }
  ]
})

const openToTags = openToOptions.map(o => o.label)

const features = [
  {
    number: '01',
    title: 'Speakeuses',
    description: 'Trouvez des speakeuses pour vos événements tech. Filtrez par sujet, disponibilité et localisation.',
    link: '/speakers',
    external: false
  },
  {
    number: '02',
    title: 'Disponible pour...',
    description: 'Chaque profil indique ses disponibilités : conférence, mentoring, freelance, CDI, coffee chat, pair programming, relecture CV.',
    link: '/annuaire',
    external: false
  },
  {
    number: '03',
    title: 'Quiz Dev',
    description: 'Découvre ton profil de développeuse grâce à notre quiz IA. Un moment fun pour mieux te connaître.',
    link: '/experience',
    external: false
  },
  {
    number: '04',
    title: 'Open Source',
    description: 'OSLD est 100% open source. Contribue au projet, propose des features ou signale des bugs sur GitHub.',
    link: 'https://github.com/Kamsou/ousontlesdevs',
    external: true
  }
]
</script>

<template>
  <div class="max-w-[1600px] mx-auto">
    <section class="min-h-[calc(100vh-80px)] flex flex-col justify-center px-4 md:px-16 py-16 md:py-8 relative">
      <div class="max-w-4xl">
        <div class="overflow-hidden">
          <NuxtLink to="/experience" class="hidden md:inline-flex items-center gap-2 text-foreground-muted text-xs uppercase tracking-widest mb-8 no-underline hover:text-foreground transition-colors animate-slide-up">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <path d="M12 17h.01"/>
            </svg>
            Découvre quel profil dev tu es →
          </NuxtLink>
        </div>
        <h1 class="font-display text-5xl md:text-[clamp(3.5rem,10vw,8rem)] font-medium leading-[0.95] tracking-tight mb-8">
          <span class="block overflow-hidden">
            <span class="inline-block mr-[0.2em] animate-slide-up animation-delay-100">Où</span>
            <span class="inline-block mr-[0.2em] animate-slide-up animation-delay-150">sont</span>
            <span class="inline-block animate-slide-up animation-delay-200">les</span>
          </span>
          <span class="block overflow-hidden title-stroke transition-all duration-400">
            <span class="inline-block animate-slide-up animation-delay-250">développeuses</span>
          </span>
        </h1>

        <div class="overflow-hidden">
          <p class="text-sm md:text-lg text-foreground-muted max-w-xl leading-relaxed mb-12 animate-slide-up animation-delay-300">
            Parce qu'on a besoin de voir des développeuses pour en devenir une.
          </p>
        </div>

        <div>
          <div class="flex gap-4 items-center flex-wrap animate-slide-up animation-delay-400">
          <NuxtLink to="/annuaire" class="group flex items-center gap-4 px-6 py-4 bg-foreground border border-b-[3px] border-foreground border-b-foreground-muted/50 text-background rounded-full text-sm font-medium cursor-pointer transition-all hover:gap-6 hover:pr-5 hover:-translate-y-0.5 hover:shadow-glow active:translate-y-px active:border-b active:shadow-none no-underline">
            <span>Découvrir les profils</span>
            <span class="flex transition-transform group-hover:translate-x-1">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </span>
          </NuxtLink>
          <button @click="handleCreateProfile" class="px-6 py-4 bg-transparent text-foreground border border-b-[3px] border-border/10 border-b-border/30 rounded-full text-sm font-medium cursor-pointer transition-all hover:border-foreground hover:bg-foreground hover:text-background hover:-translate-y-0.5 active:translate-y-px active:border-b">
            Devenir visible
          </button>
          </div>
        </div>

      </div>

      <div class="hidden md:flex absolute bottom-8 right-16 flex-col items-center gap-4">
        <span class="text-[0.65rem] uppercase tracking-[0.2em] text-foreground-muted [writing-mode:vertical-rl]">Scroll</span>
        <div class="relative w-px h-16 bg-foreground/20 overflow-hidden">
          <span class="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-foreground to-transparent scroll-line"></span>
        </div>
      </div>
    </section>

    <div class="py-6 border-y border-border/10 overflow-hidden">
      <div class="flex gap-4 w-max animate-scroll">
        <span v-for="(tag, i) in [...openToTags, ...openToTags]" :key="i" class="flex-shrink-0 px-4 py-2 border border-border/10 rounded-full text-sm text-foreground-muted transition-all hover:border-foreground hover:text-foreground">
          {{ tag }}
        </span>
      </div>
    </div>

    <section class="py-24 px-4 md:px-16">
      <p class="text-foreground-muted text-sm uppercase tracking-widest mb-12">Elles sont déjà là. Rejoins-les.</p>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div v-for="(stat, index) in stats" :key="index" class="flex flex-col gap-6 py-8 border-t border-border/10">
          <span class="text-[0.7rem] text-foreground-muted tracking-widest">0{{ index + 1 }}</span>
          <div class="flex flex-col gap-1">
            <ClientOnly>
              <template v-if="statsLoading">
                <span class="font-display text-4xl md:text-6xl font-medium tracking-tight">
                  <span class="inline-block w-16 h-10 md:h-14 bg-border/50 rounded animate-pulse"></span>
                </span>
                <span class="inline-block w-24 h-4 bg-border/50 rounded animate-pulse"></span>
              </template>
              <template v-else>
                <span class="font-display text-4xl md:text-6xl font-medium tracking-tight">{{ stat.value }}</span>
                <span class="text-foreground-muted text-sm">{{ stat.label }}</span>
              </template>
              <template #fallback>
                <span class="font-display text-4xl md:text-6xl font-medium tracking-tight">
                  <span class="inline-block w-16 h-10 md:h-14 bg-border/50 rounded animate-pulse"></span>
                </span>
                <span class="inline-block w-24 h-4 bg-border/50 rounded animate-pulse"></span>
              </template>
            </ClientOnly>
          </div>
        </div>
      </div>
    </section>

    <section class="py-24 px-4 md:px-16 border-t border-border/10">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <span class="block text-[0.7rem] uppercase tracking-[0.2em] text-foreground-muted mb-4">Le QG</span>
          <h2 class="font-display text-3xl md:text-5xl font-medium leading-tight tracking-tight mb-6">
            Le QG des développeuses
          </h2>
          <p class="text-foreground-muted text-base leading-relaxed mb-8 max-w-md">
            Tu n'es plus seule. Entraide, challenges, opportunités - un espace entre devs, loin du bruit.
          </p>
          <ClientOnly>
            <button
              v-if="status !== 'authenticated'"
              @click="signIn('github')"
              class="group inline-flex items-center gap-3 px-5 py-3 bg-[#24292e] border border-b-[3px] border-[#24292e] border-b-[#1a1e22] text-white rounded-full text-sm font-medium transition-all hover:-translate-y-0.5 hover:shadow-glow active:translate-y-px active:border-b active:shadow-none"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span>Connexion GitHub</span>
            </button>
            <NuxtLink
              v-else
              to="/qg"
              class="group inline-flex items-center gap-3 text-foreground hover:gap-4 transition-all no-underline"
            >
              <span>Accéder au QG</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="transition-transform group-hover:translate-x-1">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </NuxtLink>
            <template #fallback>
              <div class="h-[46px] w-[180px] bg-foreground/10 rounded-full animate-pulse"></div>
            </template>
          </ClientOnly>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="p-5 border border-border/10 rounded-2xl text-center">
            <div class="w-10 h-10 flex items-center justify-center border border-border/10 rounded-full mb-3 mx-auto">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <h3 class="font-display text-sm font-medium mb-1">Entraide</h3>
            <p class="text-foreground-muted text-xs">Bug, review, conseil...</p>
          </div>
          <div class="p-5 border border-border/10 rounded-2xl text-center">
            <div class="w-10 h-10 flex items-center justify-center border border-border/10 rounded-full mb-3 mx-auto">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <h3 class="font-display text-sm font-medium mb-1">Challenges</h3>
            <p class="text-foreground-muted text-xs">Mini-défis pour progresser</p>
          </div>
          <div class="p-5 border border-border/10 rounded-2xl text-center">
            <div class="w-10 h-10 flex items-center justify-center border border-border/10 rounded-full mb-3 mx-auto">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
            </div>
            <h3 class="font-display text-sm font-medium mb-1">Offres</h3>
            <p class="text-foreground-muted text-xs">Jobs et side projects</p>
          </div>
          <div class="p-5 border border-border/10 rounded-2xl text-center">
            <div class="w-10 h-10 flex items-center justify-center border border-border/10 rounded-full mb-3 mx-auto">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <h3 class="font-display text-sm font-medium mb-1">Profil</h3>
            <p class="text-foreground-muted text-xs">Crée ton profil dev</p>
          </div>
        </div>
      </div>
    </section>

    <section class="py-24 px-4 md:px-16 grid grid-cols-1 lg:grid-cols-3 gap-16 border-t border-border/10">
      <div class="lg:sticky lg:top-32 lg:h-fit">
        <span class="block text-[0.7rem] uppercase tracking-[0.2em] text-foreground-muted mb-4">Explore</span>
        <h2 class="font-display text-3xl md:text-5xl font-medium leading-tight tracking-tight">Découvre<br/>l'écosystème</h2>
      </div>

      <div class="lg:col-span-2 flex flex-col">
        <template v-for="feature in features" :key="feature.title">
          <a
            v-if="feature.external"
            :href="feature.link"
            target="_blank"
            rel="noopener noreferrer"
            class="group grid grid-cols-[50px_1fr_40px] md:grid-cols-[80px_1fr_60px] gap-4 md:gap-8 py-8 md:py-12 border-t border-border/10 last:border-b cursor-pointer transition-all hover:pl-4 no-underline"
          >
            <span class="font-display text-sm text-foreground-muted">{{ feature.number }}</span>
            <div class="flex flex-col gap-3">
              <h3 class="font-display text-xl md:text-3xl font-medium tracking-tight transition-colors group-hover:text-foreground">{{ feature.title }}</h3>
              <p class="text-foreground-muted text-sm leading-relaxed max-w-md">{{ feature.description }}</p>
            </div>
            <div class="flex items-center justify-center opacity-0 -translate-x-3 transition-all text-foreground-muted group-hover:opacity-100 group-hover:translate-x-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </div>
          </a>
          <NuxtLink
            v-else
            :to="feature.link"
            class="group grid grid-cols-[50px_1fr_40px] md:grid-cols-[80px_1fr_60px] gap-4 md:gap-8 py-8 md:py-12 border-t border-border/10 last:border-b cursor-pointer transition-all hover:pl-4 no-underline"
          >
            <span class="font-display text-sm text-foreground-muted">{{ feature.number }}</span>
            <div class="flex flex-col gap-3">
              <h3 class="font-display text-xl md:text-3xl font-medium tracking-tight transition-colors group-hover:text-foreground">{{ feature.title }}</h3>
              <p class="text-foreground-muted text-sm leading-relaxed max-w-md">{{ feature.description }}</p>
            </div>
            <div class="flex items-center justify-center opacity-0 -translate-x-3 transition-all text-foreground-muted group-hover:opacity-100 group-hover:translate-x-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M7 17L17 7M17 7H7M17 7V17"/>
              </svg>
            </div>
          </NuxtLink>
        </template>
      </div>
    </section>

    <section class="py-12 px-4 md:px-16 border-t border-border/10">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <NuxtLink to="/entreprises" class="group flex items-center gap-4 p-5 border border-border/10 rounded-xl hover:border-foreground-muted transition-colors no-underline">
          <div class="w-12 h-12 flex items-center justify-center border border-border/10 rounded-full shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M9 12l2 2 4-4"/>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <div class="min-w-0">
            <h3 class="font-display text-base font-medium group-hover:text-foreground transition-colors">Entreprises certifiées</h3>
            <p class="text-foreground-muted text-sm truncate">5+ avis positifs = badge Certifiée Inclusive</p>
          </div>
        </NuxtLink>
        <NuxtLink to="/programmes" class="group flex items-center gap-4 p-5 border border-border/10 rounded-xl hover:border-foreground-muted transition-colors no-underline">
          <div class="w-12 h-12 flex items-center justify-center border border-border/10 rounded-full shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
          </div>
          <div class="min-w-0">
            <h3 class="font-display text-base font-medium group-hover:text-foreground transition-colors">Programmes & mentorat</h3>
            <p class="text-foreground-muted text-sm truncate">Duchess, communautés, formations...</p>
          </div>
        </NuxtLink>
      </div>
    </section>

    <section class="py-32 px-4 md:px-16 flex justify-center border-t border-border/10">
      <div class="max-w-xl text-center">
        <span class="block text-[0.7rem] uppercase tracking-[0.2em] text-foreground-muted mb-6">Rejoindre</span>
        <h2 class="font-display text-2xl md:text-5xl font-medium leading-tight tracking-tight mb-6">
          Deviens visible
        </h2>
        <p class="text-foreground-muted text-base leading-relaxed mb-10">
          Ton profil pourrait être celui qui donne envie à une future dev de se lancer.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button @click="handleCreateProfile" class="group inline-flex items-center gap-4 px-8 py-5 bg-foreground border border-b-[3px] border-foreground border-b-foreground-muted/50 text-background rounded-full text-base font-medium cursor-pointer transition-all hover:gap-6 hover:-translate-y-0.5 hover:shadow-glow active:translate-y-px active:border-b active:shadow-none">
            <span>Devenir visible</span>
            <span class="flex transition-transform group-hover:translate-x-1">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </span>
          </button>
          <NuxtLink to="/experience" class="text-foreground-muted hover:text-foreground text-sm transition-colors underline underline-offset-4 decoration-border hover:decoration-text">
            ou découvre ton profil dev →
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="py-20 md:py-32 px-4 md:px-16 border-t border-border/10">
      <div class="max-w-3xl mx-auto">
        <div class="relative">
          <span class="hidden md:block absolute -top-8 -left-12 text-[12rem] font-display font-bold text-foreground/[0.03] leading-none select-none">"</span>

          <div class="relative z-10">
            <p class="text-foreground/60 text-base md:text-xl leading-relaxed mb-4 md:mb-6">
              Après plusieurs années en tant que développeuse, un constat&nbsp;:
            </p>
            <p class="font-display text-xl md:text-4xl font-medium text-foreground leading-snug mb-6 md:mb-8">
              J'ai bossé avec 2&nbsp;développeuses contre une vingtaine de développeurs.
            </p>
            <p class="text-foreground/60 text-base md:text-xl leading-relaxed">
              OSLD est né de là. Un espace pour nous rendre visibles, nous retrouver, et montrer aux prochaines que c'est possible.
            </p>

            <div class="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-border/10 flex items-center gap-3 md:gap-4">
              <div class="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-foreground/20 to-foreground/5 flex items-center justify-center text-foreground/60 font-display font-medium text-sm md:text-base">
                C
              </div>
              <div>
                <p class="text-foreground font-medium text-sm md:text-base">Camille</p>
                <p class="text-foreground-muted text-xs md:text-sm">8 ans d'expérience</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.title-stroke {
  color: transparent;
  -webkit-text-stroke: 1px #f8fafc;
}

.title-stroke:hover {
  color: #f8fafc;
  -webkit-text-stroke: 0;
}

@keyframes scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.animate-scroll {
  animation: scroll 25s linear infinite;
}

@keyframes scroll-down {
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(200%);
  }
}

.scroll-line {
  animation: scroll-down 1.5s ease-in-out infinite;
}

@keyframes slide-up {
  from {
    transform: translateY(30px);
  }
  to {
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.animation-delay-100 {
  animation-delay: 0.1s;
}

.animation-delay-150 {
  animation-delay: 0.15s;
}

.animation-delay-200 {
  animation-delay: 0.2s;
}

.animation-delay-250 {
  animation-delay: 0.25s;
}

.animation-delay-300 {
  animation-delay: 0.3s;
}

.animation-delay-400 {
  animation-delay: 0.4s;
}
</style>
