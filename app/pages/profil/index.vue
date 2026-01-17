<script setup lang="ts">
definePageMeta({
  middleware: 'sidebase-auth'
})

const router = useRouter()

onMounted(() => {
  router.replace('/qg?tab=profil')
})
</script>

<template>
  <div class="min-h-screen bg-background flex items-center justify-center">
    <p class="text-foreground-muted">Redirection...</p>
  </div>
</template>
