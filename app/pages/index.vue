<script setup lang="ts">
import { openToOptions } from '~/utils/constants'

const { $clientPosthog } = useNuxtApp()
const { status, signIn } = useAuth()

useHead({
  titleTemplate: '%s',
})

useSeoMeta({
  title: 'Où Sont Les Développeuses (OSLD) - Annuaire des développeuses tech en France',
  description: 'Annuaire des développeuses tech en France : profils, speakeuses, entreprises inclusives, quiz IA et espace d\'entraide privé. Rejoignez la communauté OSLD.',
  ogTitle: 'Où sont les développeuses ? Ici.',
  ogDescription: 'Se retrouver, se rendre visibles. Annuaire de développeuses, speakeuses, ressources tech et entraide communautaire.',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Où sont les développeuses ? Ici.',
  twitterDescription: 'Se retrouver, se rendre visibles. Annuaire de développeuses, speakeuses, ressources tech et entraide communautaire.',
})

const { data: ogStats } = await useFetch('/api/stats', { key: 'og-stats' })
defineOgImageComponent('OgImageListing', {
  title: 'Où sont les développeuses ?',
  subtitle: 'Se retrouver, se rendre visibles.',
  count: ogStats.value?.developers ?? null,
  countLabel: 'développeuses référencées'
})

