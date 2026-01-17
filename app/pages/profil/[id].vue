<script setup lang="ts">
const route = useRoute()
const id = route.params.id

await navigateTo(`/annuaire/${id}`, { redirectCode: 301 })
</script>

<template>
  <div class="min-h-screen bg-background flex items-center justify-center">
    <p class="text-foreground-muted">Redirection...</p>
  </div>
</template>
