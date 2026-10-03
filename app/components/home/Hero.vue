<script setup lang="ts">
import { seededRandom, type HomeDeveloper } from '~/utils/home'

const props = defineProps<{
  developers: HomeDeveloper[]
  count: number | null
}>()

const emit = defineEmits<{
  join: []
}>()

const reducedMotion = usePreferredReducedMotion()

const sectionRef = ref<HTMLElement | null>(null)
const wordRef = ref<HTMLElement | null>(null)
const glowRef = ref<HTMLElement | null>(null)
const fieldRef = ref<HTMLElement | null>(null)
const wordFillRef = ref<HTMLElement | null>(null)
const isOnScreen = ref(true)

interface Box {
  left: number
  right: number
  top: number
  bottom: number
}

const CHIP_HEIGHT = 38

const light = { x: 0, y: 0 }
const target = { x: 0, y: 0 }
const wordOffset = { x: 0, y: 0 }
const WANDER_DURATION = 6000
const POINTER_IDLE_DELAY = 3500
let wanderUntil = 0
let lastPointerAt = 0
let rafId = 0

const placedDevelopers = ref<{ dev: HomeDeveloper, left: number, top: number }[]>([])

function intersects(a: Box, b: Box) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top
}

function estimateChipWidth(dev: HomeDeveloper, isDesktop: boolean) {
  if (!isDesktop) return CHIP_HEIGHT
  const meta = dev.location || dev.skills[0] || ''
  return 52 + dev.name.length * 7.5 + (meta ? meta.length * 6.5 + 14 : 0)
}

function layoutChips() {
  const section = sectionRef.value
  if (!section) return
  const width = section.clientWidth
  const height = section.clientHeight
  const isDesktop = width >= 768
  const origin = section.getBoundingClientRect()

  const gap = isDesktop ? 20 : 6
  const taken: Box[] = [...section.querySelectorAll('[data-hero-block]')]
    .map(el => el.getBoundingClientRect())
    .filter(r => r.width > 0)
    .map(r => ({ left: r.left - origin.left - gap, right: r.right - origin.left + gap, top: r.top - origin.top - gap, bottom: r.bottom - origin.top + gap }))

  const rand = seededRandom(7)
  const placed: typeof placedDevelopers.value = []

  for (const dev of props.developers.slice(0, isDesktop ? 40 : 18)) {
    const chipWidth = estimateChipWidth(dev, isDesktop)
    for (let attempt = 0; attempt < 60; attempt++) {
      const left = rand() * (width - chipWidth)
      const top = 12 + rand() * (height - CHIP_HEIGHT - 24)
      const box = { left: left - 10, right: left + chipWidth + 10, top: top - 8, bottom: top + CHIP_HEIGHT + 8 }
      if (taken.some(b => intersects(b, box))) continue
      taken.push(box)
      placed.push({ dev, left, top })
      break
    }
  }

  placedDevelopers.value = placed
}

function measure() {
  layoutChips()
  if (!sectionRef.value || !wordRef.value) return
  const section = sectionRef.value.getBoundingClientRect()
  const word = wordRef.value.getBoundingClientRect()
  wordOffset.x = word.left - section.left
  wordOffset.y = word.top - section.top
}

function paint() {
  for (const el of [glowRef.value, fieldRef.value]) {
    el?.style.setProperty('--lx', `${light.x}px`)
    el?.style.setProperty('--ly', `${light.y}px`)
  }
  wordFillRef.value?.style.setProperty('--wx', `${light.x - wordOffset.x}px`)
  wordFillRef.value?.style.setProperty('--wy', `${light.y - wordOffset.y}px`)
}

function restOnWord() {
  if (!wordRef.value) return
  target.x = wordOffset.x + wordRef.value.offsetWidth * 0.55
  target.y = wordOffset.y + wordRef.value.offsetHeight * 0.5
}

function tick(time: number) {
  const section = sectionRef.value
  if (!section) return

  const pointerIdle = time - lastPointerAt > POINTER_IDLE_DELAY
  if (pointerIdle && time < wanderUntil) {
    target.x = section.clientWidth * (0.45 + 0.4 * Math.sin(time / 2700))
    target.y = section.clientHeight * (0.48 + 0.3 * Math.sin(time / 1900 + 1.2))
  } else if (pointerIdle) {
    restOnWord()
  }

  light.x += (target.x - light.x) * 0.09
  light.y += (target.y - light.y) * 0.09
  paint()

  const settled = Math.abs(target.x - light.x) < 0.5 && Math.abs(target.y - light.y) < 0.5
  if (settled && pointerIdle && time >= wanderUntil) {
    rafId = 0
    return
  }
  rafId = requestAnimationFrame(tick)
}

