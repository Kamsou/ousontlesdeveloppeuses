<script setup lang="ts">
useSeoMeta({
  title: 'Podcasts Tech & Développeuses',
  description: 'Podcasts tech par et pour les développeuses. Interviews, retours d\'expérience et discussions sur le dev, la tech et les parcours féminins.',
  ogTitle: 'Podcasts Tech & Développeuses',
  ogDescription: 'Podcasts tech par et pour les développeuses. Interviews, retours d\'expérience et discussions tech.',
  ogImage: 'https://ousontlesdeveloppeuses.fr/og-image.png',
  twitterCard: 'summary_large_image',
})

interface Podcast {
  id: number
  title: string
  podcastName: string
  description: string | null
  guestName: string | null
  url: string
  imageUrl: string | null
  highlight: boolean
}

const { data: podcasts, status } = await useFetch<Podcast[]>('/api/podcasts')
</script>

<template>
  <div class="max-w-[1200px] mx-auto px-4 md:px-16 py-16 md:py-24">
    <div class="mb-16">
      <div class="overflow-hidden">
        <span class="block text-[0.7rem] uppercase tracking-[0.2em] text-foreground-muted mb-4 animate-slide-up">Ressources</span>
      </div>
      <div class="overflow-hidden">
        <h1 class="font-display text-4xl md:text-6xl font-medium tracking-tight mb-6 animate-slide-up animation-delay-100">
          Podcasts
        </h1>
      </div>
      <div class="overflow-hidden">
        <p class="text-foreground-muted text-lg max-w-2xl leading-relaxed animate-slide-up animation-delay-200">
          Épisodes de podcasts par et pour les développeuses. Interviews, retours d'expérience et discussions tech.
        </p>
      </div>
    </div>

    <div v-if="status === 'pending'" class="flex justify-center py-20">
      <div class="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin"></div>
    </div>

    <div v-else-if="!podcasts?.length" class="text-center py-12 text-foreground-muted border border-border rounded-2xl">
      Aucun podcast pour le moment.
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <a
        v-for="podcast in podcasts"
        :key="podcast.id"
        :href="podcast.url"
        target="_blank"
        rel="noopener noreferrer"
        :class="[
          'group p-6 border rounded-2xl transition-all hover:border-foreground-muted no-underline',
          podcast.highlight ? 'border-foreground/30 bg-foreground/5' : 'border-border'
        ]"
      >
        <div v-if="podcast.imageUrl" class="mb-4 rounded-xl overflow-hidden">
          <img
            :src="podcast.imageUrl"
            :alt="podcast.title"
            class="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div class="flex items-start justify-between gap-4 mb-2">
          <span class="px-2 py-0.5 text-[11px] font-medium border border-foreground/20 text-foreground-muted rounded-full">
            {{ podcast.podcastName }}
          </span>
          <svg class="w-5 h-5 text-foreground-muted opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M7 17L17 7M17 7H7M17 7V17"/>
          </svg>
        </div>
        <h2 class="font-display text-lg font-medium group-hover:text-foreground transition-colors mb-2 line-clamp-2">
          {{ podcast.title }}
        </h2>
        <p v-if="podcast.guestName" class="text-sm text-foreground-muted mb-2">
          avec {{ podcast.guestName }}
        </p>
        <p v-if="podcast.description" class="text-foreground-muted text-sm leading-relaxed line-clamp-3">
          {{ podcast.description }}
        </p>
      </a>
    </div>

    <div class="mt-24 p-8 md:p-12 border border-border rounded-2xl text-center">
      <h2 class="font-display text-2xl md:text-3xl font-medium mb-4">
        Un podcast à suggérer ?
      </h2>
      <p class="text-foreground-muted mb-6 max-w-md mx-auto">
        Tu connais un épisode de podcast avec une développeuse qui devrait être listé ici ?
      </p>
      <a
        href="mailto:contact@ousontlesdeveloppeuses.fr?subject=Suggestion de podcast"
        class="inline-flex items-center gap-2 px-6 py-3 bg-foreground border border-b-[3px] border-foreground border-b-foreground-muted/50 text-background rounded-full text-sm font-medium no-underline transition-all hover:-translate-y-0.5 hover:shadow-glow active:translate-y-px active:border-b active:shadow-none"
      >
        <span>Proposer un podcast</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </a>
    </div>
  </div>
</template>

<style scoped>
@keyframes slide-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-up {
  animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animation-delay-100 {
  animation-delay: 0.1s;
  opacity: 0;
}

.animation-delay-200 {
  animation-delay: 0.2s;
  opacity: 0;
}
</style>
