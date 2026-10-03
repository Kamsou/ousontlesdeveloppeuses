<script setup lang="ts">
const { status, signIn } = useAuth()
const reducedMotion = usePreferredReducedMotion()

const windowRef = ref<HTMLElement | null>(null)
const visible = useRevealOnce(windowRef, 0.45)
const step = ref(0)
const timers: ReturnType<typeof setTimeout>[] = []

const features = [
  { title: 'Entraide', text: 'Bug, review de code, conseil tech.' },
  { title: 'Side projects', text: 'Partage tes idées, rejoins des projets.' },
  { title: 'Offres', text: 'CDI, freelance, alternance, stage.' },
  { title: 'Ton profil', text: 'Crée-le et gère-le depuis le QG.' }
]

const timeline = [700, 2000, 2900, 4100, 4800]

watch(visible, (isVisible) => {
  if (!isVisible) return
  if (reducedMotion.value === 'reduce') {
    step.value = timeline.length
    return
  }
  timeline.forEach((delay, i) => {
    timers.push(setTimeout(() => { step.value = i + 1 }, delay))
  })
})

onBeforeUnmount(() => {
  timers.forEach(clearTimeout)
})
</script>

<template>
  <section id="qg" class="py-16 md:py-40 lg:py-14 lg:min-h-[calc(100svh-80px)] lg:flex lg:flex-col lg:justify-center px-4 md:px-16 border-t border-border/10 relative overflow-hidden">
    <div aria-hidden="true" class="absolute -right-40 top-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-foreground/[0.03] blur-3xl pointer-events-none"></div>

    <div class="w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 lg:gap-24 items-center relative">
      <div>
        <a href="#qg" class="inline-block font-mono text-xs text-foreground-muted mb-3 no-underline hover:text-foreground transition-colors"># le-qg</a>
        <h2 class="font-display text-4xl md:text-6xl font-medium leading-[1.05] tracking-tight mb-6">
          L'espace privé des développeuses
        </h2>
        <p class="text-foreground-muted text-base md:text-lg leading-relaxed mb-10 max-w-lg">
          Derrière la vitrine publique, un espace entre nous. Pas de jugement, pas de question bête. Juste entre devs.
        </p>

        <dl class="grid grid-cols-2 gap-x-6 gap-y-6 mb-10 max-w-lg">
          <div v-for="(feature, i) in features" :key="feature.title" class="border-t border-border/10 pt-4">
            <dt class="flex items-baseline gap-2 font-display font-medium">
              <span class="font-mono text-[0.65rem] text-foreground-muted">0{{ i + 1 }}</span>
              {{ feature.title }}
            </dt>
            <dd class="text-foreground-muted text-sm mt-1">{{ feature.text }}</dd>
          </div>
        </dl>

        <ClientOnly>
          <button
            v-if="status !== 'authenticated'"
            @click="signIn('github')"
            class="group inline-flex items-center gap-3 px-5 py-3 bg-[#24292e] border border-b-[3px] border-[#24292e] border-b-[#1a1e22] text-white rounded-full text-sm font-medium transition-all hover:-translate-y-0.5 hover:shadow-glow active:translate-y-px active:border-b active:shadow-none"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <span>Entrer avec GitHub</span>
          </button>
          <NuxtLink
            v-else
            to="/qg"
            class="group inline-flex items-center gap-3 text-foreground hover:gap-4 transition-all no-underline"
          >
            <span>Accéder au QG</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="transition-transform group-hover:translate-x-1">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </NuxtLink>
          <template #fallback>
            <div class="h-[46px] w-[180px] bg-foreground/10 rounded-full animate-pulse"></div>
          </template>
        </ClientOnly>
      </div>

      <div ref="windowRef" aria-hidden="true" class="relative">
        <div class="rounded-3xl border border-border/15 bg-background shadow-[0_40px_80px_-40px_rgb(0_0_0/0.9)] overflow-hidden lg:rotate-[1.5deg] transition-transform duration-700 hover:rotate-0">
          <div class="flex items-center gap-2 px-5 py-4 border-b border-border/10">
            <span class="w-2.5 h-2.5 rounded-full bg-foreground/20"></span>
            <span class="w-2.5 h-2.5 rounded-full bg-foreground/20"></span>
            <span class="w-2.5 h-2.5 rounded-full bg-foreground/20"></span>
            <span class="ml-3 font-mono text-xs text-foreground-muted">qg / entraide</span>
            <span class="ml-auto flex items-center gap-1.5 font-mono text-[0.65rem] text-foreground-muted">
              <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="4" y="11" width="16" height="10" rx="2"/>
                <path d="M8 11V7a4 4 0 0 1 8 0v4"/>
              </svg>
              entre nous
            </span>
          </div>

          <div class="p-5 md:p-6 flex flex-col gap-4 min-h-[330px]">
            <div class="p-4 rounded-2xl border border-border/10 bg-background-card">
              <div class="flex items-center gap-3 mb-3">
                <span class="w-8 h-8 rounded-full bg-foreground/15 flex items-center justify-center font-display text-sm">L</span>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium leading-tight">Léa</p>
                  <p class="font-mono text-[0.65rem] text-foreground-muted">il y a 4 min</p>
                </div>
                <Transition name="pop">
                  <span v-if="step >= 5" class="px-2.5 py-1 rounded-full bg-foreground text-background text-[0.65rem] font-medium">✓ Résolu</span>
                </Transition>
              </div>
              <p class="text-sm leading-relaxed mb-3">Mon <code class="font-mono text-[0.8rem] px-1.5 py-0.5 rounded bg-foreground/10">useEffect</code> boucle à l'infini et je deviens chèvre. Quelqu'un a déjà eu ça ?</p>
              <div class="flex gap-1.5">
                <span class="px-2 py-0.5 text-[0.65rem] border border-border/15 rounded-full text-foreground-muted">bug</span>
                <span class="px-2 py-0.5 text-[0.65rem] border border-border/15 rounded-full text-foreground-muted">React</span>
              </div>
            </div>

            <div class="pl-6 md:pl-10 flex flex-col gap-3">
              <Transition name="pop" mode="out-in">
                <div v-if="step === 1" class="typing self-start flex gap-1 px-4 py-3 rounded-2xl rounded-tl-sm bg-foreground/[0.06]">
                  <span></span><span></span><span></span>
                </div>
                <div v-else-if="step >= 2" class="self-start flex gap-3 max-w-[90%]">
                  <span class="w-7 h-7 shrink-0 rounded-full bg-foreground/15 flex items-center justify-center font-display text-xs">I</span>
                  <p class="px-4 py-3 rounded-2xl rounded-tl-sm bg-foreground/[0.06] text-sm leading-relaxed">
                    Tu passes un objet dans le tableau de dépendances ? Il est recréé à chaque render 👀
                  </p>
                </div>
              </Transition>

              <Transition name="pop" mode="out-in">
                <div v-if="step === 3" class="typing self-end flex gap-1 px-4 py-3 rounded-2xl rounded-tr-sm bg-foreground text-background">
                  <span></span><span></span><span></span>
                </div>
                <p v-else-if="step >= 4" class="self-end px-4 py-3 rounded-2xl rounded-tr-sm bg-foreground text-background text-sm max-w-[80%]">
                  C'était ÇA. Merci 🙏
                </p>
              </Transition>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.typing span {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: currentColor;
  opacity: 0.4;
  animation: typing 1s ease-in-out infinite;
}

.typing span:nth-child(2) { animation-delay: 0.15s; }
.typing span:nth-child(3) { animation-delay: 0.3s; }

@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-4px); opacity: 1; }
}

.pop-enter-active {
  transition: opacity 0.35s ease, transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.pop-leave-active {
  transition: opacity 0.15s ease;
}

.pop-enter-from {
  opacity: 0;
  transform: translateY(8px) scale(0.92);
}

.pop-leave-to {
  opacity: 0;
}
</style>
