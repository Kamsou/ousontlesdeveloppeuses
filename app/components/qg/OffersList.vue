<script setup lang="ts">
import { typeLabels, typeColors } from '~/utils/offerTypes'

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

const communityOffers = computed(() =>
  props.offers.filter(o => o.developer.id !== props.currentUserId)
)

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short'
  })
}
</script>

<template>
  <section v-if="isLoading || communityOffers.length > 0" class="mb-16">
    <h2 class="text-lg font-display font-medium mb-6">Offres de la communauté</h2>

    <div v-if="isLoading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="p-4 border border-border/20 rounded-xl animate-pulse">
        <div class="h-4 bg-border/50 rounded w-2/3 mb-2"></div>
        <div class="h-3 bg-border/50 rounded w-1/3"></div>
      </div>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="offer in communityOffers"
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
        </div>
      </div>
    </div>
  </section>
</template>
