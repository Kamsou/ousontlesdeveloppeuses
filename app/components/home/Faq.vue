<script setup lang="ts">
import type { FaqItem } from '#shared/utils/faq'

interface LandingLink {
  slug: string
  label: string
  count: number
}

defineProps<{
  items: FaqItem[]
  cities: LandingLink[]
  techs: LandingLink[]
}>()
</script>

<template>
  <section id="faq" class="py-16 md:py-32 lg:py-14 lg:min-h-[calc(100svh-80px)] lg:flex lg:flex-col lg:justify-center px-4 md:px-16 border-t border-border/10">
    <div class="w-full max-w-7xl mx-auto grid lg:grid-cols-[1fr_1.4fr] gap-12 lg:gap-20 items-start">
      <div class="flex flex-col gap-10">
        <div>
          <p class="inline-block font-mono text-xs text-foreground-muted mb-3"># faq</p>
          <h2 class="font-display text-4xl md:text-6xl font-medium tracking-tight leading-[1.05]">Questions fréquentes</h2>
          <p class="mt-4 text-foreground-muted max-w-sm">Recruter, inviter une speakeuse, trouver une mentore ou apparaître dans l'annuaire.</p>
        </div>

        <nav v-if="cities.length || techs.length" aria-label="Explorer l'annuaire" class="flex flex-col gap-6">
          <div v-if="cities.length">
            <h3 class="font-mono text-xs text-foreground-muted mb-3"># par-ville</h3>
            <ul class="flex flex-wrap gap-2">
              <li v-for="city in cities" :key="city.slug">
                <NuxtLink :to="`/directory/ville/${city.slug}`" class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/15 text-sm text-foreground no-underline hover:border-foreground/40 transition-colors">
                  Développeuses à {{ city.label }}
                </NuxtLink>
              </li>
            </ul>
          </div>
          <div v-if="techs.length">
            <h3 class="font-mono text-xs text-foreground-muted mb-3"># par-techno</h3>
            <ul class="flex flex-wrap gap-2">
              <li v-for="tech in techs" :key="tech.slug">
                <NuxtLink :to="`/directory/techno/${tech.slug}`" class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/15 text-sm text-foreground no-underline hover:border-foreground/40 transition-colors">
                  Développeuses {{ tech.label }}
                </NuxtLink>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      <div class="border-t border-border/10">
        <details v-for="item in items" :key="item.question" class="faq-item group border-b border-border/10">
          <summary class="flex items-center justify-between gap-6 py-5 cursor-pointer list-none font-display text-lg md:text-xl font-medium">
            {{ item.question }}
            <svg class="w-4 h-4 shrink-0 text-foreground-muted transition-transform motion-reduce:transition-none group-open:rotate-45" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </summary>
          <div class="pb-6 pr-10 text-foreground-muted leading-relaxed">
            <p>{{ item.answer }}</p>
            <NuxtLink v-if="item.link" :to="item.link.to" class="inline-block mt-3 text-foreground underline underline-offset-4">{{ item.link.label }}</NuxtLink>
          </div>
        </details>
      </div>
    </div>
  </section>
</template>

<style scoped>
.faq-item summary::-webkit-details-marker {
  display: none;
}
</style>
