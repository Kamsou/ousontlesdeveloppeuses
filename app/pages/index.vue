<script setup lang="ts">
import type { HomeDeveloper, HomeStats } from '~/utils/home'

const { $clientPosthog } = useNuxtApp()
const { status, signIn } = useAuth()

useHead({
  titleTemplate: '%s',
})

useSeoMeta({
  title: 'Où Sont Les Développeuses (OSLD) - Annuaire des développeuses tech en France',
  description: 'Annuaire des développeuses tech en France : profils, speakeuses pour vos conférences, programmes, podcasts et quiz IA. Crée ton profil et sois trouvée.',
  ogTitle: 'Où sont les développeuses ? Ici.',
  ogDescription: 'Se rendre visibles, se trouver. Annuaire de développeuses, speakeuses et ressources tech en France.',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Où sont les développeuses ? Ici.',
  twitterDescription: 'Se rendre visibles, se trouver. Annuaire de développeuses, speakeuses et ressources tech en France.',
})

const { data: ogStats } = await useFetch('/api/stats', { key: 'og-stats' })
const { data: ogAvatars } = await useFetch<string[]>('/api/developers/avatars', { key: 'og-avatars' })
defineOgImageComponent('OgImageListing', {
  label: 'annuaire',
  title: 'Où sont les',
  outline: 'développeuses',
  count: ogStats.value?.developers ?? null,
  countLabel: 'développeuses référencées en France',
  avatars: ogAvatars.value ?? []
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
    description: 'Annuaire des développeuses tech en France : profils, speakeuses, programmes, podcasts et quiz IA.',
  }),
  {
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': 'Pourquoi OSLD ?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Les développeuses représentent moins de 20% de la tech. OSLD rend visibles les développeuses en France, leur permet de se trouver entre elles (mentorat, coffee chat, pair programming), et montre aux prochaines générations que c\'est possible.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Comment être visible sur OSLD ?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Crée ton profil gratuitement avec ton compte GitHub : stack, ville, expérience et disponibilités (conférence, mentoring, coffee chat, pair programming). Les orgas d\'événements, les recruteurs et les autres développeuses te trouvent dans l\'annuaire et peuvent te contacter.'
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
    <HomeProfile @join="handleCreateProfile" />
    <HomeQuiz />
    <HomeStory />
    <HomeJoin @join="handleCreateProfile" />
  </div>
</template>