function start() {
  cancelAnimationFrame(rafId)
  rafId = 0
  if (reducedMotion.value === 'reduce' || !isOnScreen.value) return
  rafId = requestAnimationFrame(tick)
}

function handlePointerMove(e: PointerEvent) {
  if (!sectionRef.value) return
  const rect = sectionRef.value.getBoundingClientRect()
  target.x = e.clientX - rect.left
  target.y = e.clientY - rect.top
  lastPointerAt = performance.now()
  if (!rafId) start()
}

function handlePointerLeave() {
  lastPointerAt = 0
}

useResizeObserver(sectionRef, measure)
useResizeObserver(wordRef, measure)

useIntersectionObserver(sectionRef, ([entry]) => {
  isOnScreen.value = !!entry?.isIntersecting
})

watch([reducedMotion, isOnScreen], start)
watch(() => props.developers, () => nextTick(layoutChips))

onMounted(() => {
  measure()
  if (wordRef.value) {
    light.x = target.x = wordOffset.x + wordRef.value.offsetWidth * 0.55
    light.y = target.y = wordOffset.y + wordRef.value.offsetHeight * 0.5
    lastPointerAt = performance.now() - 1000
  }
  wanderUntil = performance.now() + WANDER_DURATION
  paint()
  start()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
})
</script>

<template>
  <section
    ref="sectionRef"
    :class="['hero relative min-h-[calc(100svh-80px)] flex flex-col justify-center px-4 md:px-16 py-16 md:py-8 overflow-hidden', reducedMotion === 'reduce' ? 'hero-static' : '']"
    @pointermove="handlePointerMove"
    @pointerleave="handlePointerLeave"
  >
    <div aria-hidden="true" class="absolute inset-0 grid-lines [mask-image:radial-gradient(ellipse_at_center,#000_20%,transparent_75%)]"></div>
    <div ref="glowRef" aria-hidden="true" class="hero-glow absolute inset-0 pointer-events-none"></div>

    <ClientOnly>
      <div ref="fieldRef" aria-hidden="true" class="hero-field absolute inset-0">
        <NuxtLink
          v-for="item in placedDevelopers"
          :key="item.dev.id"
          :to="item.dev.slug ? `/directory/${item.dev.slug}` : '/directory'"
          tabindex="-1"
          class="absolute inline-flex items-center gap-2 p-1 md:pr-3 rounded-full border border-border/20 bg-background/70 text-xs text-foreground no-underline whitespace-nowrap transition-transform duration-300 hover:scale-110 hover:border-foreground/60"
          :style="{ left: `${item.left}px`, top: `${item.top}px` }"
        >
          <img
            v-if="item.dev.avatarUrl"
            :src="optimizedAvatar(item.dev.avatarUrl, 56)"
            alt=""
            width="28"
            height="28"
            loading="lazy"
            decoding="async"
            class="w-7 h-7 rounded-full object-cover grayscale"
          />
          <span v-else class="w-7 h-7 rounded-full bg-foreground/10 flex items-center justify-center font-display text-[0.7rem]">{{ item.dev.name.charAt(0) }}</span>
          <span class="hidden md:inline font-medium">{{ item.dev.name }}</span>
          <span v-if="item.dev.location || item.dev.skills[0]" class="hidden md:inline text-foreground-muted">· {{ item.dev.location || item.dev.skills[0] }}</span>
        </NuxtLink>
      </div>
    </ClientOnly>

    <div aria-hidden="true" class="grain absolute inset-0 pointer-events-none"></div>

    <div class="relative z-10 w-full max-w-7xl mx-auto pointer-events-none">
      <div class="max-w-5xl">

        <h1 class="font-display text-5xl md:text-[clamp(3.5rem,10vw,8.5rem)] font-medium leading-[0.95] tracking-tight mb-8">
          <span class="block overflow-hidden">
            <span data-hero-block class="inline-block animate-slide-up animation-delay-100">Où</span>{{ ' ' }}
            <span data-hero-block class="inline-block animate-slide-up animation-delay-150">sont</span>{{ ' ' }}
            <span data-hero-block class="inline-block animate-slide-up animation-delay-200">les</span>{{ ' ' }}
          </span>
          <span class="block overflow-hidden pb-[0.08em]">
            <span ref="wordRef" data-hero-block class="relative inline-block animate-slide-up animation-delay-250" @animationend="measure">
              <span class="title-stroke">développeuses</span>
              <span ref="wordFillRef" aria-hidden="true" class="word-fill absolute inset-0" data-text="développeuses"></span>
            </span>
          </span>
        </h1>

        <p data-hero-block class="text-base md:text-xl text-foreground-muted max-w-xl leading-relaxed mb-10 animate-slide-up animation-delay-300">
          <span class="text-foreground">Elles sont <ClientOnly><span v-if="count">{{ count }}</span><span v-else>là</span><template #fallback>là</template></ClientOnly>, il suffit d'éclairer.</span><br class="hidden md:block" />
          L'annuaire des développeuses en France : se rendre visibles, se trouver entre nous, et montrer aux prochaines que c'est possible.
        </p>

        <div data-hero-block class="pointer-events-auto inline-flex gap-4 items-center flex-wrap animate-slide-up animation-delay-400" @animationend="measure">
          <NuxtLink to="/directory" class="group flex items-center gap-4 px-6 py-4 bg-foreground border border-b-[3px] border-foreground border-b-foreground-muted/50 text-background rounded-full text-sm font-medium cursor-pointer transition-all hover:gap-6 hover:pr-5 hover:-translate-y-0.5 hover:shadow-glow active:translate-y-px active:border-b active:shadow-none no-underline">
            <span>Découvrir les développeuses</span>
            <span class="flex transition-transform group-hover:translate-x-1">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </span>
          </NuxtLink>
          <button @click="emit('join')" class="px-6 py-4 bg-background/60 backdrop-blur-md text-foreground border border-b-[3px] border-border/15 border-b-border/30 rounded-full text-sm font-medium cursor-pointer transition-all hover:border-foreground hover:bg-foreground hover:text-background hover:-translate-y-0.5 active:translate-y-px active:border-b">
            Crée ton profil
          </button>
        </div>
      </div>
    </div>

    <p aria-hidden="true" data-hero-block class="hidden md:flex absolute bottom-8 right-28 items-center gap-2 font-mono text-[0.7rem] text-foreground-muted/70">
      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/>
      </svg>
      Promène ta souris : elles sont déjà là.
    </p>

    <div data-hero-block class="hidden md:flex absolute bottom-8 right-16 flex-col items-center gap-4">
      <span class="text-[0.65rem] uppercase tracking-[0.2em] text-foreground-muted [writing-mode:vertical-rl]">Scroll</span>
      <div class="relative w-px h-16 bg-foreground/20 overflow-hidden">
        <span class="motion-safe-only absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-foreground to-transparent scroll-line"></span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  --r: 170px;
}

