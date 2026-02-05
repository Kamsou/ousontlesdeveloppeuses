<script setup lang="ts">
definePageMeta({
  middleware: 'sidebase-auth'
})

useSeoMeta({
  title: 'Programmes - Admin',
  robots: 'noindex'
})

const { data: session } = useAuth()
const { preference: themePreference, cycle: cycleTheme } = useQgTheme()
const themeLabel = computed(() => {
  if (themePreference.value === 'system') return 'Thème système'
  if (themePreference.value === 'light') return 'Thème clair'
  return 'Thème sombre'
})

interface Program {
  id: number
  name: string
  description: string
  category: 'community' | 'mentoring' | 'conference' | 'funding'
  url: string
  highlight: boolean
  active: boolean
}

const { data: programs, status, error, refresh } = await useFetch<Program[]>('/api/admin/programs')

const categoryLabels: Record<string, string> = {
  community: 'Communauté',
  mentoring: 'Mentorat',
  conference: 'Conférence',
  funding: 'Formation'
}

const showModal = ref(false)
const editing = ref<Program | null>(null)
const saving = ref(false)
const deleting = ref<number | null>(null)

const form = ref({
  name: '',
  description: '',
  category: 'community' as 'community' | 'mentoring' | 'conference' | 'funding',
  url: '',
  highlight: false,
  active: true
})

function openNew() {
  editing.value = null
  form.value = {
    name: '',
    description: '',
    category: 'community',
    url: '',
    highlight: false,
    active: true
  }
  showModal.value = true
}

function openEdit(program: Program) {
  editing.value = program
  form.value = {
    name: program.name,
    description: program.description,
    category: program.category,
    url: program.url,
    highlight: program.highlight,
    active: program.active
  }
  showModal.value = true
}

async function save() {
  saving.value = true
  try {
    if (editing.value) {
      await $fetch(`/api/admin/programs/${editing.value.id}`, {
        method: 'PUT',
        body: form.value
      })
    } else {
      await $fetch('/api/admin/programs', {
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

async function deleteProgram(id: number, name: string) {
  if (!confirm(`Supprimer "${name}" ?`)) return

  deleting.value = id
  try {
    await $fetch(`/api/admin/programs/${id}`, { method: 'DELETE' })
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
          class="px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium no-underline"
        >
          Programmes
        </NuxtLink>
        <NuxtLink
          to="/admin/podcasts"
          class="px-4 py-2 border border-border/10 rounded-lg text-sm font-medium hover:border-foreground-muted transition-colors no-underline"
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
        <h1 class="font-display text-3xl md:text-4xl font-medium tracking-tight">Programmes</h1>
        <p class="text-foreground-muted mt-2">{{ programs?.length || 0 }} programme{{ (programs?.length || 0) > 1 ? 's' : '' }}</p>
      </div>
      <button
        @click="openNew"
        class="px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground-muted transition-colors"
      >
        Ajouter un programme
      </button>
    </div>

    <div v-if="error" class="p-6 border border-red-500/50 rounded-xl bg-red-500/10 text-red-400">
      <p class="font-medium">Accès refusé</p>
    </div>

    <div v-else-if="status === 'pending'" class="flex justify-center py-20">
      <div class="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin"></div>
    </div>

    <div v-else-if="programs?.length === 0" class="text-center py-12 text-foreground-muted border border-border/10 rounded-2xl">
      Aucun programme. Ajoute le premier !
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="program in programs"
        :key="program.id"
        :class="[
          'p-6 border rounded-2xl',
          program.active ? 'border-border/10' : 'border-border/50 opacity-60'
        ]"
      >
        <div class="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <h2 class="font-display text-lg font-medium">{{ program.name }}</h2>
              <span v-if="program.highlight" class="px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full">
                Highlight
              </span>
              <span v-if="!program.active" class="px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded-full">
                Inactif
              </span>
            </div>
            <p class="text-sm text-foreground-muted mb-3">{{ program.description }}</p>
            <div class="flex items-center gap-3">
              <span class="px-2 py-1 text-xs border border-border/10 rounded-full text-foreground-muted">
                {{ categoryLabels[program.category] }}
              </span>
              <a :href="program.url" target="_blank" class="text-xs text-foreground-muted hover:text-foreground underline">
                {{ program.url }}
              </a>
            </div>
          </div>
          <div class="flex gap-2">
            <button
              @click="openEdit(program)"
              class="px-3 py-1.5 text-xs border border-border/10 rounded-lg hover:border-foreground-muted transition-colors"
            >
              Modifier
            </button>
            <button
              @click="deleteProgram(program.id, program.name)"
              :disabled="deleting === program.id"
              class="px-3 py-1.5 text-xs border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-50"
            >
              {{ deleting === program.id ? '...' : 'Supprimer' }}
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
      <div class="relative z-10 w-full max-w-lg bg-[#0a0a0f] border border-border/10 rounded-2xl p-6">
        <h2 class="font-display text-xl font-medium mb-6 text-foreground">
          {{ editing ? 'Modifier le programme' : 'Nouveau programme' }}
        </h2>

        <form @submit.prevent="save" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2 text-foreground">Nom</label>
            <input
              v-model="form.name"
              type="text"
              required
              class="w-full px-4 py-3 bg-transparent border border-border/10 rounded-xl text-foreground focus:outline-none focus:border-foreground-muted"
              placeholder="Duchess France"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-2 text-foreground">Description</label>
            <textarea
              v-model="form.description"
              required
              rows="3"
              class="w-full px-4 py-3 bg-transparent border border-border/10 rounded-xl text-foreground focus:outline-none focus:border-foreground-muted resize-none"
              placeholder="Communauté de développeuses..."
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2 text-foreground">URL</label>
            <input
              v-model="form.url"
              type="url"
              required
              class="w-full px-4 py-3 bg-transparent border border-border/10 rounded-xl text-foreground focus:outline-none focus:border-foreground-muted"
              placeholder="https://..."
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-2 text-foreground">Catégorie</label>
            <select
              v-model="form.category"
              class="w-full px-4 py-3 bg-[#0a0a0f] border border-border/10 rounded-xl text-foreground focus:outline-none focus:border-foreground-muted"
            >
              <option value="community">Communauté</option>
              <option value="mentoring">Mentorat</option>
              <option value="conference">Conférence</option>
              <option value="funding">Formation</option>
            </select>
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
