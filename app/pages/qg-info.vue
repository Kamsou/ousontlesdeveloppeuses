<script setup lang="ts">
useSeoMeta({
  title: 'Ton profil - Sois trouvée | OSLD',
  description: 'Crée ton profil de développeuse en deux minutes. Les orgas, les recruteurs et les autres devs te trouvent et te contactent.',
  ogTitle: 'Ton profil - Sois trouvée | OSLD',
  ogDescription: 'Crée ton profil de développeuse en deux minutes. Les orgas, les recruteurs et les autres devs te trouvent et te contactent.',
  ogImage: 'https://ousontlesdeveloppeuses.fr/og-image.png',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Ton profil - Sois trouvée | OSLD',
  twitterDescription: 'Crée ton profil de développeuse en deux minutes. Les orgas, les recruteurs et les autres devs te trouvent et te contactent.',
  twitterImage: 'https://ousontlesdeveloppeuses.fr/og-image.png',
})

onMounted(() => {
  navigateTo('/#profil', { replace: true })
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="animate-pulse text-foreground-muted">Redirection...</div>
  </div>
</template>
