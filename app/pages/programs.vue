<script setup lang="ts">
useSeoMeta({
  title: 'Programmes pour Développeuses',
  description: 'Programmes de mentorat, communautés tech et formations pour les développeuses en France. Duchess, conférences, ressources et opportunités.',
  ogTitle: 'Programmes pour Développeuses',
  ogDescription: 'Mentorat, communautés tech, formations et conférences pour les développeuses en France.',
  twitterCard: 'summary_large_image',
})

defineOgImage('Listing', {
  label: 'ressources',
  title: 'Programmes &',
  outline: 'communautés',
  subtitle: 'Mentorat, formations, communautés et conférences pour les développeuses.'
})

interface Program {
  id: number
  name: string
  description: string
  category: 'mentoring' | 'community' | 'funding' | 'conference'
  url: string
  highlight: boolean
}

const { data: programs, status } = await useFetch<Program[]>('/api/programs')

const emailCopied = ref(false)

const categories = [
  { key: 'all', label: 'Tous' },
  { key: 'community', label: 'Communautés' },
  { key: 'mentoring', label: 'Mentorat' },
  { key: 'conference', label: 'Conférences' },
  { key: 'funding', label: 'Formations' }
]

const categoryLabels: Record<string, string> = {
  community: 'Communauté',
  mentoring: 'Mentorat',
  conference: 'Conférence',
  funding: 'Formation'
}

const activeCategory = ref('all')

const filteredPrograms = computed(() => {
  if (!programs.value) return []
  if (activeCategory.value === 'all') return programs.value
  return programs.value.filter(p => p.category === activeCategory.value)
})

const categoryCounts = computed(() => {
  const counts: Record<string, number> = { all: programs.value?.length ?? 0 }
  for (const program of programs.value ?? []) {
    counts[program.category] = (counts[program.category] ?? 0) + 1
  }
  return counts
})

async function copyEmail() {
  await navigator.clipboard.writeText('contact@ousontlesdeveloppeuses.fr')
  emailCopied.value = true
  setTimeout(() => { emailCopied.value = false }, 2000)
}

function displayHost(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

function pad(value: number) {
  return String(value).padStart(2, '0')
}
</script>

<template>
  <div>
    <PageHero label="ressources" title="Programmes & Communautés">
      Mentorat, formations, communautés et conférences pour les développeuses. On a fait le tri pour toi.
    </PageHero>

    <section class="px-4 md:px-16 pb-20 md:pb-32">
      <div class="w-full max-w-7xl mx-auto border-t border-border/10 pt-8 md:pt-10">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 md:mb-10">
          <div class="flex flex-wrap gap-2" role="group" aria-label="Filtrer par catégorie">
            <button
              v-for="cat in categories"
              :key="cat.key"
              type="button"
              :aria-pressed="activeCategory === cat.key"
              @click="activeCategory = cat.key"
              :class="[
                'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-colors cursor-pointer',
                activeCategory === cat.key
                  ? 'bg-foreground text-background border-foreground'
                  : 'border-border/15 text-foreground-muted hover:border-foreground/40 hover:text-foreground'
              ]"
            >
              {{ cat.label }}
              <span :class="['font-mono text-[11px]', activeCategory === cat.key ? 'text-background/60' : 'text-foreground-muted']">
                {{ categoryCounts[cat.key] ?? 0 }}
              </span>
            </button>
          </div>
          <p class="font-mono text-xs text-foreground-muted" aria-live="polite">
            {{ pad(filteredPrograms.length) }} {{ filteredPrograms.length > 1 ? 'résultats' : 'résultat' }}
          </p>
        </div>

        <div v-if="status === 'pending'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4" aria-label="Chargement des programmes">
          <div v-for="i in 6" :key="i" class="h-64 rounded-3xl border border-border/10 bg-background-card motion-safe:animate-pulse"></div>
        </div>

        <div v-else-if="filteredPrograms.length === 0" class="flex flex-col items-center text-center gap-3 py-16 px-6 rounded-3xl border border-dashed border-border/15">
          <span class="font-mono text-xs text-foreground-muted">// rien ici pour l'instant</span>
          <p class="text-foreground-muted">Aucun programme dans cette catégorie.</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          <a
            v-for="(program, i) in filteredPrograms"
            :key="program.id"
            :href="program.url"
            target="_blank"
            rel="noopener noreferrer"
            :class="[
              'program-card spotlight-card group flex flex-col p-6 md:p-7 rounded-3xl border bg-background-card no-underline text-foreground transition-colors',
              program.highlight ? 'border-border/25' : 'border-border/10 hover:border-border/20'
            ]"
            :style="{ animationDelay: `${i * 60}ms` }"
            @pointermove="trackPointer"
          >
            <div class="flex items-center justify-between gap-3 mb-10 md:mb-12">
              <span class="px-2.5 py-1 text-xs border border-border/15 rounded-full text-foreground-muted group-hover:text-foreground group-hover:border-foreground/30 transition-colors">
                {{ categoryLabels[program.category] }}
              </span>
              <span v-if="program.highlight" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-foreground text-background text-xs font-medium">
                <svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.6 7-6.2-3.8-6.2 3.8 1.6-7L2 9.5l7.1-.6z"/>
                </svg>
                Recommandé
              </span>
              <span v-else class="font-mono text-xs text-foreground-muted" aria-hidden="true">{{ pad(i + 1) }}</span>
            </div>

            <h2 class="font-display text-2xl md:text-[1.75rem] font-medium tracking-tight leading-tight mb-3">
              {{ program.name }}
            </h2>
            <p class="text-foreground-muted text-sm leading-relaxed mb-8">
              {{ program.description }}
            </p>

            <div class="mt-auto pt-5 border-t border-border/10 flex items-center justify-between gap-4">
              <span class="font-mono text-xs text-foreground-muted truncate">{{ displayHost(program.url) }}</span>
              <span class="w-9 h-9 shrink-0 rounded-full border border-border/15 flex items-center justify-center transition-colors group-hover:bg-foreground group-hover:text-background group-hover:border-foreground" aria-hidden="true">
                <svg class="w-4 h-4 transition-transform group-hover:translate-x-px group-hover:-translate-y-px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M7 17L17 7M8 7h9v9"/>
                </svg>
              </span>
            </div>
            <span class="sr-only"> (nouvel onglet)</span>
          </a>
        </div>

        <div class="relative mt-16 md:mt-24 overflow-hidden rounded-3xl border border-border/10 bg-background-card p-8 md:p-12">
          <div aria-hidden="true" class="absolute inset-0 grid-lines [mask-image:radial-gradient(ellipse_at_bottom_right,#000_10%,transparent_65%)]"></div>
          <div class="relative grid md:grid-cols-[1fr_auto] md:items-end gap-8">
            <div>
              <p class="font-mono text-xs text-foreground-muted mb-3"># suggérer</p>
              <h2 class="font-display text-3xl md:text-4xl font-medium tracking-tight mb-4">
                Un programme à suggérer ?
              </h2>
              <p class="text-foreground-muted max-w-lg leading-relaxed">
                Tu connais un programme, une communauté ou une conférence qui devrait être listée ici ? Copie notre email et envoie-le nous.
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
.program-card {
  animation: card-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes card-in {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .program-card {
    animation: none;
  }
}
</style>
