<script setup lang="ts">
import { seededRandom } from '~/utils/home'

useSeoMeta({
  title: 'Podcasts Tech & Développeuses',
  description: 'Podcasts tech par et pour les développeuses. Interviews, retours d\'expérience et discussions sur le dev, la tech et les parcours féminins.',
  ogTitle: 'Podcasts Tech & Développeuses',
  ogDescription: 'Podcasts tech par et pour les développeuses. Interviews, retours d\'expérience et discussions tech.',
  twitterCard: 'summary_large_image',
})

defineOgImage('Listing', {
  label: 'podcasts',
  title: 'Des parcours',
  outline: 'à écouter',
  subtitle: 'Épisodes de podcasts tech avec des développeuses.'
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
  publishedAt: string | null
}

const { data: podcasts, status } = await useFetch<Podcast[]>('/api/podcasts')

const emailCopied = ref(false)

const waveforms = computed(() => {
  const map = new Map<number, number[]>()
  for (const podcast of podcasts.value ?? []) {
    const rand = seededRandom(podcast.id * 7919 + 13)
    map.set(podcast.id, Array.from({ length: 36 }, (_, i) => {
      const envelope = 0.55 + 0.45 * Math.sin((i / 35) * Math.PI)
      return Math.max(0.12, (0.25 + rand() * 0.75) * envelope)
    }))
  }
  return map
})

function formatDate(dateStr: string | null) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  return d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
}

async function copyEmail() {
  await navigator.clipboard.writeText('contact@ousontlesdeveloppeuses.fr')
  emailCopied.value = true
  setTimeout(() => { emailCopied.value = false }, 2000)
}

function initial(name: string) {
  return name.trim().charAt(0).toUpperCase()
}

function pad(value: number) {
  return String(value).padStart(2, '0')
}
</script>

