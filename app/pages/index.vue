<script setup lang="ts">
import { homeFaq } from '#shared/utils/faq'
import type { HomeDeveloper, HomeStats } from '~/utils/home'

const { $clientPosthog } = useNuxtApp()
const { status, signIn } = useAuth()

useHead({
  titleTemplate: '%s',
})

useSeoMeta({
  title: 'Annuaire des développeuses tech en France | OSLD',
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
const { data: landingIndex } = await useFetch<{ cities: { slug: string, label: string, count: number }[], techs: { slug: string, label: string, count: number }[] }>('/api/landings', {
  key: 'home-landings',
  default: () => ({ cities: [], techs: [] })
})

const faqItems = homeFaq(ogStats.value)
defineOgImage('Listing', {
  label: 'annuaire',
  title: 'Où sont les',
  outline: 'développeuses',
  count: ogStats.value?.developers ?? null,
  countLabel: 'développeuses référencées en France',
  avatars: ogAvatars.value ?? []
})

useSchemaOrg([
  defineWebSite({
    name: 'Où sont les développeuses',
    alternateName: ['OSLD', 'Où sont les développeuses ?'],
    description: 'Annuaire et communauté des développeuses tech en France',
    inLanguage: 'fr-FR',
  }),
  defineWebPage({
    name: 'Annuaire des développeuses tech en France',
    description: 'Annuaire des développeuses tech en France : profils, speakeuses, programmes, podcasts et quiz IA.',
  }),
  {
    '@type': 'FAQPage',
    'mainEntity': faqItems.map(item => ({
      '@type': 'Question',
      'name': item.question,
      'acceptedAnswer': { '@type': 'Answer', 'text': item.answer }
    }))
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
    <LazyHomeStats hydrate-on-visible :stats="statsData ?? null" :developers="developers" />
    <LazyHomeMission hydrate-on-visible />
    <LazyHomeDiscover hydrate-on-visible />
    <LazyHomeProfile hydrate-on-visible @join="handleCreateProfile" />
    <LazyHomeQuiz hydrate-on-visible />
    <LazyHomeStory hydrate-on-visible />
    <LazyHomeFaq hydrate-on-visible :items="faqItems" :cities="landingIndex.cities.slice(0, 8)" :techs="landingIndex.techs.slice(0, 10)" />
    <LazyHomeJoin hydrate-on-visible @join="handleCreateProfile" />
  </div>
</template>
