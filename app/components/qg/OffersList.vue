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

const expandedOfferId = ref<number | null>(null)

function toggleComments(offerId: number) {
  expandedOfferId.value = expandedOfferId.value === offerId ? null : offerId
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short'
  })
}
</script>

<template>
  <section v-if="isLoading || offers.length > 0">
    <h2 class="text-base font-display font-bold uppercase tracking-wide mb-6">Offres</h2>

    <div v-if="isLoading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="p-5 border-2 border-border/15 rounded-2xl animate-pulse">
        <div class="h-4 bg-border/10 rounded w-2/3 mb-2"></div>
        <div class="h-3 bg-border/10 rounded w-1/3"></div>
      </div>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="offer in offers"
        :id="`offer-${offer.id}`"
        :key="offer.id"
        class="border-2 border-border/15 rounded-2xl transition-all hover:border-primary/40"
      >
        <div class="p-5">
          <div class="flex items-center gap-2.5 mb-3">
            <img
              v-if="offer.developer.avatarUrl"
              :src="optimizedAvatar(offer.developer.avatarUrl, 72)"
              :alt="offer.developer.name"
              class="w-6 h-6 rounded-full shrink-0"
            />
            <div v-else class="w-6 h-6 rounded-full bg-foreground/[0.05] flex items-center justify-center shrink-0">
              <span class="text-[9px] font-medium text-foreground-muted">{{ offer.developer.name?.charAt(0) || '?' }}</span>
            </div>
            <span class="text-xs text-foreground-muted">{{ offer.developer.name }}</span>
            <span class="text-[11px] text-foreground-muted ml-auto">{{ formatDate(offer.createdAt) }}</span>
          </div>

          <div class="flex items-center gap-2 flex-wrap mb-2">
            <span
              class="px-2 py-0.5 text-[11px] font-medium border rounded-full"
              :class="typeColors[offer.type] || typeColors.other"
            >
              {{ typeLabels[offer.type] || offer.type }}
            </span>
            <span
              v-if="offer.verified"
              class="px-2 py-0.5 text-[11px] font-medium border border-primary/30 text-primary rounded-full"
            >
              Vérifié
            </span>
            <span v-if="offer.location" class="text-[11px] text-foreground-muted">{{ offer.location }}</span>
          </div>

          <h3 class="font-medium text-[15px] text-foreground leading-snug">
            <a
              v-if="offer.url"
              :href="offer.url"
              target="_blank"
              rel="noopener noreferrer"
              class="underline underline-offset-2 decoration-border/30 hover:decoration-primary transition-colors"
            >
              {{ offer.title }}
            </a>
            <span v-else>{{ offer.title }}</span>
          </h3>
          <p v-if="offer.description" class="text-xs text-foreground-muted mt-1.5 line-clamp-2">
            {{ offer.description }}
          </p>

          <button
            @click="toggleComments(offer.id)"
            class="text-[11px] text-foreground-muted hover:text-foreground mt-3 transition-colors"
          >
            {{ expandedOfferId === offer.id ? 'Masquer' : 'Commentaires' }}
          </button>
        </div>

        <div v-if="expandedOfferId === offer.id" class="border-t border-border/10 p-5">
          <QgComments
            :offer-id="offer.id"
            :current-user-id="currentUserId"
            :is-owner="offer.developer.id === currentUserId"
          />
        </div>
      </div>
    </div>
  </section>
</template>
