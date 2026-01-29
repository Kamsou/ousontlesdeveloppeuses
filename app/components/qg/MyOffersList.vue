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
}

const props = defineProps<{
  offers: Offer[]
  isLoading: boolean
}>()

const emit = defineEmits<{
  deleted: []
}>()

const deleting = ref<number | null>(null)

async function deleteOffer(id: number, e: Event) {
  e.preventDefault()
  e.stopPropagation()
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
  <div class="mb-10">
    <div class="flex items-center justify-between mb-5">
      <h3 class="text-sm font-medium text-foreground-muted uppercase tracking-wide">Offres</h3>
      <span v-if="offers.length > 0" class="flex items-center gap-2 px-2.5 py-1 bg-primary/10 rounded-full">
        <span class="w-1.5 h-1.5 bg-primary rounded-full"></span>
        <span class="text-xs text-primary">{{ offers.length }} offre{{ offers.length > 1 ? 's' : '' }}</span>
      </span>
    </div>

    <div class="space-y-2">
      <div
        v-for="offer in offers"
        :key="offer.id"
        class="flex items-center gap-4 p-4 border border-border/30 rounded-xl hover:border-border/60 hover:bg-white/[0.02] transition-all group"
      >
        <span
          class="px-2 py-0.5 text-xs font-medium border rounded-full shrink-0"
          :class="typeColors[offer.type] || typeColors.other"
        >
          {{ typeLabels[offer.type] || offer.type }}
        </span>
        <div class="min-w-0 flex-1">
          <span class="text-sm font-medium text-foreground group-hover:text-foreground-muted transition-colors truncate block">
            <a
              v-if="offer.url"
              :href="offer.url"
              target="_blank"
              rel="noopener noreferrer"
              class="underline underline-offset-2 decoration-border hover:decoration-foreground-muted transition-colors"
            >
              {{ offer.title }}
            </a>
            <template v-else>{{ offer.title }}</template>
          </span>
          <div class="flex items-center gap-3 mt-1 text-xs text-foreground-muted">
            <span v-if="offer.location">{{ offer.location }}</span>
            <span
              v-if="offer.verified"
              class="text-green-400"
            >Vérifié</span>
            <span v-else class="text-amber-400">Non vérifié</span>
          </div>
        </div>
        <button
          @click="deleteOffer(offer.id, $event)"
          :disabled="deleting === offer.id"
          class="p-2 text-foreground-muted/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
          title="Supprimer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
