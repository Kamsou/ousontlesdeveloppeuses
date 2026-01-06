<script setup lang="ts">
interface Developer {
  id: number
  name: string
  avatarUrl: string | null
  bio: string | null
  location: string | null
  yearsExperience: number | null
  website: string | null
  githubUrl: string | null
  linkedinUrl: string | null
  twitterUrl: string | null
  skills: string[]
  openTo: string[]
  speakerProfile: {
    topics: string[]
    available: boolean | null
    remoteOk: boolean | null
    travelWilling: boolean | null
  } | null
}

const route = useRoute()
const id = route.params.id

const openToLabels: Record<string, string> = {
  conference: 'Conférence',
  mentoring: 'Mentoring',
  freelance: 'Freelance',
  cdi: 'CDI',
  coffee_chat: 'Coffee chat',
  pair_programming: 'Pair programming',
  cv_review: 'Relecture CV'
}

const { data: developer, error } = await useFetch<Developer>(`/api/developers/${id}`)

if (error.value) {
  throw createError({ statusCode: 404, message: 'Profil non trouvé' })
}

useSeoMeta({
  title: () => developer.value ? `${developer.value.name} - OSLD` : 'Profil',
  description: () => developer.value?.bio || 'Profil de développeuse sur OSLD',
  ogTitle: () => developer.value ? `${developer.value.name} - Développeuse` : 'Profil',
  ogDescription: () => developer.value?.bio || 'Découvrez le profil de cette développeuse sur OSLD',
  ogImage: () => developer.value?.avatarUrl || 'https://ousontlesdeveloppeuses.fr/og-image.png',
  ogType: 'profile',
  twitterCard: 'summary',
  twitterTitle: () => developer.value ? `${developer.value.name} - Développeuse` : 'Profil',
  twitterDescription: () => developer.value?.bio || 'Découvrez le profil de cette développeuse sur OSLD',
  twitterImage: () => developer.value?.avatarUrl || 'https://ousontlesdeveloppeuses.fr/og-image.png',
})

usePersonSchema(developer)
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 md:px-8 pb-16">
    <div v-if="developer">
      <header class="pb-8 border-b border-border mb-8">
        <NuxtLink to="/annuaire" class="inline-flex items-center gap-2 text-text-muted no-underline text-sm mb-8 transition-colors hover:text-text">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Annuaire
        </NuxtLink>

        <div class="flex flex-col md:flex-row items-center gap-6 mb-6 text-center md:text-left">
          <img
            :src="developer.avatarUrl || '/default-avatar.png'"
            :alt="`Photo de profil de ${developer.name}, développeuse${developer.location ? ` basée à ${developer.location}` : ''}`"
            class="w-24 h-24 rounded-full object-cover"
          />
          <div>
            <h1 class="font-display text-3xl md:text-5xl font-medium tracking-tight mb-2">{{ developer.name }}</h1>
            <div class="flex flex-col md:flex-row gap-2 md:gap-6 text-text-muted">
              <span v-if="developer.location">{{ developer.location }}</span>
              <span v-if="developer.yearsExperience">
                {{ developer.yearsExperience }} ans d'expérience
              </span>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap justify-center md:justify-start gap-4">
          <a v-if="developer.linkedinUrl" :href="developer.linkedinUrl" target="_blank" class="flex items-center gap-2 px-5 py-3 bg-bg-card border border-border rounded-full text-text no-underline text-sm transition-all hover:bg-bg-card-hover hover:border-text-muted">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
            LinkedIn
          </a>
          <a v-if="developer.githubUrl" :href="developer.githubUrl" target="_blank" class="flex items-center gap-2 px-5 py-3 bg-bg-card border border-border rounded-full text-text no-underline text-sm transition-all hover:bg-bg-card-hover hover:border-text-muted">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            GitHub
          </a>
          <a v-if="developer.website" :href="developer.website" target="_blank" class="flex items-center gap-2 px-5 py-3 bg-bg-card border border-border rounded-full text-text no-underline text-sm transition-all hover:bg-bg-card-hover hover:border-text-muted">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            Site
          </a>
        </div>
      </header>

      <section v-if="developer.bio" class="py-8 border-b border-border">
        <h2 class="font-display text-sm font-medium uppercase tracking-widest text-text-muted mb-4">Bio</h2>
        <p class="text-lg leading-relaxed">{{ developer.bio }}</p>
      </section>

      <section v-if="developer.skills?.length" class="py-8 border-b border-border">
        <h2 class="font-display text-sm font-medium uppercase tracking-widest text-text-muted mb-4">Technologies</h2>
        <div class="flex flex-wrap gap-3">
          <span v-for="skill in developer.skills" :key="skill" class="px-5 py-2 bg-bg-card border border-border rounded-full text-sm">
            {{ skill }}
          </span>
        </div>
      </section>

      <section v-if="developer.openTo?.length" class="py-8 border-b border-border">
        <h2 class="font-display text-sm font-medium uppercase tracking-widest text-text-muted mb-4">Disponible pour</h2>
        <div class="flex flex-wrap gap-3">
          <span v-for="tag in developer.openTo" :key="tag" class="px-6 py-3 bg-text text-bg rounded-full text-sm font-medium">
            {{ openToLabels[tag] || tag }}
          </span>
        </div>
      </section>

      <section v-if="developer.speakerProfile" class="py-8">
        <div class="inline-flex items-center gap-3 px-6 py-3 bg-bg-card border border-border rounded-full text-sm font-medium mb-6">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
            <line x1="8" y1="23" x2="16" y2="23"/>
          </svg>
          Speakeuse
        </div>

        <h2 class="font-display text-sm font-medium uppercase tracking-widest text-text-muted mb-4">Profil Speakeuse</h2>

        <div v-if="developer.speakerProfile.topics?.length" class="flex flex-wrap items-center gap-3 mb-4">
          <span class="text-sm text-text-muted">Sujets :</span>
          <span v-for="topic in developer.speakerProfile.topics" :key="topic" class="px-4 py-2 bg-bg-card border border-border rounded-full text-sm">
            {{ topic }}
          </span>
        </div>

        <div class="flex gap-4">
          <span v-if="developer.speakerProfile.remoteOk" class="text-sm text-text-muted">Remote possible</span>
          <span v-if="developer.speakerProfile.travelWilling" class="text-sm text-text-muted">Se déplace</span>
        </div>
      </section>
    </div>
  </div>
</template>