<template>
  <div>
    <PageHero label="podcasts" title="Podcasts">
      Épisodes de podcasts par et pour les développeuses. Interviews, retours d'expérience et discussions tech.
    </PageHero>

    <section class="px-4 md:px-16 pb-20 md:pb-32">
      <div class="w-full max-w-7xl mx-auto border-t border-border/10 pt-8 md:pt-10">
        <div class="flex items-center justify-between gap-4 mb-8 md:mb-10">
          <p class="font-mono text-xs text-foreground-muted"># épisodes</p>
          <p v-if="podcasts?.length" class="font-mono text-xs text-foreground-muted">
            {{ pad(podcasts.length) }} {{ podcasts.length > 1 ? 'épisodes' : 'épisode' }}
          </p>
        </div>

        <div v-if="status === 'pending'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4" aria-label="Chargement des podcasts">
          <div v-for="i in 6" :key="i" class="h-96 rounded-3xl border border-border/10 bg-background-card motion-safe:animate-pulse"></div>
        </div>

        <div v-else-if="!podcasts?.length" class="flex flex-col items-center text-center gap-3 py-16 px-6 rounded-3xl border border-dashed border-border/15">
          <span class="font-mono text-xs text-foreground-muted">// silence radio</span>
          <p class="text-foreground-muted">Aucun podcast pour le moment.</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          <a
            v-for="(podcast, i) in podcasts"
            :key="podcast.id"
            :href="podcast.url"
            target="_blank"
            rel="noopener noreferrer"
            :class="[
              'podcast-card spotlight-card group flex flex-col p-4 md:p-5 rounded-3xl border bg-background-card no-underline text-foreground transition-colors',
              podcast.highlight ? 'border-border/25' : 'border-border/10 hover:border-border/20'
            ]"
            :style="{ animationDelay: `${i * 60}ms` }"
            @pointermove="trackPointer"
          >
            <div class="relative overflow-hidden rounded-2xl border border-border/10 bg-background/60">
              <img
                v-if="podcast.imageUrl"
                :src="podcast.imageUrl"
                :alt="podcast.title"
                loading="lazy"
                class="w-full aspect-[16/10] object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
              <div v-else aria-hidden="true" class="absolute inset-0 grid-lines [mask-image:linear-gradient(to_top,#000,transparent_85%)]"></div>

              <div class="absolute inset-x-0 top-0 z-[1] flex items-center justify-between gap-3 p-4">
                <span :class="['font-mono text-xs', podcast.imageUrl ? 'px-2 py-0.5 rounded-full bg-background/80 text-foreground' : 'text-foreground-muted']">ep. {{ pad(i + 1) }}</span>
                <span v-if="podcast.highlight" class="px-2.5 py-1 rounded-full bg-foreground text-background text-xs font-medium">Coup de cœur</span>
              </div>

              <div :class="['flex items-end gap-4 p-4', podcast.imageUrl ? 'absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/70 to-transparent pt-12' : 'relative h-36']">
                <span class="w-11 h-11 shrink-0 rounded-full border border-border/20 bg-background/80 flex items-center justify-center transition-colors group-hover:bg-foreground group-hover:text-background group-hover:border-foreground" aria-hidden="true">
                  <svg class="w-4 h-4 translate-x-px" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z"/>
                  </svg>
                </span>
                <div class="flex-1 flex items-center gap-[3px] h-11" aria-hidden="true">
                  <span
                    v-for="(height, j) in waveforms.get(podcast.id)"
                    :key="j"
                    class="wave flex-1 rounded-full bg-foreground/25 group-hover:bg-foreground"
                    :style="{ height: `${height * 100}%`, '--d': `${j * 22}ms`, animationDelay: `${j * -80}ms` }"
                  ></span>
                </div>
              </div>
            </div>

            <div class="flex flex-col flex-1 px-2 pt-5 pb-1">
              <p class="font-mono text-xs text-foreground-muted truncate mb-3">{{ podcast.podcastName }}</p>

              <h2 class="font-display text-xl md:text-2xl font-medium tracking-tight leading-tight mb-4 line-clamp-2">
                {{ podcast.title }}
              </h2>

              <p v-if="podcast.guestName" class="flex items-center gap-2.5 text-sm text-foreground mb-3">
                <span class="w-7 h-7 shrink-0 rounded-full bg-gradient-to-br from-foreground/25 to-foreground/5 flex items-center justify-center font-display text-xs font-medium" aria-hidden="true">
                  {{ initial(podcast.guestName) }}
                </span>
                <span><span class="text-foreground-muted">avec</span> {{ podcast.guestName }}</span>
              </p>

              <p v-if="podcast.description" class="text-foreground-muted text-sm leading-relaxed line-clamp-3 mb-6">
                {{ podcast.description }}
              </p>

              <div class="mt-auto pt-4 border-t border-border/10 flex items-center justify-between gap-4">
                <span class="font-mono text-xs text-foreground-muted">{{ formatDate(podcast.publishedAt) ?? 'épisode' }}</span>
                <span class="inline-flex items-center gap-1.5 text-sm font-medium">
                  Écouter
                  <svg class="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path d="M7 17L17 7M8 7h9v9"/>
                  </svg>
                </span>
              </div>
            </div>
          </a>
        </div>

        <div class="relative mt-16 md:mt-24 overflow-hidden rounded-3xl border border-border/10 bg-background-card p-8 md:p-12">
          <div aria-hidden="true" class="absolute inset-0 grid-lines [mask-image:radial-gradient(ellipse_at_bottom_right,#000_10%,transparent_65%)]"></div>
          <div class="relative grid md:grid-cols-[1fr_auto] md:items-end gap-8">
            <div>
              <p class="font-mono text-xs text-foreground-muted mb-3"># suggérer</p>
              <h2 class="font-display text-3xl md:text-4xl font-medium tracking-tight mb-4">
                Un podcast à suggérer ?
              </h2>
              <p class="text-foreground-muted max-w-lg leading-relaxed">
                Tu connais un épisode de podcast avec une développeuse qui devrait être listé ici ? Copie notre email et envoie-le nous.
              </p>
            </div>
            <div class="flex flex-col items-start md:items-end gap-3">
              <button
                type="button"
                @click="copyEmail"
                class="inline-flex items-center gap-2 px-6 py-4 bg-foreground border border-b-[3px] border-foreground border-b-foreground-muted/50 text-background rounded-full text-sm font-medium transition-all hover:-translate-y-0.5 hover:shadow-glow active:translate-y-px active:border-b active:shadow-none cursor-pointer"
              >
                <span aria-live="polite">{{ emailCopied ? 'Email copié !' : 'Copier l\'email' }}</span>
                <svg v-if="!emailCopied" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </button>
              <span class="font-mono text-xs text-foreground-muted break-all">contact@ousontlesdeveloppeuses.fr</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.podcast-card {
  animation: card-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes card-in {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
}

.wave {
  transform-origin: center;
  transition: background-color 0.25s ease;
}

.group:hover .wave {
  transition-delay: var(--d);
  animation: wave 1s ease-in-out infinite alternate;
}

@keyframes wave {
  from { transform: scaleY(0.45); }
  to { transform: scaleY(1); }
}

@media (prefers-reduced-motion: reduce) {
  .podcast-card,
  .group:hover .wave {
    animation: none;
  }

  .group:hover .wave {
    transition-delay: 0ms;
  }
}
</style>
