<script setup lang="ts">
import { QG_FROZEN } from '#shared/utils/qg'

interface HelpRequest {
  id: number
  title: string
  description: string | null
  helpType: 'bug' | 'review' | 'advice' | 'pair' | 'other'
  status: 'open' | 'closed'
  techs: { id: number; techName: string }[]
  isOwner: boolean
  developer: { id: number; name: string; avatarUrl: string | null; slug: string } | null
}

definePageMeta({
  middleware: 'sidebase-auth'
})

const route = useRoute()
const router = useRouter()
const requestId = route.params.id

useSeoMeta({
  title: 'Ma demande',
  robots: 'noindex'
})

const { data: request, status: requestStatus, refresh: refreshRequest } = useLazyFetch<HelpRequest>(`/api/help-requests/${requestId}`)

const isOwner = computed(() => request.value?.isOwner ?? false)

const { data: matchesData, status: matchesStatus, execute: fetchMatches } = useLazyFetch<{
  matches: any[]
  total: number
  hasMore: boolean
}>(`/api/help-requests/${requestId}/matches`, {
  immediate: false
})

watch(() => request.value?.isOwner, (owner) => {
  if (owner) fetchMatches()
})

const { data: isAdmin } = useLazyFetch('/api/admin/check', {
  default: () => false
})
const { data: currentUser } = useLazyFetch<{ id: number } | null>('/api/developers/me', {
  default: () => null
})
const currentUserId = computed(() => currentUser.value?.id ?? null)

const isLoadingMatches = computed(() => matchesStatus.value === 'pending')
const matches = computed(() => matchesData.value?.matches || [])
const hasMoreMatches = computed(() => matchesData.value?.hasMore || false)
const totalMatches = computed(() => matchesData.value?.total || 0)

const isLoadingMore = ref(false)

async function loadAllMatches() {
  isLoadingMore.value = true
  try {
    const data = await $fetch<{ matches: any[]; total: number; hasMore: boolean }>(
      `/api/help-requests/${requestId}/matches?all=true`
    )
    matchesData.value = data
  } finally {
    isLoadingMore.value = false
  }
}

const toast = useToast()

const isClosing = ref(false)
const isDeleting = ref(false)

const showCloseDialog = ref(false)
const showReopenDialog = ref(false)
const showDeleteDialog = ref(false)

