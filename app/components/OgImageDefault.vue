<script setup lang="ts">
defineProps<{
  title?: string
  description?: string
  name?: string
  location?: string
  skills?: string[]
  avatarUrl?: string
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

    <div class="flex flex-1 items-center gap-12 py-8">
      <img
        v-if="avatarUrl"
        :src="avatarUrl"
        class="h-40 w-40 rounded-full object-cover border-4 border-[#1e293b]"
      />

      <div class="flex flex-col gap-4">
        <h1 class="text-[#f8fafc] text-6xl font-bold leading-tight">
          {{ name || title || 'Où Sont Les Développeuses' }}
        </h1>

        <p v-if="location" class="text-[#94a3b8] text-2xl">
          {{ location }}
        </p>

        <p v-if="description && !name" class="text-[#94a3b8] text-2xl max-w-3xl line-clamp-2">
          {{ description }}
        </p>

        <div v-if="skills?.length" class="flex flex-wrap gap-3 mt-4">
          <span
            v-for="skill in skills.slice(0, 5)"
            :key="skill"
            class="px-4 py-2 bg-[#1e293b] text-[#f8fafc] rounded-full text-lg"
          >
            {{ skill }}
          </span>
          <span v-if="skills.length > 5" class="px-4 py-2 text-[#94a3b8] text-lg">
            +{{ skills.length - 5 }}
          </span>
        </div>
      </div>
    </div>

    <div class="flex items-center gap-4">
      <div class="h-1 w-20 bg-[#a78bfa] rounded-full" />
      <span class="text-[#94a3b8] text-xl">Annuaire des développeuses en France</span>
    </div>
  </div>
</template>