@media (min-width: 768px) {
  .hero {
    --r: 260px;
  }
}

.hero-field {
  -webkit-mask-image: radial-gradient(circle var(--r) at var(--lx, 70%) var(--ly, 40%), #000 0%, rgb(0 0 0 / 0.9) 40%, rgb(0 0 0 / 0.07) 100%);
  mask-image: radial-gradient(circle var(--r) at var(--lx, 70%) var(--ly, 40%), #000 0%, rgb(0 0 0 / 0.9) 40%, rgb(0 0 0 / 0.07) 100%);
}

.hero-glow {
  background: radial-gradient(circle calc(var(--r) * 2) at var(--lx, 70%) var(--ly, 40%), rgb(var(--foreground) / 0.07), transparent 70%);
}

.title-stroke {
  color: transparent;
  -webkit-text-stroke: 1px rgb(var(--foreground));
}

.word-fill::before {
  content: attr(data-text);
}

.word-fill {
  color: rgb(var(--foreground));
  -webkit-mask-image: radial-gradient(circle calc(var(--r) * 0.75) at var(--wx, -999px) var(--wy, -999px), #000 25%, transparent 70%);
  mask-image: radial-gradient(circle calc(var(--r) * 0.75) at var(--wx, -999px) var(--wy, -999px), #000 25%, transparent 70%);
}

.hero-static .hero-field {
  -webkit-mask-image: none;
  mask-image: none;
  opacity: 0.25;
}

.hero-static .hero-glow,
.hero-static .word-fill {
  display: none;
}

@keyframes scroll-down {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(200%); }
}

.scroll-line {
  animation: scroll-down 1.5s ease-in-out infinite;
}

@keyframes slide-up {
  from { transform: translateY(30px); }
  to { transform: translateY(0); }
}

.animate-slide-up {
  animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.animation-delay-100 { animation-delay: 0.1s; }
.animation-delay-150 { animation-delay: 0.15s; }
.animation-delay-200 { animation-delay: 0.2s; }
.animation-delay-250 { animation-delay: 0.25s; }
.animation-delay-300 { animation-delay: 0.3s; }
.animation-delay-400 { animation-delay: 0.4s; }
</style>
