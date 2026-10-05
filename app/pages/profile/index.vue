<script setup lang="ts">
definePageMeta({
  middleware: 'sidebase-auth'
})

// /qg sends members without a profile on to /join
await navigateTo('/qg', { replace: true })
</script>

<template>
  <div class="min-h-[60svh] flex items-center justify-center" role="status">
    <span class="sr-only">Chargement de ton espace</span>
    <span class="inline-flex gap-2" aria-hidden="true">
      <span class="w-2 h-2 bg-foreground rounded-full animate-bounce"></span>
      <span class="w-2 h-2 bg-foreground rounded-full animate-bounce [animation-delay:0.1s]"></span>
      <span class="w-2 h-2 bg-foreground rounded-full animate-bounce [animation-delay:0.2s]"></span>
    </span>
  </div>
</template>
