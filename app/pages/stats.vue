<script setup lang="ts">
useSeoMeta({
  title: 'Stats en temps réel - Où Sont Les Développeuses',
  description: 'Développeuses, villes, speakeuses. Découvrez les chiffres de la communauté OSLD en temps réel.',
  ogTitle: 'Stats en temps réel - Où Sont Les Développeuses',
  ogDescription: 'Développeuses, villes, speakeuses. Découvrez les chiffres de la communauté OSLD en temps réel.',
  ogImage: 'https://ousontlesdeveloppeuses.fr/og-image.png',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Stats en temps réel - Où Sont Les Développeuses',
  twitterDescription: 'Développeuses, villes, speakeuses. Découvrez les chiffres de la communauté OSLD en temps réel.',
  twitterImage: 'https://ousontlesdeveloppeuses.fr/og-image.png',
})

onMounted(() => {
  navigateTo('/#stats', { replace: true })
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="animate-pulse text-foreground-muted">Redirection...</div>
  </div>
</template>
