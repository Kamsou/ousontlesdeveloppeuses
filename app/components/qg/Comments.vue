<script setup lang="ts">
interface Comment {
  id: number
  content: string
  createdAt: string
  developer: {
    id: number
    name: string
    avatarUrl: string | null
  }
}

const props = defineProps<{
  helpRequestId?: number
  sideProjectId?: number
  currentUserId?: number | null
}>()

const { status: authStatus } = useAuth()
const isAuthenticated = computed(() => authStatus.value === 'authenticated')

const toast = useToast()

const queryParams = computed(() => {
  const params: Record<string, string> = {}
  if (props.helpRequestId) params.helpRequestId = String(props.helpRequestId)
  if (props.sideProjectId) params.sideProjectId = String(props.sideProjectId)
  return params
})

const { data: comments, status } = useLazyFetch<Comment[]>('/api/comments', {
  query: queryParams
})
const isLoading = computed(() => status.value === 'pending')

const newComment = ref('')
const isSending = ref(false)

async function submitComment() {
  if (!newComment.value.trim() || isSending.value) return

  isSending.value = true
  try {
    const comment = await $fetch<Comment>('/api/comments', {
      method: 'POST',
      body: {
        content: newComment.value.trim(),
        helpRequestId: props.helpRequestId || null,
        sideProjectId: props.sideProjectId || null
      }
    })
    if (comments.value) {
      comments.value = [...comments.value, comment]
    }
    newComment.value = ''
  } catch (e: any) {
    toast.error(e.data?.message || 'Erreur lors de l\'envoi')
  } finally {
    isSending.value = false
  }
}

async function deleteComment(id: number) {
  try {
    await $fetch(`/api/comments/${id}`, { method: 'DELETE' })
    if (comments.value) {
      comments.value = comments.value.filter(c => c.id !== id)
    }
  } catch (e: any) {
    toast.error(e.data?.message || 'Erreur lors de la suppression')
  }
}

function formatDate(date: string) {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return "À l'instant"
  if (minutes < 60) return `Il y a ${minutes}min`
  if (hours < 24) return `Il y a ${hours}h`
  if (days < 7) return `Il y a ${days}j`
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}
</script>

<template>
  <section class="mt-8 pt-8 border-t border-border/20">
    <h3 class="text-sm font-medium mb-6">
      Discussion
      <span v-if="comments?.length" class="text-foreground-muted font-normal">
        ({{ comments.length }})
      </span>
    </h3>

    <div v-if="isLoading" class="space-y-4">
      <div v-for="i in 2" :key="i" class="flex gap-3 animate-pulse">
        <div class="w-8 h-8 bg-border/20 rounded-full shrink-0"></div>
        <div class="flex-1">
          <div class="h-3 bg-border/20 rounded w-24 mb-2"></div>
          <div class="h-4 bg-border/20 rounded w-3/4"></div>
        </div>
      </div>
    </div>

    <template v-else>
      <div v-if="comments?.length" class="space-y-4 mb-6">
        <div
          v-for="comment in comments"
          :key="comment.id"
          class="flex gap-3 group"
        >
          <NuxtLink :to="`/annuaire/${comment.developer.id}`">
            <img
              v-if="comment.developer.avatarUrl"
              :src="comment.developer.avatarUrl"
              :alt="comment.developer.name"
              class="w-8 h-8 rounded-full object-cover shrink-0"
            />
            <div v-else class="w-8 h-8 rounded-full bg-border/30 flex items-center justify-center shrink-0">
              <span class="text-xs text-foreground-muted">{{ comment.developer.name?.charAt(0) || '?' }}</span>
            </div>
          </NuxtLink>

          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <NuxtLink
                :to="`/annuaire/${comment.developer.id}`"
                class="text-sm font-medium hover:text-foreground-muted transition-colors"
              >
                {{ comment.developer.name }}
              </NuxtLink>
              <span class="text-xs text-foreground-muted/50">{{ formatDate(comment.createdAt) }}</span>
              <button
                v-if="props.currentUserId === comment.developer.id"
                @click="deleteComment(comment.id)"
                class="text-xs text-foreground-muted/30 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
              >
                Supprimer
              </button>
            </div>
            <p class="text-sm text-foreground-muted whitespace-pre-wrap">{{ comment.content }}</p>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-6 mb-6">
        <p class="text-foreground-muted text-sm">Aucun commentaire</p>
      </div>

      <div v-if="isAuthenticated">
        <textarea
          v-model="newComment"
          rows="2"
          placeholder="Ajouter un commentaire..."
          class="w-full px-4 py-3 bg-white/5 border border-border rounded-xl text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:border-foreground-muted resize-none text-sm"
          @keydown.meta.enter="submitComment"
          @keydown.ctrl.enter="submitComment"
        ></textarea>
        <div class="flex items-center justify-end gap-3 mt-2">
          <span class="text-xs text-foreground-muted">Cmd+Enter</span>
          <button
            @click="submitComment"
            :disabled="!newComment.trim() || isSending"
            class="px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium transition-opacity disabled:opacity-50"
          >
            {{ isSending ? '...' : 'Envoyer' }}
          </button>
        </div>
      </div>
      <p v-else class="text-center text-foreground-muted/50 text-sm py-4">
        Connecte-toi pour commenter
      </p>
    </template>
  </section>
</template>