useSchemaOrg([
  defineWebSite({
    name: 'Où Sont Les Développeuses',
    alternateName: 'OSLD',
    description: 'Annuaire et communauté des développeuses tech en France',
    inLanguage: 'fr-FR',
  }),
  defineWebPage({
    name: 'Où Sont Les Développeuses - Annuaire des développeuses tech en France',
    description: 'Annuaire des développeuses tech en France : profils, speakeuses, entreprises inclusives, programmes, podcasts, quiz IA et espace d\'entraide communautaire privé (Le QG).',
  }),
  {
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': 'Pourquoi OSLD ?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Les développeuses représentent moins de 20% de la tech. OSLD rend visibles les développeuses en France, crée un réseau pour se retrouver, s\'entraider, créer ensemble, et montre aux prochaines générations que c\'est possible.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Qu\'est-ce que le QG ?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Le QG est l\'espace privé d\'OSLD réservé aux développeuses inscrites. On y trouve de l\'entraide technique (bugs, reviews, conseils), des side projects collaboratifs et des offres d\'emploi communautaires.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Comment trouver une speakeuse tech ?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'L\'annuaire OSLD référence des speakeuses tech disponibles pour vos conférences et événements. Filtrez par sujet, disponibilité remote/présentiel et localisation sur ousontlesdeveloppeuses.fr/speakers.'
        }
      }
    ]
  }
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
    navigateTo('/profile')
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
    link: '/directory',
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
          <NuxtLink to="/experience" class="hidden md:inline-flex items-center gap-2 text-foreground-muted text-sm mb-8 no-underline hover:text-foreground transition-colors animate-slide-up">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
            T'es plutôt quel profil dev ? Fais le quiz →
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
            Le QG des développeuses en France.<br/>
            Se retrouver, se rendre visibles, et montrer aux prochaines que c'est possible.
          </p>
        </div>

        <div>
          <div class="flex gap-4 items-center flex-wrap animate-slide-up animation-delay-400">
          <NuxtLink to="/directory" class="group flex items-center gap-4 px-6 py-4 bg-foreground border border-b-[3px] border-foreground border-b-foreground-muted/50 text-background rounded-full text-sm font-medium cursor-pointer transition-all hover:gap-6 hover:pr-5 hover:-translate-y-0.5 hover:shadow-glow active:translate-y-px active:border-b active:shadow-none no-underline">
            <span>Découvrir les développeuses</span>
            <span class="flex transition-transform group-hover:translate-x-1">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </span>
          </NuxtLink>
          <button @click="handleCreateProfile" class="px-6 py-4 bg-transparent text-foreground border border-b-[3px] border-border/10 border-b-border/30 rounded-full text-sm font-medium cursor-pointer transition-all hover:border-foreground hover:bg-foreground hover:text-background hover:-translate-y-0.5 active:translate-y-px active:border-b">
            Rejoins la communauté
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

    <div class="relative py-8 border-y border-border/5 overflow-hidden bg-gradient-to-r from-transparent via-foreground/[0.01] to-transparent">
      <div class="flex gap-6 w-max animate-scroll">
        <span v-for="(tag, i) in [...openToTags, ...openToTags]" :key="i" class="flex-shrink-0 px-5 py-2.5 bg-background/80 backdrop-blur-sm border border-border/20 rounded-full text-sm font-medium text-foreground/70 hover:text-foreground hover:border-foreground/40 transition-all cursor-default">
          {{ tag }}
        </span>
      </div>
    </div>

    <section id="stats" class="py-20 md:py-32 px-4 md:px-16">
      <div class="max-w-7xl mx-auto">
        <div class="mb-12">
          <a href="#stats" class="group inline-flex items-center gap-0 group-hover:gap-2 text-foreground-muted text-sm tracking-wide mb-2 no-underline hover:text-foreground transition-all">
            <span class="opacity-0 group-hover:opacity-100 transition-opacity">#</span>
            <span>En temps réel</span>
          </a>
          <h2 class="font-display text-3xl md:text-5xl font-medium tracking-tight">
            Elles sont là.
          </h2>
        </div>

        <div class="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          <ClientOnly>
            <template v-if="statsLoading">
              <div v-for="i in 4" :key="i" class="flex flex-col gap-4">
                <span class="text-xs text-foreground-muted tracking-widest">0{{ i }}</span>
                <div class="inline-block w-20 h-16 bg-border/50 rounded animate-pulse"></div>
                <div class="inline-block w-28 h-5 bg-border/50 rounded animate-pulse"></div>
              </div>
            </template>
            <template v-else>
              <div v-for="(stat, index) in stats" :key="index" class="flex flex-col gap-4 py-4 border-t border-border/10">
                <span class="text-xs text-foreground-muted tracking-widest">0{{ index + 1 }}</span>
                <div class="font-display text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight leading-none">
                  {{ stat.value }}
                </div>
                <div class="text-foreground-muted text-sm">{{ stat.label }}</div>
              </div>
            </template>
            <template #fallback>
              <div v-for="i in 4" :key="i" class="flex flex-col gap-4">
                <span class="text-xs text-foreground-muted tracking-widest">0{{ i }}</span>
                <div class="inline-block w-20 h-16 bg-border/50 rounded animate-pulse"></div>
                <div class="inline-block w-28 h-5 bg-border/50 rounded animate-pulse"></div>
              </div>
            </template>
          </ClientOnly>
        </div>
      </div>
    </section>

    <section id="mission" class="py-32 md:py-40 px-4 md:px-16 border-t border-border/10">
      <div class="max-w-4xl mx-auto">
        <a href="#mission" class="group inline-flex items-center gap-0 group-hover:gap-2 text-[0.7rem] tracking-wide text-foreground-muted mb-4 no-underline hover:text-foreground transition-all">
          <span class="opacity-0 group-hover:opacity-100 transition-opacity">#</span>
          <span>Mission</span>
        </a>
        <h2 class="font-display text-3xl md:text-5xl font-medium leading-tight tracking-tight mb-12">
          Pourquoi OSLD ?
        </h2>
        <div class="grid md:grid-cols-3 gap-8 md:gap-12">
          <div class="flex flex-col gap-3">
            <div class="w-10 h-10 flex items-center justify-center border border-border/10 rounded-full">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
            <h3 class="font-display text-lg font-medium">Visibilité</h3>
            <p class="text-foreground-muted text-sm leading-relaxed">
              On représente moins de 20% de la tech. OSLD rend visibles les développeuses en France.
            </p>
          </div>
          <div class="flex flex-col gap-3">
            <div class="w-10 h-10 flex items-center justify-center border border-border/10 rounded-full">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <h3 class="font-display text-lg font-medium">Communauté</h3>
            <p class="text-foreground-muted text-sm leading-relaxed">
              Un réseau pour se retrouver, s'entraider, créer ensemble et partager entre développeuses.
            </p>
          </div>
          <div class="flex flex-col gap-3">
            <div class="w-10 h-10 flex items-center justify-center border border-border/10 rounded-full">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h3 class="font-display text-lg font-medium">Inspiration</h3>
            <p class="text-foreground-muted text-sm leading-relaxed">
              Montrer aux prochaines générations que c'est possible, et qu'elles ne sont pas seules.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section id="discover" class="py-32 md:py-40 px-4 md:px-16 border-t border-border/10">
      <div class="max-w-5xl mx-auto">
        <div class="mb-16">
          <a href="#discover" class="group inline-flex items-center gap-0 group-hover:gap-2 text-[0.7rem] tracking-wide text-foreground-muted mb-4 no-underline hover:text-foreground transition-all">
            <span class="opacity-0 group-hover:opacity-100 transition-opacity">#</span>
            <span>Découvre</span>
          </a>
          <h2 class="font-display text-3xl md:text-5xl font-medium leading-tight tracking-tight">
            Ce que tu trouves sur OSLD
          </h2>
        </div>

        <div class="grid md:grid-cols-2 gap-6">
          <NuxtLink to="/directory" class="group p-6 border border-border/10 rounded-2xl hover:border-foreground-muted transition-all no-underline">
            <div class="flex items-start gap-4 mb-4">
              <div class="w-12 h-12 flex items-center justify-center border border-border/10 rounded-full shrink-0">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-display text-xl font-medium mb-2 group-hover:text-foreground transition-colors">Annuaire</h3>
                <p class="text-foreground-muted text-sm leading-relaxed">
                  Profils de développeuses en France. Filtre par localisation, langages, et disponibilités.
                </p>
              </div>
            </div>
            <div class="flex flex-wrap gap-2 mt-4">
              <span class="px-2.5 py-1 text-xs border border-border/10 rounded-full text-foreground-muted">Freelance</span>
              <span class="px-2.5 py-1 text-xs border border-border/10 rounded-full text-foreground-muted">CDI</span>
              <span class="px-2.5 py-1 text-xs border border-border/10 rounded-full text-foreground-muted">Mentoring</span>
              <span class="px-2.5 py-1 text-xs border border-border/10 rounded-full text-foreground-muted">Coffee chat</span>
            </div>
          </NuxtLink>

          <NuxtLink to="/speakers" class="group p-6 border border-border/10 rounded-2xl hover:border-foreground-muted transition-all no-underline">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 flex items-center justify-center border border-border/10 rounded-full shrink-0">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-display text-xl font-medium mb-2 group-hover:text-foreground transition-colors">Speakeuses</h3>
                <p class="text-foreground-muted text-sm leading-relaxed">
                  Trouve des speakeuses pour tes événements tech. Sujets, format (présentiel/remote), et expérience.
                </p>
              </div>
            </div>
          </NuxtLink>

          <NuxtLink to="/companies" class="group p-6 border border-border/10 rounded-2xl hover:border-foreground-muted transition-all no-underline">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 flex items-center justify-center border border-border/10 rounded-full shrink-0">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 21h18M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-display text-xl font-medium mb-2 group-hover:text-foreground transition-colors">Entreprises</h3>
                <p class="text-foreground-muted text-sm leading-relaxed">
                  Avis et retours d'expérience sur les entreprises tech. Badge "Certifiée Inclusive" pour 5+ avis positifs.
                </p>
              </div>
            </div>
          </NuxtLink>

          <NuxtLink to="/programs" class="group p-6 border border-border/10 rounded-2xl hover:border-foreground-muted transition-all no-underline">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 flex items-center justify-center border border-border/10 rounded-full shrink-0">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-display text-xl font-medium mb-2 group-hover:text-foreground transition-colors">Programmes & ressources</h3>
                <p class="text-foreground-muted text-sm leading-relaxed">
                  Communautés, formations, mentorat. Duchess France, Rails Girls, et plus encore.
                </p>
              </div>
            </div>
          </NuxtLink>

          <NuxtLink to="/podcasts" class="group p-6 border border-border/10 rounded-2xl hover:border-foreground-muted transition-all no-underline">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 flex items-center justify-center border border-border/10 rounded-full shrink-0">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-display text-xl font-medium mb-2 group-hover:text-foreground transition-colors">Podcasts</h3>
                <p class="text-foreground-muted text-sm leading-relaxed">
                  Épisodes de podcasts tech avec des développeuses. Découvre des parcours inspirants.
                </p>
              </div>
            </div>
          </NuxtLink>

          <a href="https://github.com/Kamsou/ousontlesdevs" target="_blank" rel="noopener noreferrer" class="group p-6 border border-border/10 rounded-2xl hover:border-foreground-muted transition-all no-underline">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 flex items-center justify-center border border-border/10 rounded-full shrink-0">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-display text-xl font-medium mb-2 group-hover:text-foreground transition-colors">Open Source</h3>
                <p class="text-foreground-muted text-sm leading-relaxed">
                  OSLD est 100% open source. Contribue au projet, propose des features ou signale des bugs.
                </p>
              </div>
            </div>
          </a>
        </div>
      </div>
    </section>

    <section id="qg" class="py-32 md:py-40 px-4 md:px-16 border-t border-border/10">
      <div class="max-w-5xl mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <a href="#qg" class="group inline-flex items-center gap-0 group-hover:gap-2 text-[0.7rem] tracking-wide text-foreground-muted mb-4 no-underline hover:text-foreground transition-all">
              <span class="opacity-0 group-hover:opacity-100 transition-opacity">#</span>
              <span>Le QG</span>
            </a>
            <h2 class="font-display text-3xl md:text-5xl font-medium leading-tight tracking-tight mb-6">
              L'espace privé des développeuses
            </h2>
            <p class="text-foreground-muted text-base leading-relaxed mb-8">
              Derrière la vitrine publique, un espace entre nous. Entraide, side projects, offres d'emploi. Juste entre devs.
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

          <div class="grid grid-cols-2 gap-4">
            <div class="p-6 border border-border/10 rounded-2xl">
              <div class="w-10 h-10 flex items-center justify-center border border-border/10 rounded-full mb-4">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <h3 class="font-display text-base font-medium mb-2">Entraide</h3>
              <p class="text-foreground-muted text-sm leading-relaxed">
                Demande de l'aide sur un bug, une review de code, ou un conseil tech.
              </p>
            </div>

            <div class="p-6 border border-border/10 rounded-2xl">
              <div class="w-10 h-10 flex items-center justify-center border border-border/10 rounded-full mb-4">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <h3 class="font-display text-base font-medium mb-2">Side projects</h3>
              <p class="text-foreground-muted text-sm leading-relaxed">
                Partage tes idées de projets ou rejoins des side projects en cours.
              </p>
            </div>

            <div class="p-6 border border-border/10 rounded-2xl">
              <div class="w-10 h-10 flex items-center justify-center border border-border/10 rounded-full mb-4">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
              </div>
              <h3 class="font-display text-base font-medium mb-2">Offres</h3>
              <p class="text-foreground-muted text-sm leading-relaxed">
                Opportunités d'emploi (CDI, freelance, alternance, stage) dans la communauté.
              </p>
            </div>

            <div class="p-6 border border-border/10 rounded-2xl">
              <div class="w-10 h-10 flex items-center justify-center border border-border/10 rounded-full mb-4">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <h3 class="font-display text-base font-medium mb-2">Ton profil</h3>
              <p class="text-foreground-muted text-sm leading-relaxed">
                Crée et gère ton profil public depuis le QG. Visible dans l'annuaire.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="quiz" class="py-24 md:py-32 px-4 md:px-16 border-t border-border/10">
      <div class="max-w-2xl mx-auto text-center">
        <NuxtLink to="/experience" class="group block p-8 border border-border/10 rounded-2xl hover:border-foreground-muted transition-all no-underline">
          <div class="w-14 h-14 mx-auto mb-6 flex items-center justify-center border border-border/10 rounded-full">
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          </div>
          <h3 class="font-display text-2xl md:text-3xl font-medium mb-3 group-hover:text-foreground transition-colors">
            Quel dev es-tu ?
          </h3>
          <p class="text-foreground-muted leading-relaxed mb-6">
            Un quiz IA pour découvrir ton profil de développeuse. Fun, rapide, et&nbsp;étonnamment&nbsp;juste.
          </p>
          <span class="inline-flex items-center gap-2 text-sm text-foreground-muted group-hover:text-foreground transition-colors">
            Faire le quiz
            <svg class="w-4 h-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </span>
        </NuxtLink>
      </div>
    </section>

    <section id="story" class="py-32 md:py-48 px-4 md:px-16 border-t border-border/10">
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

    <section id="join" class="py-40 md:py-48 px-4 md:px-16 flex justify-center border-t border-border/10">
      <div class="max-w-xl text-center">
        <a href="#join" class="group inline-flex items-center gap-0 group-hover:gap-2 text-[0.7rem] tracking-wide text-foreground-muted mb-6 no-underline hover:text-foreground transition-all">
          <span class="opacity-0 group-hover:opacity-100 transition-opacity">#</span>
          <span>Rejoindre</span>
        </a>
        <h2 class="font-display text-2xl md:text-5xl font-medium leading-tight tracking-tight mb-6">
          Deviens visible
        </h2>
        <p class="text-foreground-muted text-base leading-relaxed mb-10">
          Ton profil pourrait inspirer une future dev à se lancer. Et derrière, une communauté t'attend.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button @click="handleCreateProfile" class="group inline-flex items-center gap-4 px-8 py-5 bg-foreground border border-b-[3px] border-foreground border-b-foreground-muted/50 text-background rounded-full text-base font-medium cursor-pointer transition-all hover:gap-6 hover:-translate-y-0.5 hover:shadow-glow active:translate-y-px active:border-b active:shadow-none">
            <span>Rejoins la communauté</span>
            <span class="flex transition-transform group-hover:translate-x-1">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </span>
          </button>
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