async function updateStatus(status: 'open' | 'closed') {
  isClosing.value = true
  const isClosing_ = status === 'closed'

  try {
    await fetch(`/api/help-requests/${requestId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    await refreshRequest()
    if (isClosing_) {
      showCloseDialog.value = false
      toast.success('Demande marquée comme résolue')
    } else {
      showReopenDialog.value = false
      toast.success('Demande rouverte')
    }
  } catch (error: any) {
    toast.error(error.data?.message || (isClosing_ ? 'Erreur lors de la fermeture' : 'Erreur lors de la réouverture'))
  } finally {
    isClosing.value = false
  }
}

async function confirmDeleteRequest() {
  isDeleting.value = true

  try {
    await fetch(`/api/help-requests/${requestId}`, {
      method: 'DELETE'
    })
    toast.success('Demande supprimée')
    router.push('/qg')
  } catch (error: any) {
    toast.error(error.data?.message || 'Erreur lors de la suppression')
    isDeleting.value = false
  }
}

const showContactModal = ref(false)
const selectedDev = ref<{ id: number; name: string } | null>(null)
const contactMessage = ref('')
const isSending = ref(false)
const contactError = ref('')
const contactSuccess = ref(false)

function openContactModal(dev: { id: number; name: string }) {
  selectedDev.value = dev
  contactMessage.value = ''
  contactError.value = ''
  contactSuccess.value = false
  showContactModal.value = true
}

function closeContactModal() {
  showContactModal.value = false
  selectedDev.value = null
}

async function sendContact() {
  if (!selectedDev.value || !contactMessage.value.trim()) return

  isSending.value = true
  contactError.value = ''

  try {
    await $fetch('/api/contact/send', {
      method: 'POST',
      body: {
        recipientId: selectedDev.value.id,
        message: contactMessage.value.trim(),
        helpRequestId: requestId
      }
    })
    contactSuccess.value = true
  } catch (error: any) {
    contactError.value = error.data?.message || 'Erreur lors de l\'envoi'
  } finally {
    isSending.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <div class="max-w-3xl mx-auto px-6 py-16">
      <NuxtLink to="/qg" class="inline-flex items-center gap-2 text-foreground-muted/60 hover:text-foreground transition-colors mb-10 text-xs uppercase tracking-widest font-medium">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Mon espace
      </NuxtLink>

      <div v-if="requestStatus === 'pending'" class="animate-pulse space-y-4">
        <div class="h-8 bg-border/10 rounded w-2/3"></div>
        <div class="h-4 bg-border/10 rounded w-1/3"></div>
      </div>

      <div v-else-if="request">
        <div class="flex items-start justify-between gap-4 mb-6">
          <div class="min-w-0">
            <span
              :class="[
                'inline-block px-2.5 py-1 rounded-full text-[11px] font-medium mb-3',
                request.status === 'open' ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400' : 'bg-primary/10 text-primary'
              ]"
            >
              {{ request.status === 'open' ? 'En cours' : 'Résolu' }}
            </span>
            <h1 class="font-display text-2xl md:text-3xl font-bold leading-tight">{{ request.title }}</h1>
          </div>
        </div>

        <div v-if="request.techs?.length" class="flex flex-wrap gap-2 mb-8">
          <span
            v-for="tech in request.techs"
            :key="tech.techName"
            class="px-2.5 py-1 bg-foreground/[0.04] rounded-full text-xs text-foreground-muted"
          >
            {{ tech.techName }}
          </span>
        </div>

        <p v-if="request.description" class="text-foreground-muted leading-relaxed mb-8 whitespace-pre-wrap">
          {{ request.description }}
        </p>

        <div v-if="!isOwner && request.developer" class="flex items-center gap-3 mb-8 p-4 rounded-xl border-2 border-border/15">
          <img v-if="request.developer.avatarUrl" :src="request.developer.avatarUrl" :alt="request.developer.name" class="w-9 h-9 rounded-full object-cover ring-2 ring-border/20" />
          <div v-else class="w-9 h-9 rounded-full bg-foreground/[0.05] flex items-center justify-center text-foreground-muted text-xs ring-2 ring-border/20">{{ request.developer.name?.charAt(0) }}</div>
          <NuxtLink :to="`/directory/${request.developer.slug}`" class="text-sm font-bold hover:text-primary transition-colors">{{ request.developer.name }}</NuxtLink>
        </div>

        <template v-if="isOwner">
          <div v-if="isLoadingMatches" class="space-y-2 mb-8">
            <div v-for="i in 2" :key="i" class="flex items-center gap-3 p-3 rounded-lg animate-pulse">
              <div class="w-8 h-8 bg-border/20 rounded-full"></div>
              <div class="h-4 bg-border/20 rounded w-24"></div>
            </div>
          </div>

          <div v-else-if="matches?.length" class="mb-8">
            <h3 class="text-sm font-display font-bold uppercase tracking-wide mb-4">
              {{ totalMatches }} {{ totalMatches === 1 ? 'personne peut' : 'personnes peuvent' }} t'aider
            </h3>
            <div class="divide-y divide-border/20">
              <div
                v-for="dev in matches"
                :key="dev.id"
                class="flex items-center gap-3 py-3 first:pt-0 group"
              >
                <img
                  v-if="dev.avatarUrl"
                  :src="dev.avatarUrl"
                  :alt="dev.name"
                  class="w-9 h-9 rounded-full object-cover ring-2 ring-border/20"
                />
                <div v-else class="w-9 h-9 rounded-full bg-foreground/[0.05] flex items-center justify-center text-foreground-muted text-xs ring-2 ring-border/20">
                  {{ dev.name?.charAt(0) }}
                </div>
                <NuxtLink :to="`/directory/${dev.slug}`" target="_blank" class="text-sm font-bold hover:text-primary transition-colors flex-1 min-w-0 truncate">
                  {{ dev.name }}
                </NuxtLink>
                <span v-if="dev.matchedSkills?.length" class="text-[11px] text-foreground-muted/50 hidden sm:block">
                  {{ dev.matchedSkills.slice(0, 2).join(', ') }}
                </span>
                <button
                  v-if="dev.canContact"
                  @click="openContactModal({ id: dev.id, name: dev.name })"
                  class="px-3 py-1 text-xs font-bold text-primary border border-primary/30 rounded-full hover:bg-primary/10 transition-colors"
                >
                  Contacter
                </button>
              </div>
            </div>
            <button
              v-if="hasMoreMatches"
              @click="loadAllMatches"
              :disabled="isLoadingMore"
              class="text-[11px] font-semibold uppercase tracking-widest text-primary hover:text-primary/80 transition-colors mt-3 disabled:opacity-50"
            >
              {{ isLoadingMore ? '...' : `+ ${totalMatches - matches.length} autres` }}
            </button>
          </div>

          <div v-else class="text-sm text-foreground-muted mb-8">
            Pas encore de match
          </div>

          <div class="flex items-center gap-3 pt-6 border-t-2 border-border/15">
            <NuxtLink v-if="!QG_FROZEN" :to="`/qg/requests/${requestId}/edit`" class="px-4 py-2 text-sm font-medium border border-border/20 rounded-full hover:border-foreground-muted hover:text-foreground transition-colors text-foreground-muted">
              Modifier
            </NuxtLink>
            <button
              v-if="request.status === 'open'"
              @click="showCloseDialog = true"
              class="px-4 py-2 text-sm font-medium border border-border/20 rounded-full hover:border-primary hover:text-primary transition-colors text-foreground-muted"
            >
              Résolu
            </button>
            <button
              v-else
              @click="showReopenDialog = true"
              class="px-4 py-2 text-sm font-medium border border-border/20 rounded-full hover:border-foreground-muted hover:text-foreground transition-colors text-foreground-muted"
            >
              Rouvrir
            </button>
            <button
              @click="showDeleteDialog = true"
              class="px-4 py-2 text-sm font-medium border border-border/20 rounded-full hover:border-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors text-foreground-muted ml-auto"
            >
              Supprimer
            </button>
          </div>
        </template>

        <div v-if="!isOwner && isAdmin" class="flex items-center gap-3 pt-6 border-t-2 border-border/15">
          <button
            v-if="request.status === 'open'"
            @click="showCloseDialog = true"
            class="px-4 py-2 text-sm font-medium border border-border/20 rounded-full hover:border-primary hover:text-primary transition-colors text-foreground-muted"
          >
            Clore (admin)
          </button>
          <button
            v-else
            @click="showReopenDialog = true"
            class="px-4 py-2 text-sm font-medium border border-border/20 rounded-full hover:border-foreground-muted hover:text-foreground transition-colors text-foreground-muted"
          >
            Rouvrir (admin)
          </button>
        </div>

        <QgComments :help-request-id="Number(requestId)" :current-user-id="currentUserId" :is-owner="isOwner" />
      </div>

      <div v-else class="text-center py-16">
        <p class="text-foreground-muted">Demande non trouvée</p>
        <NuxtLink to="/qg" class="inline-block mt-4 text-primary hover:underline">
          Retour au QG
        </NuxtLink>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="showContactModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div
          class="absolute inset-0 bg-black/60 backdrop-blur-sm"
          @click="closeContactModal"
        ></div>

        <div class="relative w-full max-w-md bg-background border-2 border-border/15 rounded-2xl p-8">
          <button
            @click="closeContactModal"
            class="absolute top-5 right-5 text-foreground-muted/40 hover:text-foreground transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <div v-if="contactSuccess" class="text-center py-8">
            <div class="w-14 h-14 mx-auto mb-5 rounded-full bg-primary/10 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-primary">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h3 class="font-display text-xl font-bold mb-2">Message envoyé</h3>
            <p class="text-foreground-muted text-sm mb-8">
              {{ selectedDev?.name }} recevra ton message par email.
            </p>
            <button
              @click="closeContactModal"
              class="px-6 py-2.5 text-sm text-foreground-muted border border-border/10 rounded-full hover:border-foreground-muted hover:text-foreground transition-colors"
            >
              Fermer
            </button>
          </div>

          <div v-else>
            <h3 class="font-display text-xl font-bold mb-1">
              Contacter {{ selectedDev?.name }}
            </h3>
            <p class="text-foreground-muted text-sm mb-6">
              Ton message sera envoyé par email. Ta réponse arrivera dans ta boîte mail.
            </p>

            <div class="space-y-4">
              <div>
                <label class="block text-xs font-medium text-foreground-muted uppercase tracking-wider mb-2">Ton message</label>
                <textarea
                  v-model="contactMessage"
                  rows="5"
                  maxlength="1000"
                  placeholder="Salut ! J'ai vu que tu connaissais..."
                  class="w-full px-4 py-3 bg-background border border-border/20 rounded-xl text-foreground placeholder:text-foreground-muted/40 focus:outline-none focus:border-foreground-muted resize-none"
                ></textarea>
                <p class="text-[11px] text-foreground-muted/40 mt-1.5 text-right tabular-nums">
                  {{ contactMessage.length }}/1000
                </p>
              </div>

              <p v-if="contactError" class="text-sm text-red-700 dark:text-red-400">
                {{ contactError }}
              </p>

              <button
                @click="sendContact"
                :disabled="!contactMessage.trim() || isSending"
                class="w-full py-3.5 bg-foreground border border-b-[3px] border-foreground border-b-foreground-muted/50 text-background rounded-full font-medium transition-all hover:-translate-y-0.5 hover:shadow-glow active:translate-y-px active:border-b active:shadow-none disabled:opacity-50"
              >
                {{ isSending ? 'Envoi...' : 'Envoyer' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <ConfirmDialog
      :open="showCloseDialog"
      title="Clore la demande"
      message="Marquer cette demande comme résolue ? Tu pourras la rouvrir si besoin."
      confirm-label="Clore"
      :loading="isClosing"
      @confirm="updateStatus('closed')"
      @cancel="showCloseDialog = false"
    />

    <ConfirmDialog
      :open="showReopenDialog"
      title="Rouvrir la demande"
      message="Remettre cette demande en cours ?"
      confirm-label="Rouvrir"
      :loading="isClosing"
      @confirm="updateStatus('open')"
      @cancel="showReopenDialog = false"
    />

    <ConfirmDialog
      :open="showDeleteDialog"
      title="Supprimer la demande"
      message="Cette action est irréversible. Tu perdras cette demande et son historique."
      confirm-label="Supprimer"
      variant="danger"
      :loading="isDeleting"
      @confirm="confirmDeleteRequest"
      @cancel="showDeleteDialog = false"
    />
  </div>
</template>
