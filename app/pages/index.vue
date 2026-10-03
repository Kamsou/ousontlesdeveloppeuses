<script setup lang="ts">
import type { HomeDeveloper, HomeStats } from '~/utils/home'

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

const { data: statsData } = useLazyFetch<HomeStats>('/api/stats', {
  server: false
})

const { data: developersData } = useLazyFetch<{ developers: HomeDeveloper[] }>('/api/developers', {
  key: 'home-developers',
  query: { limit: 36 },
  server: false
})

const developers = computed(() => developersData.value?.developers ?? [])

function handleCreateProfile() {
  $clientPosthog?.capture('cta_clicked', { cta: 'create_profile' })
  if (status.value === 'authenticated') {
    navigateTo('/profile')
  } else {
    signIn('github')
  }
}

onMounted(() => {
  console.log(
    '%cOù sont les développeuses ?%c\nIci. Et si tu lis la console, tu es sûrement des nôtres.\nContribue → https://github.com/Kamsou/ousontlesdevs',
    'font: 600 22px "Space Grotesk", sans-serif; padding: 8px 0',
    'font: 13px ui-monospace, monospace; line-height: 1.6'
  )
})
</script>

<template>
  <div>
    <HomeHero :developers="developers" :count="statsData?.developers ?? null" @join="handleCreateProfile" />
    <HomeStats :stats="statsData ?? null" :developers="developers" />
    <HomeMission />
    <HomeDiscover />
    <HomeQg />
    <HomeQuiz />
    <HomeStory />
    <HomeJoin @join="handleCreateProfile" />
  </div>
</template>
