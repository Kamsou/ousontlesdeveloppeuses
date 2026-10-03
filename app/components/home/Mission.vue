<script setup lang="ts">
import { seededRandom } from '~/utils/home'

const reducedMotion = usePreferredReducedMotion()

const textRef = ref<HTMLElement | null>(null)
const gridRef = ref<HTMLElement | null>(null)
const gridVisible = useRevealOnce(gridRef, 0.4)
const progress = ref(0)

const statement = 'On représente moins de 20\u00a0% de la tech. Alors on s\'est fait une place pour se rendre visibles, se trouver entre nous, et montrer aux prochaines générations que c\'est possible.'
const words = statement.split(' ')

const litDots = (() => {
  const rand = seededRandom(2024)
  const lit = new Set<number>()
  while (lit.size < 18) lit.add(Math.floor(rand() * 100))
  return lit
})()
const litOrder = [...litDots]

const pillars = [
  { title: 'Visibilité', text: 'Un annuaire public pour que plus personne ne puisse dire « on ne trouve pas de développeuses ».' },
  { title: 'Réseau', text: 'Se trouver entre développeuses : une mentore, une binôme de pair programming, un coffee chat.' },
  { title: 'Inspiration', text: 'Montrer aux prochaines générations que c\'est possible, et qu\'elles ne sont pas seules.' }
]

function updateProgress() {
  if (!textRef.value) return
  if (reducedMotion.value === 'reduce') {
    progress.value = 1
    return
  }
  const rect = textRef.value.getBoundingClientRect()
  const vh = window.innerHeight
  const raw = (vh * 0.9 - rect.top) / (vh * 0.55)
  progress.value = Math.min(1, Math.max(0, raw))
}

function dotDelay(index: number) {
  return `${litOrder.indexOf(index) * 70}ms`
}

useEventListener('scroll', updateProgress, { passive: true })
useEventListener('resize', updateProgress, { passive: true })

onMounted(updateProgress)
</script>

<template>
  <section id="mission" class="py-16 md:py-40 lg:py-14 lg:min-h-[calc(100svh-80px)] lg:flex lg:flex-col lg:justify-center px-4 md:px-16 border-t border-border/10">
    <div class="w-full max-w-7xl mx-auto">
      <p class="inline-block font-mono text-xs text-foreground-muted mb-6 lg:mb-4">
        # mission
      </p>
      <h2 class="sr-only">Pourquoi OSLD ?</h2>

      <div class="grid lg:grid-cols-[1.5fr_1fr] gap-10 md:gap-16 lg:gap-20 items-center">
        <p ref="textRef" class="font-display text-3xl md:text-5xl font-medium leading-[1.12] tracking-tight">
          <span
            v-for="(word, i) in words"
            :key="i"
            :class="['transition-colors duration-300', i / words.length < progress ? 'text-foreground' : 'text-foreground/35']"
          >{{ word }}{{ ' ' }}</span>
        </p>

        <figure ref="gridRef" class="flex flex-col gap-5">
          <div class="grid grid-cols-10 gap-1.5 md:gap-3 max-w-[15rem] md:max-w-sm lg:max-w-[18rem]" aria-hidden="true">
            <span
              v-for="i in 100"
              :key="i"
              :class="['aspect-square rounded-full transition-all duration-500', litDots.has(i - 1) && gridVisible ? 'bg-foreground scale-100 shadow-[0_0_12px_rgb(var(--foreground)/0.5)]' : 'bg-foreground/10 scale-75']"
              :style="litDots.has(i - 1) ? { transitionDelay: dotDelay(i - 1) } : undefined"
            ></span>
          </div>
          <figcaption class="font-mono text-xs text-foreground-muted max-w-sm">
            Sur 100 personnes dans la tech, moins de 20 sont des femmes. Éparpillées, difficiles à trouver. Jusqu'ici.
          </figcaption>
        </figure>
      </div>

      <div class="mt-12 lg:mt-12 grid md:grid-cols-3 border-t border-border/10">
        <div
          v-for="(pillar, i) in pillars"
          :key="pillar.title"
          :class="['py-8 lg:py-6 md:px-8 flex flex-col gap-2', i > 0 ? 'border-t md:border-t-0 md:border-l border-border/10' : 'md:pl-0']"
        >
          <span class="font-mono text-xs text-foreground-muted">0{{ i + 1 }}</span>
          <h3 class="font-display text-2xl font-medium">{{ pillar.title }}</h3>
          <p class="text-foreground-muted text-sm leading-relaxed">{{ pillar.text }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
