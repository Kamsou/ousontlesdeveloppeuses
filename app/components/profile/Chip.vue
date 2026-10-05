<script setup lang="ts">
defineProps<{
  selected: boolean
}>()
</script>

<template>
  <button
    type="button"
    :aria-pressed="selected"
    :class="[
      'inline-flex items-center gap-1.5 px-3.5 py-2 md:py-1.5 rounded-full border text-sm cursor-pointer transition-colors motion-reduce:transition-none',
      selected
        ? 'bg-foreground text-background border-foreground'
        : 'bg-transparent text-foreground-muted border-border/20 hover:text-foreground hover:border-foreground/40'
    ]"
  >
    <svg v-if="selected" class="w-3.5 h-3.5 -ml-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
      <path d="M5 12l5 5L20 7"/>
    </svg>
    <slot />
  </button>
</template>
