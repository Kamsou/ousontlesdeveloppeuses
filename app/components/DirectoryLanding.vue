<script setup lang="ts">
import type { LandingType } from '#shared/utils/landings'

interface LandingSummary {
  slug: string
  label: string
  count: number
}

interface Landing {
  type: LandingType
  slug: string
  label: string
  count: number
  speakers: number
  mentoring: number
  developers: {
    slug: string
    name: string
    title: string | null
    location: string | null
    avatarUrl: string | null
    skills: string[]
    openTo: string[]
    isSpeaker: boolean
  }[]
  relatedTechs: LandingSummary[]
  relatedCities: LandingSummary[]
  otherCities: LandingSummary[]
  otherTechs: LandingSummary[]
}

const props = defineProps<{
  type: LandingType
  slug: string
}>()

const { $clientPosthog } = useNuxtApp()
const { status, signIn } = useAuth()

const { data: landing, error } = await useFetch<Landing>(`/api/landings/${props.type}/${props.slug}`)

if (error.value || !landing.value) {
  throw createError({ statusCode: 404, message: 'Page introuvable', fatal: true })
}

const SITE_URL = 'https://ousontlesdeveloppeuses.fr'

const isCity = computed(() => props.type === 'ville')

const heroTitle = computed(() => isCity.value ? `Développeuses à ${landing.value?.label}` : `Développeuses ${landing.value?.label}`)

function listLabels(items: LandingSummary[], limit: number) {
  const labels = items.slice(0, limit).map(item => item.label)
  if (labels.length <= 1) return labels.join('')
  return `${labels.slice(0, -1).join(', ')} et ${labels.at(-1)}`
}

const intro = computed(() => {
  const data = landing.value
  if (!data) return ''
  const sentences = isCity.value
    ? [`${data.count} développeuses tech à ${data.label} ont un profil sur OSLD.`]
    : [`${data.count} développeuses codent en ${data.label} et ont un profil sur OSLD.`]
  if (isCity.value && data.relatedTechs.length) {
    sentences.push(`Les stacks les plus représentées\u00a0: ${listLabels(data.relatedTechs, 3)}.`)
  }
  if (!isCity.value && data.relatedCities.length) {
    sentences.push(`On les retrouve notamment à ${listLabels(data.relatedCities, 3)}.`)
  }
  const extras = [
    data.speakers ? `${data.speakers} ${data.speakers > 1 ? 'sont speakeuses' : 'est speakeuse'}` : '',
    data.mentoring ? `${data.mentoring} ${data.mentoring > 1 ? 'proposent' : 'propose'} du mentoring` : ''
  ].filter(Boolean)
  if (extras.length) sentences.push(`${extras.join(', ')}.`.replace(/^./, c => c.toUpperCase()))
  return sentences.join(' ')
})

const seoTitle = computed(() => isCity.value
  ? `Développeuses à ${landing.value?.label} : ${landing.value?.count} profils tech`
  : `Développeuses ${landing.value?.label} en France : ${landing.value?.count} profils`)

const seoDescription = computed(() => {
  const data = landing.value
  if (!data) return ''
  const focus = isCity.value
    ? `Trouve une développeuse à ${data.label}`
    : `Trouve une développeuse ${data.label}`
  return `${focus} : ${data.count} profils sur l'annuaire OSLD. Speakeuses, mentoring, freelance, coffee chat. Contacte-les directement.`.slice(0, 160)
})

const exploreTechs = computed(() => isCity.value ? landing.value?.relatedTechs ?? [] : landing.value?.otherTechs ?? [])
const exploreCities = computed(() => isCity.value ? landing.value?.otherCities ?? [] : landing.value?.relatedCities ?? [])

function handleCreateProfile() {
  $clientPosthog?.capture('cta_clicked', { cta: 'landing_create_profile', landing: `${props.type}/${props.slug}` })
  if (status.value === 'authenticated') {
    navigateTo('/profile')
  } else {
    signIn('github')
  }
}

useSeoMeta({
  title: seoTitle,
  description: seoDescription,
  ogTitle: seoTitle,
  ogDescription: seoDescription,
  twitterCard: 'summary_large_image'
})

useSchemaOrg([
  defineWebPage({ '@type': 'CollectionPage', name: seoTitle, description: seoDescription }),
  defineBreadcrumb({
    itemListElement: [
      { name: 'Annuaire', item: '/directory' },
      { name: heroTitle.value, item: `/directory/${props.type}/${props.slug}` }
    ]
  }),
  {
    '@type': 'ItemList',
    'name': heroTitle.value,
    'numberOfItems': landing.value.count,
    'itemListElement': landing.value.developers.map((dev, i) => ({
      '@type': 'ListItem',
      'position': i + 1,
      'name': dev.name,
      'url': `${SITE_URL}/directory/${dev.slug}`
    }))
  }
])

defineOgImage('Listing', {
  label: `annuaire / ${props.slug}`,
  title: 'Développeuses',
  outline: isCity.value ? `à ${landing.value.label}` : landing.value.label,
  count: landing.value.count,
  countLabel: isCity.value ? 'profils tech' : 'profils en France',
  avatars: landing.value.developers.filter(dev => dev.avatarUrl).slice(0, 5).map(dev => optimizedAvatar(dev.avatarUrl, 128))
})
</script>

