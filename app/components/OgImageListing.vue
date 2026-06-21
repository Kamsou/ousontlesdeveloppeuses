<script setup lang="ts">
defineProps<{
  title?: string
  subtitle?: string
  count?: number | null
  countLabel?: string
}>()
</script>

<template>
  <div class="flex h-full w-full flex-col justify-between bg-[#0a0a0f] p-16">
    <div class="flex items-center justify-between">
      <div class="text-[#94a3b8] text-2xl font-medium tracking-wider">
        OSLD
      </div>
      <div class="text-[#94a3b8] text-xl">
        ousontlesdeveloppeuses.fr
      </div>
    </div>

    <div class="flex flex-1 flex-col justify-center gap-6 py-8">
      <h1 class="text-[#f8fafc] text-7xl font-bold leading-tight max-w-4xl">
        {{ title || 'Où Sont Les Développeuses' }}
      </h1>

      <div v-if="count" class="flex items-baseline gap-4">
        <span class="text-[#a78bfa] text-8xl font-bold">{{ count }}</span>
        <span class="text-[#f8fafc] text-4xl font-medium">{{ countLabel || 'développeuses' }} en France</span>
      </div>

      <p v-if="subtitle" class="text-[#94a3b8] text-3xl max-w-3xl">
        {{ subtitle }}
      </p>
    </div>

    <div class="flex items-center gap-4">
      <div class="h-1 w-20 bg-[#a78bfa] rounded-full" />
      <span class="text-[#94a3b8] text-xl">Annuaire des développeuses en France</span>
    </div>
  </div>
</template>
