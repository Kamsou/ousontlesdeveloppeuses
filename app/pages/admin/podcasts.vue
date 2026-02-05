<script setup lang="ts">
definePageMeta({
  middleware: 'sidebase-auth'
})

useSeoMeta({
  title: 'Podcasts - Admin',
  robots: 'noindex'
})

const { data: session } = useAuth()
const { preference: themePreference, cycle: cycleTheme } = useQgTheme()
const themeLabel = computed(() => {
  if (themePreference.value === 'system') return 'Thème système'
  if (themePreference.value === 'light') return 'Thème clair'
  return 'Thème sombre'
})

interface Podcast {
  id: number
  title: string
  podcastName: string
  description: string | null
  guestName: string | null
  url: string
  imageUrl: string | null
  highlight: boolean
  active: boolean
  publishedAt: string | null
}

const { data: podcasts, status, error, refresh } = await useFetch<Podcast[]>('/api/admin/podcasts')

const showModal = ref(false)
const editing = ref<Podcast | null>(null)
const saving = ref(false)
const deleting = ref<number | null>(null)

const form = ref({
  title: '',
  podcastName: '',
  description: '',
  guestName: '',
  url: '',
  imageUrl: '',
  publishedAt: '',
  highlight: false,
  active: true
})

function formatDateForInput(dateStr: string | null) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toISOString().split('T')[0] || ''
}

function openNew() {
  editing.value = null
  form.value = {
    title: '',
    podcastName: '',
    description: '',
    guestName: '',
    url: '',
    imageUrl: '',
    publishedAt: '',
    highlight: false,
    active: true
  }
  showModal.value = true
}

function openEdit(podcast: Podcast) {
  editing.value = podcast
  form.value = {
    title: podcast.title,
    podcastName: podcast.podcastName,
    description: podcast.description || '',
    guestName: podcast.guestName || '',
    url: podcast.url,
    imageUrl: podcast.imageUrl || '',
    publishedAt: formatDateForInput(podcast.publishedAt),
    highlight: podcast.highlight,
    active: podcast.active
  }
  showModal.value = true
}

async function save() {
  saving.value = true
  try {
    if (editing.value) {
      await $fetch(`/api/admin/podcasts/${editing.value.id}`, {
        method: 'PUT',
        body: form.value
      })
    } else {
      await $fetch('/api/admin/podcasts', {
        method: 'POST',
        body: form.value
      })
    }
    showModal.value = false
    await refresh()
  } catch (e: any) {
    alert(e.data?.message || 'Erreur lors de la sauvegarde')
  } finally {
    saving.value = false
  }
}