<template>
  <div v-if="landing">
    <PageHero :label="`annuaire / ${type} / ${slug}`" :title="heroTitle">
      <template #before>
        <NuxtLink to="/directory" class="group inline-flex items-center gap-2 mb-8 font-mono text-xs text-foreground-muted no-underline hover:text-foreground transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="transition-transform group-hover:-translate-x-0.5 motion-reduce:transition-none" aria-hidden="true">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          /directory
        </NuxtLink>
      </template>
      {{ intro }}
    </PageHero>

    <section class="px-4 md:px-16 py-12 md:py-16 border-t border-border/10">
      <div class="w-full max-w-7xl mx-auto">
        <div class="flex items-end justify-between gap-4 mb-8">
          <h2 class="font-mono text-xs text-foreground-muted"># profils</h2>
          <span class="font-mono text-xs text-foreground-muted">{{ landing.count }} profils</span>
        </div>

        <ul class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          <li v-for="dev in landing.developers" :key="dev.slug">
            <NuxtLink
              :to="`/directory/${dev.slug}`"
              class="spotlight-card group flex h-full flex-col gap-5 p-5 md:p-6 rounded-3xl border border-border/10 bg-background-card no-underline text-foreground"
              @pointermove="trackPointer"
            >
              <span class="flex items-center gap-4">
                <img
                  v-if="dev.avatarUrl"
                  :src="optimizedAvatar(dev.avatarUrl, 112)"
                  :alt="dev.name"
                  width="56"
                  height="56"
                  loading="lazy"
                  class="w-14 h-14 rounded-full object-cover grayscale group-hover:grayscale-0 transition-[filter] duration-500 motion-reduce:transition-none"
                />
                <span v-else class="w-14 h-14 rounded-full bg-foreground/10 flex items-center justify-center font-display text-lg" aria-hidden="true">{{ dev.name.charAt(0) }}</span>
                <span class="min-w-0 flex-1">
                  <span class="block font-display text-lg font-medium truncate">{{ dev.name }}</span>
                  <span class="block font-mono text-xs text-foreground-muted truncate">{{ dev.location || 'France' }}</span>
                </span>
                <span v-if="dev.isSpeaker" class="shrink-0 px-2.5 py-1 rounded-full border border-border/20 font-mono text-[0.65rem] text-foreground-muted">speakeuse</span>
              </span>
              <span v-if="dev.title" class="text-sm text-foreground-muted leading-relaxed line-clamp-2">{{ dev.title }}</span>
              <span v-if="dev.skills.length" class="flex flex-wrap gap-1.5 mt-auto">
                <span v-for="skill in dev.skills.slice(0, 4)" :key="skill" class="px-2.5 py-1 text-xs border border-border/15 rounded-full text-foreground-muted">{{ skill }}</span>
              </span>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </section>

    <section class="px-4 md:px-16 py-12 md:py-16 border-t border-border/10">
      <div class="w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-12">
        <div v-if="exploreTechs.length">
          <h2 class="font-mono text-xs text-foreground-muted mb-4"># {{ isCity ? `stacks-à-${slug}` : 'autres-technos' }}</h2>
          <ul class="flex flex-wrap gap-2">
            <li v-for="tech in exploreTechs" :key="tech.slug">
              <NuxtLink :to="`/directory/techno/${tech.slug}`" class="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/15 text-sm text-foreground no-underline hover:border-foreground/40 transition-colors">
                Développeuses {{ tech.label }}
                <span class="font-mono text-xs text-foreground-muted">{{ tech.count }}</span>
              </NuxtLink>
            </li>
          </ul>
        </div>
        <div v-if="exploreCities.length">
          <h2 class="font-mono text-xs text-foreground-muted mb-4"># {{ isCity ? 'autres-villes' : `où-codent-elles-en-${slug}` }}</h2>
          <ul class="flex flex-wrap gap-2">
            <li v-for="city in exploreCities" :key="city.slug">
              <NuxtLink :to="`/directory/ville/${city.slug}`" class="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/15 text-sm text-foreground no-underline hover:border-foreground/40 transition-colors">
                Développeuses à {{ city.label }}
                <span class="font-mono text-xs text-foreground-muted">{{ city.count }}</span>
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <section class="px-4 md:px-16 pb-16 md:pb-24">
      <div class="spotlight-card w-full max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6 p-6 md:p-10 rounded-3xl border border-border/10 bg-background-card" @pointermove="trackPointer">
        <div>
          <p class="font-mono text-xs text-foreground-muted mb-3"># sois-trouvée</p>
          <p class="font-display text-2xl md:text-3xl font-medium tracking-tight">
            {{ isCity ? `Tu es développeuse à ${landing.label} ?` : `Tu codes en ${landing.label} ?` }}
          </p>
          <p class="text-foreground-muted mt-2">Ajoute ton profil : les orgas, recruteurs et recruteuses et les autres devs te trouveront ici.</p>
        </div>
        <button
          class="shrink-0 inline-flex items-center gap-3 px-6 py-4 bg-foreground border border-b-[3px] border-foreground border-b-foreground-muted/50 text-background rounded-full text-sm font-medium cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-glow active:translate-y-px active:border-b active:shadow-none"
          @click="handleCreateProfile"
        >
          Crée ton profil
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </section>
  </div>
</template>
