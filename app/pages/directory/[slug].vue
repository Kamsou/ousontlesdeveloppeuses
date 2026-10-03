<script setup lang="ts">
import { getExperienceLabel, lookingForLabels } from '~/utils/constants'

interface Developer {
  id: number
  slug: string
  name: string
  avatarUrl: string | null
  bio: string | null
  title: string | null
  location: string | null
  yearsExperience: number | null
  website: string | null
  githubUrl: string | null
  linkedinUrl: string | null
  twitterUrl: string | null
  skills: string[]
  openTo: string[]
  lookingFor: string[]
  speakerProfile: {
    topics: string[]
    pastTalksUrl: string | null
    available: boolean | null
    remoteOk: boolean | null
    travelWilling: boolean | null
  } | null
}

import { openToLabels } from '~/utils/constants'
import { queryString } from '~/utils/query'

interface RelatedDevelopers {
  city: string | null
  cityLanding: string | null
  developers: {
    slug: string
    name: string
    title: string | null
    location: string | null
    avatarUrl: string | null
    sameCity: boolean
  }[]
}

const { $clientPosthog } = useNuxtApp()
const route = useRoute()
const slug = queryString(route.params.slug)

const { data: developer, error } = await useFetch<Developer>(`/api/developers/${slug}`)

if (error.value) {
  throw createError({ statusCode: 404, message: 'Profil non trouvé' })
}

if (developer.value && slug !== developer.value.slug) {
  await navigateTo(`/directory/${developer.value.slug}`, { redirectCode: 301 })
}

const { data: related } = await useFetch<RelatedDevelopers>(`/api/developers/${developer.value?.slug ?? slug}/related`)

// SEO dynamique enrichi
const seoTitle = computed(() => {
  if (!developer.value) return 'Profil Développeuse - OSLD'
  const { name, location, skills } = developer.value
  const place = location ? ` à ${location.split(',')[0]?.trim()}` : ''
  const withSkills = (count: number) => {
    const stack = skills?.slice(0, count).join(' & ')
    return `${name} - Développeuse${stack ? ` ${stack}` : ''}${place}`
  }
  const twoSkills = withSkills(2)
  return twoSkills.length <= 60 ? twoSkills : withSkills(1)
})

const seoDescription = computed(() => {
  if (!developer.value) return 'Profil de développeuse sur OSLD'
  const parts: string[] = []

  if (developer.value.title) {
    parts.push(developer.value.title)
  } else if (developer.value.bio) {
    parts.push(developer.value.bio.slice(0, 120))
  }

  if (developer.value.skills?.length) {
    parts.push(`Compétences : ${developer.value.skills.slice(0, 5).join(', ')}`)
  }

  if (developer.value.lookingFor?.length) {
    const labels = developer.value.lookingFor.map(l => lookingForLabels[l] || l)
    parts.push(`En recherche active : ${labels.join(', ')}`)
  }

  if (developer.value.openTo?.length) {
    const labels = developer.value.openTo.map(o => openToLabels[o] || o).slice(0, 3)
    parts.push(`Échanges : ${labels.join(', ')}`)
  }

  return parts.map(part => part.trim().replace(/[.\s]+$/, '')).join('. ').slice(0, 160) || 'Découvrez le profil de cette développeuse sur OSLD'
})

const relatedCity = computed(() => {
  const city = related.value?.city
  return city && related.value?.developers.some(dev => dev.sameCity) ? city : null
})

const relatedHeading = computed(() => {
  if (!relatedCity.value) return 'D\'autres développeuses avec une stack proche'
  if (related.value?.developers.every(dev => dev.sameCity)) return `D'autres développeuses à ${relatedCity.value}`
  return `D'autres développeuses à ${relatedCity.value} ou avec une stack proche`
})

const heroMeta = computed(() => {
  if (!developer.value) return ''
  const experience = developer.value.yearsExperience !== null && developer.value.yearsExperience !== undefined
    ? getExperienceLabel(developer.value.yearsExperience)
    : null
  return [developer.value.location, experience].filter(Boolean).join(' · ')
})

useSeoMeta({
  title: seoTitle,
  description: seoDescription,
  ogTitle: seoTitle,
  ogDescription: seoDescription,
  ogType: 'profile',
  twitterCard: 'summary_large_image',
  twitterTitle: seoTitle,
  twitterDescription: seoDescription,
})

useSchemaOrg([
  definePerson({
    name: () => developer.value?.name || '',
    description: () => developer.value?.bio || undefined,
    image: () => developer.value?.avatarUrl || undefined,
    jobTitle: () => developer.value?.title || 'Développeuse',
    url: () => developer.value ? `https://ousontlesdeveloppeuses.fr/directory/${developer.value.slug}` : undefined,
    sameAs: () => {
      const links = [developer.value?.website, developer.value?.linkedinUrl, developer.value?.githubUrl, developer.value?.twitterUrl].filter((link): link is string => !!link)
      return links.length ? links : undefined
    },
    address: developer.value?.location ? {
      '@type': 'PostalAddress',
      addressLocality: developer.value.location,
      addressCountry: 'FR'
    } : undefined,
    knowsAbout: () => developer.value?.skills || undefined,
  }),
])