async function deletePodcast(id: number, title: string) {
  if (!confirm(`Supprimer "${title}" ?`)) return

  deleting.value = id
  try {
    await $fetch(`/api/admin/podcasts/${id}`, { method: 'DELETE' })
    await refresh()
  } catch (e) {
    alert('Erreur lors de la suppression')
  } finally {
    deleting.value = null
  }
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <header class="sticky top-0 z-50 px-4 md:px-8 py-3 backdrop-blur-xl bg-background/80 border-b border-border/20">
      <div class="max-w-[1200px] mx-auto flex items-center justify-between">
        <NuxtLink to="/qg" class="flex items-center gap-2 no-underline text-foreground-muted hover:text-foreground transition-colors text-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Mon QG
        </NuxtLink>
        <h1 class="font-display text-sm font-semibold tracking-widest text-primary m-0">ADMIN</h1>
        <div class="flex items-center gap-3">
          <button @click="cycleTheme" class="flex items-center justify-center w-8 h-8 rounded-full border border-border/10 text-foreground-muted hover:text-foreground hover:border-foreground-muted transition-colors" :title="themeLabel">
            <svg v-if="themePreference === 'system'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            <svg v-else-if="themePreference === 'light'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </button>
          <img v-if="session?.user?.image" :src="optimizedAvatar(session.user.image, 64)" :alt="session.user.name || ''" class="w-8 h-8 rounded-full border border-border/10" />
          <span v-else class="w-8 h-8 rounded-full bg-border/50"></span>
        </div>
      </div>
    </header>

    <div class="max-w-[1200px] mx-auto px-4 md:px-16 py-8">
      <div class="flex flex-wrap gap-3 mb-8">
        <NuxtLink
          to="/admin"
          class="px-4 py-2 border border-border/10 rounded-lg text-sm font-medium hover:border-foreground-muted transition-colors no-underline"
        >
          Développeuses
        </NuxtLink>
        <NuxtLink
          to="/admin/programs"
          class="px-4 py-2 border border-border/10 rounded-lg text-sm font-medium hover:border-foreground-muted transition-colors no-underline"
        >
          Programmes
        </NuxtLink>
        <NuxtLink
          to="/admin/podcasts"
          class="px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium no-underline"
        >
          Podcasts
        </NuxtLink>
        <NuxtLink
          to="/admin/stats"
          class="px-4 py-2 border border-border/10 rounded-lg text-sm font-medium hover:border-foreground-muted transition-colors no-underline"
        >
          Stats
        </NuxtLink>
        <NuxtLink
          to="/admin/newsletter"
          class="px-4 py-2 border border-border/10 rounded-lg text-sm font-medium hover:border-foreground-muted transition-colors no-underline"
        >
          Newsletter
        </NuxtLink>
      </div>

    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 class="font-display text-3xl md:text-4xl font-medium tracking-tight">Podcasts</h1>
        <p class="text-foreground-muted mt-2">{{ podcasts?.length || 0 }} épisode{{ (podcasts?.length || 0) > 1 ? 's' : '' }}</p>
      </div>
      <button
        @click="openNew"
        class="px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground-muted transition-colors"
      >
        Ajouter un épisode
      </button>
    </div>

    <div v-if="error" class="p-6 border border-red-500/50 rounded-xl bg-red-500/10 text-red-400">
      <p class="font-medium">Accès refusé</p>
    </div>

    <div v-else-if="status === 'pending'" class="flex justify-center py-20">
      <div class="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin"></div>
    </div>

    <div v-else-if="podcasts?.length === 0" class="text-center py-12 text-foreground-muted border border-border/10 rounded-2xl">
      Aucun podcast. Ajoute le premier !
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="podcast in podcasts"
        :key="podcast.id"
        :class="[
          'p-6 border rounded-2xl',
          podcast.active ? 'border-border/10' : 'border-border/50 opacity-60'
        ]"
      >
        <div class="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-3 mb-2 flex-wrap">
              <h2 class="font-display text-lg font-medium truncate">{{ podcast.title }}</h2>
              <span v-if="podcast.highlight" class="px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full">
                Highlight
              </span>
              <span v-if="!podcast.active" class="px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded-full">
                Inactif
              </span>
            </div>
            <p class="text-sm text-foreground-muted mb-2">
              {{ podcast.podcastName }}
              <span v-if="podcast.guestName"> · avec {{ podcast.guestName }}</span>
              <span v-if="podcast.publishedAt"> · {{ new Date(podcast.publishedAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) }}</span>
            </p>
            <p v-if="podcast.description" class="text-sm text-foreground-muted mb-3 line-clamp-2">{{ podcast.description }}</p>
            <a :href="podcast.url" target="_blank" class="text-xs text-foreground-muted hover:text-foreground underline">
              {{ podcast.url }}
            </a>
          </div>
          <div class="flex gap-2 shrink-0">
            <button
              @click="openEdit(podcast)"
              class="px-3 py-1.5 text-xs border border-border/10 rounded-lg hover:border-foreground-muted transition-colors"
            >
              Modifier
            </button>
            <button
              @click="deletePodcast(podcast.id, podcast.title)"
              :disabled="deleting === podcast.id"
              class="px-3 py-1.5 text-xs border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-50"
            >
              {{ deleting === podcast.id ? '...' : 'Supprimer' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
  </div>

  <Teleport to="body">
    <div v-if="showModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" @click="showModal = false"></div>
      <div class="relative z-10 w-full max-w-lg bg-[#0a0a0f] border border-border/10 rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 class="font-display text-xl font-medium mb-6 text-foreground">
          {{ editing ? 'Modifier l\'épisode' : 'Nouvel épisode' }}
        </h2>

        <form @submit.prevent="save" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2 text-foreground">Titre de l'épisode</label>
            <input
              v-model="form.title"
              type="text"
              required
              class="w-full px-4 py-3 bg-transparent border border-border/10 rounded-xl text-foreground focus:outline-none focus:border-foreground-muted"
              placeholder="Vue.js, Nuxt.js et projets concrets..."
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-2 text-foreground">Nom du podcast</label>
            <input
              v-model="form.podcastName"
              type="text"
              required
              class="w-full px-4 py-3 bg-transparent border border-border/10 rounded-xl text-foreground focus:outline-none focus:border-foreground-muted"
              placeholder="Dev Zone"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-2 text-foreground">Invitée (optionnel)</label>
            <input
              v-model="form.guestName"
              type="text"
              class="w-full px-4 py-3 bg-transparent border border-border/10 rounded-xl text-foreground focus:outline-none focus:border-foreground-muted"
              placeholder="Camille Coutens"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-2 text-foreground">Description (optionnel)</label>
            <textarea
              v-model="form.description"
              rows="3"
              class="w-full px-4 py-3 bg-transparent border border-border/10 rounded-xl text-foreground focus:outline-none focus:border-foreground-muted resize-none"
              placeholder="De quoi parle cet épisode..."
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2 text-foreground">URL (Spotify, Apple...)</label>
            <input
              v-model="form.url"
              type="url"
              required
              class="w-full px-4 py-3 bg-transparent border border-border/10 rounded-xl text-foreground focus:outline-none focus:border-foreground-muted"
              placeholder="https://open.spotify.com/episode/..."
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-2 text-foreground">Date de publication (optionnel)</label>
            <input
              v-model="form.publishedAt"
              type="date"
              class="w-full px-4 py-3 bg-transparent border border-border/10 rounded-xl text-foreground focus:outline-none focus:border-foreground-muted"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-2 text-foreground">Image / Artwork (optionnel)</label>
            <input
              v-model="form.imageUrl"
              type="url"
              class="w-full px-4 py-3 bg-transparent border border-border/10 rounded-xl text-foreground focus:outline-none focus:border-foreground-muted"
              placeholder="https://..."
            />
          </div>

          <div class="flex gap-6">
            <label class="flex items-center gap-2 cursor-pointer text-foreground">
              <input type="checkbox" v-model="form.highlight" class="w-4 h-4" />
              <span class="text-sm">Mettre en avant</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer text-foreground">
              <input type="checkbox" v-model="form.active" class="w-4 h-4" />
              <span class="text-sm">Actif</span>
            </label>
          </div>

          <div class="flex gap-3 pt-4">
            <button
              type="button"
              @click="showModal = false"
              class="flex-1 py-3 border border-border/10 rounded-xl text-foreground hover:border-foreground-muted transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="flex-1 py-3 bg-foreground text-background rounded-xl font-medium disabled:opacity-50"
            >
              {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
