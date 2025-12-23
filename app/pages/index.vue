<script setup lang="ts">
const { status, signIn } = useAuth()

function handleCreateProfile() {
  if (status.value === 'authenticated') {
    navigateTo('/profil')
  } else {
    signIn('github')
  }
}

useSeoMeta({
  title: 'OSLD - Où Sont Les Développeuses',
  ogTitle: 'OSLD - Où Sont Les Développeuses',
  description: 'Annuaire des développeuses en France. Trouvez des talents tech féminins, des speakers pour vos conférences, et des entreprises inclusives.',
  ogDescription: 'Annuaire des développeuses en France. Trouvez des talents tech féminins, des speakers pour vos conférences, et des entreprises inclusives.',
  ogImage: '/og-image.png',
  twitterCard: 'summary_large_image'
})

const { data: statsData } = await useFetch('/api/stats')

function pluralize(count: number, singular: string, plural: string) {
  return count <= 1 ? singular : plural
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

const openToTags = [
  'Conférence',
  'Mentoring',
  'Freelance',
  'CDI',
  'Coffee chat',
  'Pair programming',
  'Relecture CV'
]

const features = [
  {
    number: '01',
    title: 'Speakeuses',
    description: 'Trouvez des speakeuses pour vos événements tech. Filtrez par sujet, disponibilité et localisation.',
    link: '/speakers'
  },
  {
    number: '02',
    title: 'Disponible pour...',
    description: 'Chaque profil indique ses disponibilités : conférence, mentoring, freelance, CDI, coffee chat, pair programming, relecture CV.',
    link: '/annuaire'
  },
  {
    number: '03',
    title: 'Certifiée Inclusive',
    description: 'Les entreprises avec 5+ avis positifs obtiennent le badge "Certifiée Inclusive". Transparence totale.',
    link: '/entreprises'
  }
]
</script>

<template>
  <div class="max-w-[1600px] mx-auto">
    <section class="min-h-[calc(100vh-80px)] flex flex-col justify-center px-4 md:px-16 py-16 md:py-8 relative">
      <div class="max-w-4xl">
        <h1 class="font-display text-4xl md:text-[clamp(3.5rem,10vw,8rem)] font-medium leading-[0.95] tracking-tight mb-8">
          <span class="block overflow-hidden">
            <span class="inline-block mr-[0.2em]">Où</span>
            <span class="inline-block mr-[0.2em]">sont</span>
            <span class="inline-block">les</span>
          </span>
          <span class="block overflow-hidden title-stroke transition-all duration-400">
            <span class="inline-block">développeuses</span>
          </span>
        </h1>

        <p class="text-lg text-text-muted max-w-md leading-relaxed mb-12">
          Le réseau des talents tech féminins en France.<br/>
          Profils. Talks. Mentorat.
        </p>

        <div class="flex gap-6 items-center flex-wrap">
          <button @click="handleCreateProfile" class="group flex items-center gap-4 px-6 py-4 bg-text text-bg border-none rounded-full text-sm font-medium cursor-pointer transition-all hover:gap-6 hover:pr-5">
            <span>Créer mon profil</span>
            <span class="flex transition-transform group-hover:translate-x-1">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </span>
          </button>
          <NuxtLink to="/experience" class="relative py-4 bg-transparent border-none text-text text-sm font-medium cursor-pointer after:content-[''] after:absolute after:bottom-3 after:left-0 after:w-full after:h-px after:bg-text after:scale-x-0 after:origin-right after:transition-transform hover:after:scale-x-100 hover:after:origin-left">Découvre ton profil dev</NuxtLink>
        </div>
      </div>

      <div class="hidden md:flex absolute bottom-8 right-16 flex-col items-center gap-4">
        <span class="text-[0.65rem] uppercase tracking-[0.2em] text-text-muted [writing-mode:vertical-rl]">Scroll</span>
        <div class="relative w-px h-16 bg-border overflow-hidden">
          <span class="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-text to-transparent scroll-line"></span>
        </div>
      </div>
    </section>

    <div class="py-6 border-y border-border overflow-hidden">
      <div class="flex gap-4 w-max animate-scroll">
        <span v-for="(tag, i) in [...openToTags, ...openToTags]" :key="i" class="flex-shrink-0 px-4 py-2 border border-border rounded-full text-sm text-text-muted transition-all hover:border-text hover:text-text">
          {{ tag }}
        </span>
      </div>
    </div>

    <section class="py-24 px-4 md:px-16">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div v-for="(stat, index) in stats" :key="stat.label" class="flex flex-col gap-6 py-8 border-t border-border">
          <span class="text-[0.7rem] text-text-muted tracking-widest">0{{ index + 1 }}</span>
          <div class="flex flex-col gap-1">
            <span class="font-display text-4xl md:text-6xl font-medium tracking-tight">{{ stat.value }}</span>
            <span class="text-text-muted text-sm">{{ stat.label }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="py-24 px-4 md:px-16 grid grid-cols-1 lg:grid-cols-3 gap-16">
      <div class="lg:sticky lg:top-32 lg:h-fit">
        <span class="block text-[0.7rem] uppercase tracking-[0.2em] text-text-muted mb-4">Fonctionnalités</span>
        <h2 class="font-display text-3xl md:text-5xl font-medium leading-tight tracking-tight">Plus qu'un<br/>annuaire</h2>
      </div>

      <div class="lg:col-span-2 flex flex-col">
        <NuxtLink v-for="feature in features" :key="feature.title" :to="feature.link" class="group grid grid-cols-[50px_1fr_40px] md:grid-cols-[80px_1fr_60px] gap-4 md:gap-8 py-8 md:py-12 border-t border-border last:border-b cursor-pointer transition-all hover:pl-4 no-underline">
          <span class="font-display text-sm text-text-muted">{{ feature.number }}</span>
          <div class="flex flex-col gap-3">
            <h3 class="font-display text-xl md:text-3xl font-medium tracking-tight transition-colors group-hover:text-text">{{ feature.title }}</h3>
            <p class="text-text-muted text-sm leading-relaxed max-w-md">{{ feature.description }}</p>
          </div>
          <div class="flex items-center justify-center opacity-0 -translate-x-3 transition-all text-text-muted group-hover:opacity-100 group-hover:translate-x-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M7 17L17 7M17 7H7M17 7V17"/>
            </svg>
          </div>
        </NuxtLink>
      </div>
    </section>

    <section class="py-24 px-4 md:px-16 border-t border-border">
      <div class="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8 md:gap-16 items-center max-w-4xl mx-auto">
        <div class="flex flex-col items-center gap-6 p-12 border border-border rounded-2xl max-w-[300px] mx-auto md:mx-0">
          <div class="w-20 h-20 flex items-center justify-center border border-border rounded-full text-text">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M9 12l2 2 4-4"/>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <span class="font-display text-base font-medium tracking-wide">Certifiée Inclusive</span>
        </div>
        <div class="flex flex-col gap-4 text-center md:text-left">
          <h3 class="font-display text-2xl md:text-4xl font-medium tracking-tight">Entreprises certifiées</h3>
          <p class="text-text-muted text-base leading-relaxed">
            Les entreprises avec au moins 5 avis et une note moyenne de 4/5
            obtiennent le badge Certifiée Inclusive. Basé sur les retours
            anonymes de la communauté.
          </p>
        </div>
      </div>
    </section>

    <section class="py-32 px-4 md:px-16 flex justify-center border-t border-border">
      <div class="max-w-xl text-center">
        <span class="block text-[0.7rem] uppercase tracking-[0.2em] text-text-muted mb-6">Rejoindre</span>
        <h2 class="font-display text-2xl md:text-5xl font-medium leading-tight tracking-tight mb-6">
          Ajoutez votre profil<br/>à l'annuaire
        </h2>
        <p class="text-text-muted text-base leading-relaxed mb-10">
          Indiquez vos technos, votre localisation et ce pour quoi vous êtes disponible.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button @click="handleCreateProfile" class="group inline-flex items-center gap-4 px-8 py-5 bg-text text-bg border-none rounded-full text-base font-medium cursor-pointer transition-all hover:bg-text-muted hover:gap-6">
            <span>Créer mon profil</span>
            <span class="flex transition-transform group-hover:translate-x-1">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </span>
          </button>
          <NuxtLink to="/experience" class="text-text-muted hover:text-text text-sm transition-colors no-underline">
            ou découvre ton profil dev →
          </NuxtLink>
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
</style>
