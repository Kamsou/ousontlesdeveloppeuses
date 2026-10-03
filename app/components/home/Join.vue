<script setup lang="ts">
const emit = defineEmits<{
  join: []
}>()

const iciRef = ref<HTMLElement | null>(null)
const visible = useRevealOnce(iciRef, 0.6)
</script>

<template>
  <section id="join" class="relative py-20 md:py-40 lg:py-14 lg:min-h-[calc(100svh-80px)] lg:flex lg:flex-col lg:justify-center px-4 md:px-16 border-t border-border/10 overflow-hidden">
    <div class="w-full max-w-7xl mx-auto flex flex-col items-center text-center">
      <p class="font-mono text-xs md:text-sm text-foreground-muted mb-2">— Alors, où sont les développeuses ?</p>

      <p ref="iciRef" aria-hidden="true" :class="['ici font-display font-bold', visible ? 'is-filled' : '']" class="leading-[0.8] tracking-tighter select-none">
        Ici<span class="ici-dot">.</span>
      </p>

      <h2 class="font-display text-3xl md:text-5xl font-medium tracking-tight mt-10 mb-5">
        Deviens visible
      </h2>
      <p class="text-foreground-muted text-base md:text-lg leading-relaxed mb-10 max-w-xl">
        Ton profil pourrait inspirer une future dev à se lancer. Ou t'amener ta prochaine conf, ta prochaine mentorée, ton prochain poste.
      </p>
      <button @click="emit('join')" class="group inline-flex items-center gap-4 px-8 py-5 bg-foreground border border-b-[3px] border-foreground border-b-foreground-muted/50 text-background rounded-full text-base font-medium cursor-pointer transition-all hover:gap-6 hover:-translate-y-0.5 hover:shadow-glow active:translate-y-px active:border-b active:shadow-none">
        <span>Crée ton profil</span>
        <span class="flex transition-transform group-hover:translate-x-1">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.ici {
  font-size: clamp(9rem, 44vw, 24rem);
  color: transparent;
  -webkit-text-stroke: 1.5px rgb(var(--foreground) / 0.6);
  background: linear-gradient(rgb(var(--foreground)), rgb(var(--foreground))) no-repeat left / 0% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  transition: background-size 1.6s cubic-bezier(0.65, 0, 0.35, 1) 0.2s;
}

.ici.is-filled {
  background-size: 100% 100%;
}

.ici-dot {
  display: inline-block;
  color: rgb(var(--foreground));
  -webkit-text-stroke: 0;
  animation: dot-blink 1.2s steps(1) infinite;
}

@keyframes dot-blink {
  50% { opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .ici-dot {
    animation: none;
  }
}
</style>
