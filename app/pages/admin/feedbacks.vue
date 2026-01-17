<script setup lang="ts">
definePageMeta({
  middleware: 'sidebase-auth'
})

useSeoMeta({
  title: 'Feedbacks - Admin',
  robots: 'noindex'
})

const { data, status, error } = await useFetch('/api/admin/feedbacks')

function formatDate(date: string | Date | null) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

function getRatingColor(rating: number | null) {
  if (!rating) return 'text-foreground-muted'
  if (rating >= 4) return 'text-green-400'
  if (rating >= 3) return 'text-yellow-400'
  return 'text-red-400'
}
</script>

<template>
  <div class="max-w-[1200px] mx-auto px-4 md:px-16 py-12">
    <div class="mb-8">
      <div class="flex items-center gap-4 mb-2">
        <NuxtLink to="/admin" class="text-foreground-muted hover:text-foreground transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </NuxtLink>
        <h1 class="font-display text-3xl md:text-4xl font-medium tracking-tight">Feedbacks</h1>
      </div>
      <p class="text-foreground-muted">Retours sur les mises en relation</p>
    </div>

    <div v-if="error" class="p-6 border border-red-500/50 rounded-xl bg-red-500/10 text-red-400">
      <p class="font-medium">Accès refusé</p>
      <p class="text-sm mt-1">{{ error.data?.message || 'Vous n\'avez pas accès à cette page.' }}</p>
    </div>

    <div v-else-if="status === 'pending'" class="flex justify-center py-20">
      <div class="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin"></div>
    </div>

    <div v-else-if="data">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <div class="p-6 border border-border rounded-2xl">
          <p class="text-3xl font-display font-medium">{{ data.stats.totalContacts }}</p>
          <p class="text-sm text-foreground-muted mt-1">Contacts total</p>
        </div>
        <div class="p-6 border border-border rounded-2xl">
          <p class="text-3xl font-display font-medium">{{ data.stats.feedbackReceived }}</p>
          <p class="text-sm text-foreground-muted mt-1">Feedbacks reçus</p>
          <p class="text-xs text-foreground-muted mt-2">{{ data.stats.responseRate }}% de réponse</p>
        </div>
        <div class="p-6 border border-border rounded-2xl">
          <p class="text-3xl font-display font-medium text-green-400">{{ data.stats.successRate }}%</p>
          <p class="text-sm text-foreground-muted mt-1">Échanges réussis</p>
          <p class="text-xs text-foreground-muted mt-2">{{ data.stats.exchangeHappened }} / {{ data.stats.feedbackReceived }}</p>
        </div>
        <div class="p-6 border border-border rounded-2xl">
          <p class="text-3xl font-display font-medium" :class="getRatingColor(Number(data.stats.avgRating))">
            {{ data.stats.avgRating || '-' }}<span v-if="data.stats.avgRating" class="text-lg">/5</span>
          </p>
          <p class="text-sm text-foreground-muted mt-1">Note moyenne</p>
          <p class="text-xs text-foreground-muted mt-2">Utilité perçue</p>
        </div>
      </div>

      <h2 class="font-display text-xl font-medium mb-6">Détail des retours</h2>

      <div v-if="data.feedbacks.length === 0" class="text-center py-12 text-foreground-muted border border-border rounded-2xl">
        Aucun feedback reçu pour le moment
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="feedback in data.feedbacks"
          :key="feedback.id"
          class="p-6 border border-border rounded-2xl"
        >
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div class="flex items-center gap-3">
              <img
                v-if="feedback.sender.avatarUrl"
                :src="feedback.sender.avatarUrl"
                :alt="feedback.sender.name"
                class="w-10 h-10 rounded-full"
              />
              <div v-else class="w-10 h-10 rounded-full bg-border flex items-center justify-center text-foreground-muted">
                {{ feedback.sender.name?.charAt(0) }}
              </div>
              <div>
                <p class="font-medium">{{ feedback.sender.name }}</p>
                <p class="text-sm text-foreground-muted">
                  a contacté <span class="text-foreground">{{ feedback.recipient.name }}</span>
                </p>
              </div>
            </div>
            <span class="text-sm text-foreground-muted">{{ formatDate(feedback.createdAt) }}</span>
          </div>

          <div class="flex flex-wrap gap-4 mb-4">
            <div class="flex items-center gap-2">
              <span
                :class="[
                  'w-3 h-3 rounded-full',
                  feedback.exchangeHappened ? 'bg-green-500' : 'bg-red-500'
                ]"
              ></span>
              <span class="text-sm">
                {{ feedback.exchangeHappened ? 'Échange eu lieu' : 'Pas d\'échange' }}
              </span>
            </div>
            <div v-if="feedback.usefulnessRating" class="flex items-center gap-1">
              <span class="text-sm text-foreground-muted">Utilité :</span>
              <span class="font-medium" :class="getRatingColor(feedback.usefulnessRating)">
                {{ feedback.usefulnessRating }}/5
              </span>
            </div>
          </div>

          <div v-if="feedback.comment" class="p-4 bg-white/5 rounded-xl">
            <p class="text-sm text-foreground-muted italic">"{{ feedback.comment }}"</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
