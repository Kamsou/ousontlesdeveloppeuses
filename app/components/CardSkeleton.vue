<script setup lang="ts">
defineProps<{
  variant?: 'default' | 'speaker'
}>()
</script>

<template>
  <div class="flex flex-col gap-4 p-6 bg-background-card border border-border rounded-2xl animate-pulse" :class="{ 'p-8 gap-5': variant === 'speaker' }">
    <div class="flex items-center gap-4">
      <div class="rounded-full bg-border" :class="variant === 'speaker' ? 'w-16 h-16' : 'w-12 h-12'" />
      <div class="flex-1">
        <div class="bg-border rounded mb-2" :class="variant === 'speaker' ? 'h-6 w-40' : 'h-5 w-32'" />
        <div class="h-4 w-24 bg-border rounded" />
      </div>
    </div>
    <div class="h-4 w-full bg-border rounded" />
    <div class="h-4 bg-border rounded" :class="variant === 'speaker' ? 'w-2/3' : 'w-3/4'" />
    <div class="flex gap-2">
      <div class="bg-border rounded-full" :class="variant === 'speaker' ? 'h-8 w-24' : 'h-6 w-16'" />
      <div class="bg-border rounded-full" :class="variant === 'speaker' ? 'h-8 w-28' : 'h-6 w-20'" />
      <div v-if="variant !== 'speaker'" class="h-6 w-14 bg-border rounded-full" />
    </div>
    <div v-if="variant === 'speaker'" class="flex gap-2 pt-3 border-t border-border">
      <div class="h-6 w-16 bg-border rounded-full" />
      <div class="h-6 w-20 bg-border rounded-full" />
    </div>
  </div>
</template>
