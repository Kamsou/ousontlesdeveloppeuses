<script setup lang="ts">
interface HelpRequest {
  id: number
  title: string
  status: 'open' | 'in_progress' | 'closed'
  techs?: { id: number; techName: string }[]
}

defineProps<{
  openRequests: HelpRequest[]
  closedRequests: HelpRequest[]
  isLoading: boolean
}>()

const closingRequestId = ref<number | null>(null)
const showClosedRequests = ref(false)

const emit = defineEmits<{
  'mark-resolved': [requestId: number]
}>()

async function markAsResolved(requestId: number, e: Event) {
  e.preventDefault()
  e.stopPropagation()
  closingRequestId.value = requestId
  emit('mark-resolved', requestId)
  closingRequestId.value = null
}
</script>

<template>
  <section class="mb-16">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-display font-medium">Tes demandes</h2>
      <span v-if="openRequests.length > 0" class="flex items-center gap-2 px-2.5 py-1 bg-amber-500/10 rounded-full">
        <span class="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></span>
        <span class="text-xs text-amber-400">{{ openRequests.length }} en cours</span>
      </span>
    </div>

    <div v-if="isLoading" class="space-y-3">
      <div v-for="i in 2" :key="i" class="p-4 border border-border/30 rounded-xl animate-pulse">
        <div class="h-4 bg-border/20 rounded w-1/2 mb-2"></div>
        <div class="h-3 bg-border/20 rounded w-1/4"></div>
      </div>
    </div>

    <div v-else-if="openRequests.length === 0 && closedRequests.length === 0" class="py-10 text-center border border-dashed border-border/30 rounded-xl">
      <p class="text-foreground-muted text-sm mb-1">Tu n'as pas encore de demande</p>
      <p class="text-foreground-muted text-xs">Crée-en une pour recevoir de l'aide</p>
    </div>

    <div v-else class="space-y-2">
      <NuxtLink
        v-for="request in openRequests"
        :key="request.id"
        :to="`/qg/requests/${request.id}`"
        class="flex items-center gap-4 p-4 border border-border/30 rounded-xl hover:border-primary/20 hover:bg-foreground/[0.02] transition-all group"
      >
        <span class="w-2 h-2 bg-amber-400 rounded-full shrink-0"></span>
        <div class="min-w-0 flex-1">
          <span class="text-sm font-medium text-foreground group-hover:text-foreground-muted transition-colors truncate block">
            {{ request.title }}
          </span>
          <div v-if="request.techs?.length" class="flex items-center gap-1.5 mt-1.5">
            <span
              v-for="tech in request.techs.slice(0, 3)"
              :key="tech.id"
              class="px-2 py-0.5 bg-subtle rounded text-xs text-foreground-muted"
            >
              {{ tech.techName }}
            </span>
            <span v-if="request.techs.length > 3" class="text-xs text-foreground-muted/40">
              +{{ request.techs.length - 3 }}
            </span>
          </div>
        </div>
        <button
          @click="markAsResolved(request.id, $event)"
          :disabled="closingRequestId === request.id"
          class="p-2 text-foreground-muted/30 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-all disabled:opacity-50"
          title="Marquer résolu"
        >
          <span v-if="closingRequestId === request.id" class="block w-4 h-4 border-2 border-foreground-muted/40 border-t-transparent rounded-full animate-spin"></span>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </button>
      </NuxtLink>

      <div v-for="request in closedRequests.slice(0, showClosedRequests ? undefined : 0)" :key="request.id">
        <NuxtLink
          :to="`/qg/requests/${request.id}`"
          class="flex items-center gap-4 p-4 rounded-xl hover:bg-foreground/[0.02] transition-all group"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-green-500/50 shrink-0">
            <path d="M20 6L9 17l-5-5" />
          </svg>
          <span class="text-sm text-foreground-muted/60 group-hover:text-foreground-muted transition-colors truncate">
            {{ request.title }}
          </span>
        </NuxtLink>
      </div>

      <button
        v-if="closedRequests.length > 0"
        @click="showClosedRequests = !showClosedRequests"
        class="flex items-center gap-2 px-4 py-2 text-foreground-muted/50 hover:text-foreground-muted transition-colors text-xs"
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          :class="['transition-transform', showClosedRequests ? 'rotate-180' : '']"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
        {{ showClosedRequests ? 'Masquer' : `Voir ${closedRequests.length} résolu${closedRequests.length > 1 ? 'es' : 'e'}` }}
      </button>
    </div>
  </section>
</template>
