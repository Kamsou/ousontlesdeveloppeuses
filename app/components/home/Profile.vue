<script setup lang="ts">
const emit = defineEmits<{
  join: []
}>()

const { status } = useAuth()
const reducedMotion = usePreferredReducedMotion()

const mockRef = ref<HTMLElement | null>(null)
const visible = useRevealOnce(mockRef, 0.45)
const showNotification = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

const steps = [
  { title: 'Crée ton profil', text: 'Connexion GitHub, deux minutes. Ta stack, ta ville, tes dispos : conférence, mentoring, coffee chat, pair programming.' },
  { title: 'On te trouve', text: 'Les orgas qui cherchent une speakeuse, les recruteurs et recruteuses qui filtrent par stack, les devs qui cherchent une mentore.' },
  { title: 'On te contacte', text: 'Via tes liens, ou directement depuis OSLD : le message arrive dans ta boîte mail.' }
]

watch(visible, (isVisible) => {
  if (!isVisible) return
  if (reducedMotion.value === 'reduce') {
    showNotification.value = true
    return
  }
  timer = setTimeout(() => { showNotification.value = true }, 1200)
})

onBeforeUnmount(() => {
  clearTimeout(timer)
})
</script>

<template>
  <section id="profil" class="py-16 md:py-40 lg:py-14 lg:min-h-[calc(100svh-80px)] lg:flex lg:flex-col lg:justify-center px-4 md:px-16 border-t border-border/10 relative overflow-hidden">
    <div aria-hidden="true" class="absolute -right-40 top-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-foreground/[0.03] blur-3xl pointer-events-none"></div>

    <div class="w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 lg:gap-24 items-center relative">
      <div>
        <p class="inline-block font-mono text-xs text-foreground-muted mb-3"># ton-profil</p>
        <h2 class="font-display text-4xl md:text-6xl font-medium leading-[1.05] tracking-tight mb-10">
          Sois trouvée.
        </h2>

        <ol class="flex flex-col gap-6 mb-10 max-w-lg">
          <li v-for="(step, i) in steps" :key="step.title" class="grid grid-cols-[auto_1fr] gap-x-4 border-t border-border/10 pt-4">
            <span class="font-mono text-xs text-foreground-muted pt-1">0{{ i + 1 }}</span>
            <div>
              <h3 class="font-display text-lg font-medium">{{ step.title }}</h3>
              <p class="text-foreground-muted text-sm leading-relaxed mt-1">{{ step.text }}</p>
            </div>
          </li>
        </ol>

        <ClientOnly>
          <NuxtLink
            v-if="status === 'authenticated'"
            to="/qg?tab=profil"
            class="group inline-flex items-center gap-3 text-foreground hover:gap-4 transition-all no-underline"
          >
            <span>Modifier mon profil</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="transition-transform group-hover:translate-x-1" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </NuxtLink>
          <button
            v-else
            @click="emit('join')"
            class="group inline-flex items-center gap-3 px-5 py-3 bg-[#24292e] border border-b-[3px] border-[#24292e] border-b-[#1a1e22] text-white rounded-full text-sm font-medium transition-all hover:-translate-y-0.5 hover:shadow-glow active:translate-y-px active:border-b active:shadow-none"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <span>Crée ton profil avec GitHub</span>
          </button>
          <template #fallback>
            <div class="h-[46px] w-[240px] bg-foreground/10 rounded-full animate-pulse"></div>
          </template>
        </ClientOnly>
      </div>

      <div ref="mockRef" aria-hidden="true" class="relative pb-16 md:pb-20">
        <div class="rounded-3xl border border-border/15 bg-background shadow-[0_40px_80px_-40px_rgb(0_0_0/0.9)] p-6 md:p-8 lg:-rotate-[1.5deg] transition-transform duration-700 hover:rotate-0">
          <div class="flex items-center gap-4 mb-5">
            <span class="w-14 h-14 rounded-full bg-gradient-to-br from-foreground/30 to-foreground/5 flex items-center justify-center font-display text-xl">L</span>
            <div class="flex-1 min-w-0">
              <p class="font-display text-xl font-medium leading-tight">Léa Martin</p>
              <p class="text-sm text-foreground-muted">Développeuse front · Lyon · 5-10 ans</p>
            </div>
            <span class="hidden sm:inline-flex px-2.5 py-1 rounded-full border border-foreground/40 text-[0.65rem] font-medium whitespace-nowrap">En recherche · CDI</span>
          </div>
          <p class="text-sm text-foreground-muted leading-relaxed mb-5">
            Je construis des interfaces accessibles. Passionnée de design systems et de perf web.
          </p>
          <div class="flex flex-wrap gap-1.5 mb-5">
            <span v-for="skill in ['Vue.js', 'TypeScript', 'Nuxt', 'CSS', 'a11y']" :key="skill" class="px-2.5 py-1 text-xs bg-foreground/[0.06] rounded-full">{{ skill }}</span>
          </div>
          <div class="pt-5 border-t border-border/10">
            <p class="font-mono text-[0.65rem] text-foreground-muted mb-2.5">disponible pour</p>
            <div class="flex flex-wrap gap-1.5">
              <span v-for="dispo in ['Conférence', 'Mentoring', 'Coffee chat']" :key="dispo" class="px-2.5 py-1 text-xs border border-border/20 rounded-full">{{ dispo }}</span>
            </div>
          </div>
        </div>

        <Transition name="notif">
          <div v-if="showNotification" class="absolute bottom-0 right-0 left-6 md:left-auto md:w-[22rem] flex items-start gap-3 p-4 rounded-2xl border border-border/20 bg-background/95 backdrop-blur-md shadow-[0_24px_48px_-24px_rgb(0_0_0/0.9)]">
            <span class="w-9 h-9 shrink-0 rounded-xl bg-foreground text-background flex items-center justify-center">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="M22 6l-10 7L2 6"/>
              </svg>
            </span>
            <div class="min-w-0">
              <p class="text-sm font-medium leading-snug">Inès veut te contacter sur OSLD</p>
              <p class="text-xs text-foreground-muted mt-0.5 truncate">« Tu serais partante pour un talk sur l'a11y à notre meetup ? »</p>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </section>
</template>

<style scoped>
.notif-enter-active {
  transition: opacity 0.4s ease, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.notif-enter-from {
  opacity: 0;
  transform: translateY(16px) scale(0.95);
}
</style>
