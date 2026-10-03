<script setup lang="ts">
useSeoMeta({
  title: 'Découvrir OSLD - Annuaire, Speakeuses, Ressources | OSLD',
  description: 'Profils de développeuses, speakeuses pour événements tech, programmes, podcasts et ressources. Découvrez tout ce que propose OSLD.',
  ogTitle: 'Découvrir OSLD - Annuaire, Speakeuses, Ressources',
  ogDescription: 'Profils de développeuses, speakeuses pour événements tech, programmes, podcasts et ressources. Découvrez tout ce que propose OSLD.',
  ogImage: 'https://ousontlesdeveloppeuses.fr/og-image.png',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Découvrir OSLD - Annuaire, Speakeuses, Ressources',
  twitterDescription: 'Profils de développeuses, speakeuses pour événements tech, programmes, podcasts et ressources. Découvrez tout ce que propose OSLD.',
  twitterImage: 'https://ousontlesdeveloppeuses.fr/og-image.png',
})

onMounted(() => {
  navigateTo('/#discover', { replace: true })
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="animate-pulse text-foreground-muted">Redirection...</div>
  </div>
</template>
