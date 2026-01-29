<script setup lang="ts">
interface Offer {
  id: number
  title: string
  description: string | null
  url: string | null
  type: string
  location: string | null
  verified: boolean
  createdAt: string
  developer: {
    id: number
    name: string
    avatarUrl: string | null
  }
}

const props = defineProps<{
  offers: Offer[]
  isLoading: boolean
  currentUserId?: number
}>()

const emit = defineEmits<{
  deleted: []
}>()
const deleting = ref<number | null>(null)

const typeLabels: Record<string, string> = {
  alternance: 'Alternance',
  stage: 'Stage',
  cdi: 'CDI',
  freelance: 'Freelance',
  other: 'Autre'
}

const typeColors: Record<string, string> = {
  alternance: 'border-primary/30 text-primary',
  stage: 'border-blue-400/30 text-blue-400',
  cdi: 'border-green-400/30 text-green-400',
  freelance: 'border-amber-400/30 text-amber-400',
  other: 'border-border text-foreground-muted'
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short'
  })
}

async function deleteOffer(id: number) {
  if (!confirm('Supprimer cette offre ?')) return
  deleting.value = id
  try {
    await $fetch(`/api/offers/${id}`, { method: 'DELETE' })
    emit('deleted')
  } catch {
  } finally {
    deleting.value = null
  }
}
</script>

<template>
  <section v-if="isLoading || offers.length > 0" class="mb-8 md:mb-12">
    <h2 class="text-sm font-medium text-foreground-muted mb-4">Offres</h2>

    <div v-if="isLoading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="p-4 border border-border/20 rounded-xl animate-pulse">
        <div class="h-4 bg-border/50 rounded w-2/3 mb-2"></div>
        <div class="h-3 bg-border/50 rounded w-1/3"></div>
      </div>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="offer in offers"
        :key="offer.id"
        class="p-4 border border-border/20 rounded-xl transition-colors hover:border-border/40"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 flex-wrap mb-1">
              <span
                class="px-2 py-0.5 text-[11px] font-medium border rounded-full"
                :class="typeColors[offer.type] || typeColors.other"
              >
                {{ typeLabels[offer.type] || offer.type }}
              </span>
              <span
                v-if="offer.verified"
                class="px-2 py-0.5 text-[11px] font-medium border border-green-500/30 text-green-400 rounded-full"
              >
                Vérifié
              </span>
              <span
                v-else
                class="px-2 py-0.5 text-[11px] font-medium border border-amber-500/30 text-amber-400 rounded-full"
              >
                Non vérifié
              </span>
            </div>
            <h3 class="font-medium text-sm text-foreground">
              <a
                v-if="offer.url"
                :href="offer.url"
                target="_blank"
                rel="noopener noreferrer"
                class="underline underline-offset-2 decoration-border hover:decoration-foreground-muted transition-colors"
              >
                {{ offer.title }}
              </a>
              <span v-else>{{ offer.title }}</span>
            </h3>
            <p v-if="offer.description" class="text-xs text-foreground-muted mt-1 line-clamp-2">
              {{ offer.description }}
            </p>
            <div class="flex items-center gap-3 mt-2 text-xs text-foreground-muted">
              <span class="flex items-center gap-1.5">
                <img
                  v-if="offer.developer.avatarUrl"
                  :src="offer.developer.avatarUrl"
                  :alt="offer.developer.name"
                  class="w-4 h-4 rounded-full"
                />
                {{ offer.developer.name }}
              </span>
              <span v-if="offer.location">{{ offer.location }}</span>
              <span>{{ formatDate(offer.createdAt) }}</span>
            </div>
          </div>
          <button
            v-if="currentUserId === offer.developer.id"
            @click="deleteOffer(offer.id)"
            :disabled="deleting === offer.id"
            class="text-foreground-muted hover:text-red-400 transition-colors shrink-0 bg-transparent border-none cursor-pointer p-1"
            aria-label="Supprimer l'offre"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
