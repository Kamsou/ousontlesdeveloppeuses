<script setup lang="ts">
const peopleRef = ref<HTMLElement | null>(null)
const visible = useRevealOnce(peopleRef, 0.5)

const people = Array.from({ length: 22 }, (_, i) => i === 6 || i === 15)
</script>

<template>
  <section id="story" class="py-16 md:py-44 lg:py-14 lg:min-h-[calc(100svh-80px)] lg:flex lg:flex-col lg:justify-center px-4 md:px-16 border-t border-border/10">
    <div class="w-full max-w-4xl mx-auto">
      <p class="text-foreground-muted text-base md:text-xl leading-relaxed mb-8">
        Après plusieurs années en tant que développeuse, un constat&nbsp;:
      </p>

      <div ref="peopleRef" class="flex flex-wrap gap-x-[3px] gap-y-3 md:gap-x-2 mb-10" aria-hidden="true">
        <svg
          v-for="(isWoman, i) in people"
          :key="i"
          :class="['w-[13px] h-5 md:w-7 md:h-11 transition-all duration-700', visible ? (isWoman ? 'text-foreground drop-shadow-[0_0_14px_rgb(var(--foreground)/0.6)] -translate-y-1' : 'text-foreground/[0.12]') : 'text-foreground/[0.12]']"
          :style="{ transitionDelay: isWoman ? '900ms' : `${i * 30}ms` }"
          viewBox="0 0 24 36"
          fill="currentColor"
        >
          <circle cx="12" cy="7" r="6"/>
          <path d="M2 36v-9a10 10 0 0 1 20 0v9z"/>
        </svg>
      </div>

      <blockquote>
        <p class="font-display text-3xl md:text-5xl font-medium text-foreground leading-[1.1] tracking-tight mb-8">
          J'ai bossé avec 2&nbsp;développeuses contre une vingtaine de développeurs.
        </p>
        <p class="text-foreground-muted text-base md:text-xl leading-relaxed max-w-2xl">
          OSLD est né de là. Un espace pour nous rendre visibles, nous retrouver, et montrer aux prochaines que c'est possible.
        </p>
        <footer class="mt-10 pt-8 border-t border-border/10 flex items-center gap-4">
          <span class="w-12 h-12 rounded-full bg-gradient-to-br from-foreground/25 to-foreground/5 flex items-center justify-center font-display font-medium">C</span>
          <span>
            <span class="block text-foreground font-medium">Camille</span>
            <span class="block text-foreground-muted text-sm">8 ans d'expérience · créatrice d'OSLD</span>
          </span>
        </footer>
      </blockquote>
    </div>
  </section>
</template>
