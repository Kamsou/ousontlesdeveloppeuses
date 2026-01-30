<script setup lang="ts">
definePageMeta({
  middleware: 'sidebase-auth'
})

const router = useRouter()

const messages = [
  'Connexion réussie',
  'Chargement de ton profil',
  'Préparation du QG',
]

const messageIndex = ref(0)

onMounted(() => {
  const interval = setInterval(() => {
    messageIndex.value = (messageIndex.value + 1) % messages.length
  }, 800)

  setTimeout(() => {
    clearInterval(interval)
    router.replace('/qg?tab=profil')
  }, 2000)
})
</script>

<template>
  <div class="min-h-screen bg-background flex items-center justify-center">
    <div class="text-center">
      <div class="mb-10">
        <div class="inline-flex gap-2">
          <span class="w-2 h-2 bg-foreground rounded-full animate-bounce"></span>
          <span class="w-2 h-2 bg-foreground rounded-full animate-bounce [animation-delay:0.1s]"></span>
          <span class="w-2 h-2 bg-foreground rounded-full animate-bounce [animation-delay:0.2s]"></span>
        </div>
      </div>
      <p class="text-xl md:text-2xl font-display font-medium transition-all duration-500">
        {{ messages[messageIndex] }}
      </p>
    </div>
  </div>
</template>