defineOgImage('Default', {
  name: developer.value?.name,
  jobTitle: developer.value?.title ?? undefined,
  location: developer.value?.location ?? undefined,
  skills: developer.value?.skills,
  avatarUrl: developer.value?.avatarUrl ? optimizedAvatar(developer.value.avatarUrl, 400) : undefined,
  isSpeaker: !!developer.value?.speakerProfile?.available || !!developer.value?.openTo?.includes('conference'),
  openTo: developer.value?.openTo?.map(type => openToLabels[type] || type).filter(label => label !== 'Conférence')
})

onMounted(() => {
  if (!developer.value) return
  $clientPosthog?.capture('profile_viewed', {
    developer_id: developer.value.id,
    location: developer.value.location,
    is_speaker: developer.value.openTo?.includes('conference') || false
  })
})
</script>

<template>
  <div v-if="developer">
    <PageHero label="développeuse" :title="developer.name">
      <template #before>
        <NuxtLink to="/directory" class="group inline-flex items-center gap-2 font-mono text-xs text-foreground-muted no-underline mb-10 md:mb-12 transition-colors hover:text-foreground">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" class="transition-transform group-hover:-translate-x-1 motion-reduce:transition-none">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          /directory
        </NuxtLink>
        <div class="flex items-center gap-4 mb-8">
          <img
            :src="developer.avatarUrl || '/default-avatar.png'"
            :alt="`Photo de profil de ${developer.name}, développeuse${developer.location ? ` basée à ${developer.location}` : ''}`"
            width="96"
            height="96"
            class="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border border-border/15"
          />
          <span v-if="developer.speakerProfile" class="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border/15 rounded-full font-mono text-xs text-foreground-muted">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4"/>
            </svg>
            speakeuse
          </span>
        </div>
      </template>

      <p v-if="developer.title" class="text-foreground">{{ developer.title }}</p>
      <p v-if="heroMeta" :class="['font-mono text-sm', developer.title ? 'mt-2' : '']">{{ heroMeta }}</p>

      <template v-if="developer.linkedinUrl || developer.githubUrl || developer.website" #after>
        <div class="flex flex-wrap gap-2">
          <a v-if="developer.linkedinUrl" :href="developer.linkedinUrl" target="_blank" rel="noopener" class="group inline-flex items-center gap-2 px-4 py-2.5 border border-border/15 rounded-full text-foreground no-underline text-sm transition-colors hover:border-foreground/40 hover:bg-foreground/[0.04]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
            LinkedIn
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" class="text-foreground-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none">
              <path d="M7 17L17 7M8 7h9v9"/>
            </svg>
          </a>
          <a v-if="developer.githubUrl" :href="developer.githubUrl" target="_blank" rel="noopener" class="group inline-flex items-center gap-2 px-4 py-2.5 border border-border/15 rounded-full text-foreground no-underline text-sm transition-colors hover:border-foreground/40 hover:bg-foreground/[0.04]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            GitHub
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" class="text-foreground-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none">
              <path d="M7 17L17 7M8 7h9v9"/>
            </svg>
          </a>
          <a v-if="developer.website" :href="developer.website" target="_blank" rel="noopener" class="group inline-flex items-center gap-2 px-4 py-2.5 border border-border/15 rounded-full text-foreground no-underline text-sm transition-colors hover:border-foreground/40 hover:bg-foreground/[0.04]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/>
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            Site
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" class="text-foreground-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none">
              <path d="M7 17L17 7M8 7h9v9"/>
            </svg>
          </a>
        </div>
      </template>
    </PageHero>

    <section class="px-4 md:px-16 py-12 md:py-16 border-t border-border/10">
      <div class="w-full max-w-7xl mx-auto grid lg:grid-cols-[minmax(0,1fr)_380px] gap-12 lg:gap-16 items-start">
        <div class="flex flex-col gap-12">
          <section v-if="developer.bio">
            <h2 class="font-mono text-xs text-foreground-muted mb-4"># bio</h2>
            <p class="text-lg md:text-xl leading-relaxed whitespace-pre-line max-w-3xl">{{ developer.bio }}</p>
          </section>

          <section v-if="developer.skills?.length" :class="developer.bio ? 'pt-12 border-t border-border/10' : ''">
            <h2 class="font-mono text-xs text-foreground-muted mb-4"># compétences</h2>
            <div class="flex flex-wrap gap-2">
              <span v-for="skill in developer.skills" :key="skill" class="px-4 py-2 border border-border/15 rounded-full text-sm">
                {{ skill }}
              </span>
            </div>
          </section>
        </div>

        <div v-if="developer.lookingFor?.length || developer.openTo?.length || developer.speakerProfile" class="flex flex-col gap-3 md:gap-4">
          <section v-if="developer.lookingFor?.length" class="spotlight-card p-6 rounded-3xl border border-border/10 bg-background-card" @pointermove="trackPointer">
            <h2 class="font-mono text-xs text-foreground-muted mb-4"># en-recherche-active</h2>
            <div class="flex flex-wrap gap-2">
              <span v-for="tag in developer.lookingFor" :key="tag" class="px-4 py-2 bg-foreground text-background rounded-full text-sm font-medium">
                {{ lookingForLabels[tag] || tag }}
              </span>
            </div>
          </section>

          <section v-if="developer.openTo?.length" class="spotlight-card p-6 rounded-3xl border border-border/10 bg-background-card" @pointermove="trackPointer">
            <h2 class="font-mono text-xs text-foreground-muted mb-4"># échanges</h2>
            <div class="flex flex-wrap gap-2">
              <span v-for="tag in developer.openTo" :key="tag" class="px-4 py-2 border border-border/20 rounded-full text-sm">
                {{ openToLabels[tag] || tag }}
              </span>
            </div>
          </section>

          <section v-if="developer.speakerProfile" class="spotlight-card p-6 rounded-3xl border border-border/10 bg-background-card" @pointermove="trackPointer">
            <div class="flex items-start justify-between gap-4 mb-5">
              <h2 class="font-mono text-xs text-foreground-muted"># profil-speakeuse</h2>
              <span class="w-9 h-9 shrink-0 rounded-xl bg-foreground text-background flex items-center justify-center" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4"/>
                </svg>
              </span>
            </div>

            <div v-if="developer.speakerProfile.topics?.length" class="mb-5">
              <p class="text-sm text-foreground-muted mb-2.5">Sujets</p>
              <div class="flex flex-wrap gap-1.5">
                <span v-for="topic in developer.speakerProfile.topics" :key="topic" class="px-3 py-1.5 bg-foreground/[0.06] rounded-full text-sm">
                  {{ topic }}
                </span>
              </div>
            </div>

            <ul v-if="developer.speakerProfile.remoteOk || developer.speakerProfile.travelWilling" class="flex flex-wrap gap-x-5 gap-y-2 mb-5">
              <li v-if="developer.speakerProfile.remoteOk" class="inline-flex items-center gap-2 text-sm text-foreground-muted">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>
                Remote possible
              </li>
              <li v-if="developer.speakerProfile.travelWilling" class="inline-flex items-center gap-2 text-sm text-foreground-muted">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>
                Se déplace
              </li>
            </ul>

            <a
              v-if="safeHref(developer.speakerProfile.pastTalksUrl)"
              :href="safeHref(developer.speakerProfile.pastTalksUrl)"
              target="_blank"
              rel="noopener"
              class="group inline-flex items-center gap-2 pt-4 w-full border-t border-border/10 text-sm text-foreground underline underline-offset-4 decoration-foreground/30 hover:decoration-foreground transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <polygon points="23 7 16 12 23 17 23 7"/>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
              </svg>
              Voir ses talks passés
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" class="ml-auto text-foreground-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none">
                <path d="M7 17L17 7M8 7h9v9"/>
              </svg>
            </a>
          </section>
        </div>
      </div>
    </section>

    <section v-if="related?.developers.length" class="px-4 md:px-16 py-12 md:py-16 border-t border-border/10">
      <div class="w-full max-w-7xl mx-auto">
        <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
          <div>
            <p class="font-mono text-xs text-foreground-muted mb-3"># autres-profils</p>
            <h2 class="font-display text-3xl md:text-4xl font-medium tracking-tight">{{ relatedHeading }}</h2>
          </div>
          <NuxtLink
            :to="related.cityLanding ? `/directory/ville/${related.cityLanding}` : relatedCity ? { path: '/directory', query: { location: relatedCity } } : '/directory'"
            class="font-mono text-xs text-foreground-muted underline underline-offset-4 decoration-foreground/30 hover:text-foreground hover:decoration-foreground transition-colors"
          >
            {{ relatedCity ? `toutes les devs à ${relatedCity} →` : 'voir tout l\'annuaire →' }}
          </NuxtLink>
        </div>
        <ul class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          <li v-for="dev in related.developers" :key="dev.slug">
            <NuxtLink
              :to="`/directory/${dev.slug}`"
              class="spotlight-card group flex items-center gap-4 p-5 rounded-3xl border border-border/10 bg-background-card no-underline text-foreground"
              @pointermove="trackPointer"
            >
              <img
                v-if="dev.avatarUrl"
                :src="optimizedAvatar(dev.avatarUrl, 96)"
                :alt="dev.name"
                width="48"
                height="48"
                loading="lazy"
                class="w-12 h-12 rounded-full object-cover grayscale group-hover:grayscale-0 transition-[filter] duration-500 motion-reduce:transition-none"
              />
              <span v-else class="w-12 h-12 rounded-full bg-foreground/10 flex items-center justify-center font-display" aria-hidden="true">{{ dev.name.charAt(0) }}</span>
              <span class="min-w-0">
                <span class="block font-display font-medium truncate">{{ dev.name }}</span>
                <span class="block text-sm text-foreground-muted truncate">{{ [dev.title, dev.location].filter(Boolean).join(' · ') }}</span>
              </span>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>
