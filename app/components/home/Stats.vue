<script setup lang="ts">
import { TransitionPresets } from '@vueuse/core'
import type { HomeDeveloper, HomeStats } from '~/utils/home'

const props = defineProps<{
  stats: HomeStats | null
  developers: HomeDeveloper[]
}>()

const reducedMotion = usePreferredReducedMotion()

const sectionRef = ref<HTMLElement | null>(null)
const visible = useRevealOnce(sectionRef, 0.25)

const targets = computed(() => {
  const s = visible.value ? props.stats : null
  return [s?.developers ?? 0, s?.locations ?? 0, s?.speakers ?? 0]
})

const animated = useTransition(targets, {
  duration: computed(() => reducedMotion.value === 'reduce' ? 0 : 1800),
  transition: TransitionPresets.easeOutExpo
})

const counters = computed(() => animated.value.map(v => Math.round(v)))

const avatars = computed(() => props.developers.filter(d => d.avatarUrl).slice(0, 7))

const cities = computed(() => {
  const seen = new Set<string>()
  for (const dev of props.developers) {
    const city = dev.location?.split(',')[0]?.trim()
    if (city) seen.add(city)
    if (seen.size >= 8) break
  }
  return [...seen]
})

function pluralize(count: number, singular: string, plural: string) {
  return count <= 1 ? singular : plural
}
</script>

<template>
  <section id="stats" ref="sectionRef" class="py-16 md:py-32 lg:py-14 lg:min-h-[calc(100svh-80px)] lg:flex lg:flex-col lg:justify-center px-4 md:px-16 border-t border-border/10">
    <div class="w-full max-w-7xl mx-auto">
      <div class="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p class="inline-block font-mono text-xs text-foreground-muted mb-3"># en-direct</p>
          <h2 class="font-display text-4xl md:text-6xl font-medium tracking-tight">
            Partout en France.
          </h2>
        </div>
        <p class="text-foreground-muted text-sm md:text-base max-w-sm">
          Chaque chiffre, c'est une développeuse qui a choisi d'être visible. Et ça grandit tous les jours.
        </p>
      </div>

      <ClientOnly>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <NuxtLink
            to="/directory"
            class="spotlight-card col-span-2 lg:row-span-2 flex flex-col justify-between gap-10 p-6 md:p-10 border border-border/10 rounded-3xl bg-background-card no-underline text-foreground"
            @pointermove="trackPointer"
          >
            <span class="font-mono text-xs text-foreground-muted">01 / annuaire</span>
            <div>
              <div class="font-display text-[clamp(5rem,16vw,12rem)] font-medium tracking-tighter leading-[0.85] tabular-nums">
                {{ counters[0] }}
              </div>
              <div class="mt-4 flex items-center justify-between gap-4 flex-wrap">
                <span class="text-foreground-muted">{{ pluralize(counters[0] ?? 0, 'Développeuse référencée', 'Développeuses référencées') }}</span>
                <div v-if="avatars.length" class="flex -space-x-3">
                  <img
                    v-for="dev in avatars"
                    :key="dev.id"
                    :src="optimizedAvatar(dev.avatarUrl, 64)"
                    alt=""
                    width="36"
                    height="36"
                    loading="lazy"
                    class="w-9 h-9 rounded-full border-2 border-background object-cover grayscale hover:grayscale-0 transition-[filter]"
                  />
                  <span class="w-9 h-9 rounded-full border-2 border-background bg-foreground text-background text-[0.65rem] font-medium flex items-center justify-center">+</span>
                </div>
              </div>
            </div>
          </NuxtLink>

          <div class="spotlight-card col-span-2 flex flex-col justify-between gap-6 p-6 md:p-8 border border-border/10 rounded-3xl bg-background-card" @pointermove="trackPointer">
            <div class="flex items-start justify-between gap-4">
              <div>
                <div class="font-display text-6xl md:text-7xl font-medium tracking-tight leading-none tabular-nums">{{ counters[1] }}</div>
                <div class="text-foreground-muted text-sm mt-2">{{ pluralize(counters[1] ?? 0, 'Ville', 'Villes') }}</div>
              </div>
              <span class="font-mono text-xs text-foreground-muted">02 / partout</span>
            </div>
            <div v-if="cities.length" class="flex flex-wrap gap-1.5">
              <span v-for="city in cities" :key="city" class="px-2.5 py-1 text-xs border border-border/15 rounded-full text-foreground-muted">{{ city }}</span>
            </div>
          </div>


          <NuxtLink to="/speakers" class="spotlight-card col-span-2 flex flex-col justify-between gap-6 p-6 md:p-8 border border-border/10 rounded-3xl bg-background-card no-underline text-foreground" @pointermove="trackPointer">
            <span class="font-mono text-xs text-foreground-muted">03 / conférences</span>
            <div>
              <div class="font-display text-5xl md:text-6xl font-medium tracking-tight leading-none tabular-nums">{{ counters[2] }}</div>
              <div class="text-foreground-muted text-sm mt-2">{{ pluralize(counters[2] ?? 0, 'Speakeuse', 'Speakeuses') }}</div>
            </div>
          </NuxtLink>
        </div>
        <template #fallback>
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <div class="col-span-2 lg:row-span-2 h-72 lg:h-auto rounded-3xl bg-foreground/5 animate-pulse"></div>
            <div class="col-span-2 h-44 rounded-3xl bg-foreground/5 animate-pulse"></div>
            <div class="col-span-2 h-44 rounded-3xl bg-foreground/5 animate-pulse"></div>
          </div>
        </template>
      </ClientOnly>
    </div>
  </section>
</template>
