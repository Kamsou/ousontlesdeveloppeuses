<script setup lang="ts">
defineProps<{
  label: string
  title: string
  narrow?: boolean
}>()

const reducedMotion = usePreferredReducedMotion()

const sectionRef = ref<HTMLElement | null>(null)
const glowRef = ref<HTMLElement | null>(null)

function handlePointerMove(e: PointerEvent) {
  if (!sectionRef.value || !glowRef.value || reducedMotion.value === 'reduce') return
  const rect = sectionRef.value.getBoundingClientRect()
  glowRef.value.style.setProperty('--lx', `${e.clientX - rect.left}px`)
  glowRef.value.style.setProperty('--ly', `${e.clientY - rect.top}px`)
}
</script>

<template>
  <section
    ref="sectionRef"
    class="page-hero relative overflow-hidden px-4 md:px-16 pt-14 md:pt-24 pb-10 md:pb-14"
    @pointermove="handlePointerMove"
  >
    <div aria-hidden="true" class="absolute inset-0 grid-lines [mask-image:radial-gradient(ellipse_at_top_left,#000_15%,transparent_70%)]"></div>
    <div ref="glowRef" aria-hidden="true" class="page-hero-glow absolute inset-0 pointer-events-none" style="--lx: 15%; --ly: 0%"></div>
    <div aria-hidden="true" class="grain absolute inset-0 pointer-events-none"></div>

    <div :class="['relative w-full mx-auto', narrow ? 'max-w-3xl' : 'max-w-7xl']">
      <slot name="before" />
      <p class="font-mono text-xs text-foreground-muted mb-4"># {{ label }}</p>
      <h1 class="font-display text-[clamp(2.25rem,12vw,3rem)] md:text-7xl lg:text-8xl font-medium tracking-tight leading-[0.95] break-words">
        {{ title }}
      </h1>
      <div v-if="$slots.default" class="mt-6 text-foreground-muted text-base md:text-lg max-w-2xl leading-relaxed">
        <slot />
      </div>
      <div v-if="$slots.after" class="mt-8">
        <slot name="after" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.page-hero-glow {
  background: radial-gradient(circle 420px at var(--lx, 15%) var(--ly, 0%), rgb(var(--foreground) / 0.07), transparent 70%);
}
</style>
