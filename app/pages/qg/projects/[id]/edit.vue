<script setup lang="ts">
import type { SideProjectStatus } from '~/utils/sideProjectStatus'

definePageMeta({
  middleware: ['sidebase-auth', 'qg-frozen']
})

useSeoMeta({
  title: 'Modifier le projet',
  robots: 'noindex'
})

const route = useRoute()
const router = useRouter()
const toast = useToast()
const projectId = route.params.id

const { data: project, status: projectStatus } = await useFetch<{
  id: number
  title: string
  description: string
  repoUrl: string | null
  websiteUrl: string | null
  status: 'idea' | 'open_to_contributors' | 'looking_for_cofounder' | 'completed'
  techs: string[]
  developer: { id: number }
}>(`/api/side-projects/${projectId}`)

const { data: currentUser } = await useFetch<{ id: number } | null>('/api/developers/me', {
  default: () => null
})

if (project.value && currentUser.value?.id !== project.value.developer.id) {
  await navigateTo(`/qg/projects/${projectId}`)
}

interface ProjectEditFormState {
  title: string
  description: string
  repoUrl: string
  websiteUrl: string
  status: SideProjectStatus
}

const form = ref<ProjectEditFormState>({
  title: project.value?.title || '',
  description: project.value?.description || '',
  repoUrl: project.value?.repoUrl || '',
  websiteUrl: project.value?.websiteUrl || '',
  status: project.value?.status || 'open_to_contributors'
})

const { techs, techInput, addTech, removeTech, handleTechKeydown, handleTechInput } = useTechInput(project.value?.techs || [])
const saving = ref(false)
const error = ref('')

const canSubmit = computed(() => form.value.title.trim().length > 0 && form.value.description.trim().length > 0)

async function submit() {
  if (!form.value.title.trim()) {
    error.value = 'Le titre est requis'
    return
  }

  if (!form.value.description.trim()) {
    error.value = 'La description est requise'
    return
  }

  saving.value = true
  error.value = ''

  try {
    const url = `/api/side-projects/${projectId}`
    await $fetch(url, {
      method: 'PATCH',
      body: {
        title: form.value.title,
        description: form.value.description,
        repoUrl: form.value.repoUrl || null,
        websiteUrl: form.value.websiteUrl || null,
        status: form.value.status,
        techs: techs.value
      }
    })

    toast.success('Projet mis à jour')
    router.push(`/qg/projects/${projectId}`)
  } catch (e: any) {
    error.value = e.data?.message || 'Erreur lors de la modification'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <div class="max-w-2xl mx-auto px-6 py-16">
      <NuxtLink
        :to="`/qg/projects/${projectId}`"
        class="inline-flex items-center gap-2 text-foreground-muted/60 hover:text-foreground transition-colors mb-10 text-xs uppercase tracking-widest font-medium"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Retour au projet
      </NuxtLink>

      <div v-if="projectStatus === 'pending'" class="animate-pulse space-y-4">
        <div class="h-8 bg-border/10 rounded w-1/2"></div>
        <div class="h-12 bg-border/10 rounded w-full mt-8"></div>
        <div class="h-24 bg-border/10 rounded w-full"></div>
      </div>

      <template v-else-if="project">
        <h1 class="font-display text-3xl md:text-4xl font-bold mb-3">
          Modifier le projet
        </h1>
        <p class="text-foreground-muted text-lg mb-10">
          Mets à jour les informations de ton projet.
        </p>

        <form @submit.prevent="submit" class="space-y-8">
          <div v-if="error" class="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-700 dark:text-red-400">
            {{ error }}
          </div>

          <div class="space-y-2">
            <label for="title" class="block text-sm text-foreground-muted">
              Nom du projet *
            </label>
            <input
              id="title"
              v-model="form.title"
              type="text"
              placeholder="Ex: App de gestion de tâches collaborative"
              class="w-full px-4 py-3 bg-background border border-border/20 rounded-xl text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:border-foreground-muted transition-colors"
            />
          </div>

          <div class="space-y-2">
            <label for="description" class="block text-sm text-foreground-muted">
              Description du projet *
            </label>
            <textarea
              id="description"
              v-model="form.description"
              rows="4"
              placeholder="Décris ton projet, l'idée, ce que tu cherches..."
              class="w-full px-4 py-3 bg-background border border-border/20 rounded-xl text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:border-foreground-muted transition-colors resize-none"
            />
          </div>

          <div class="space-y-2">
            <label for="repoUrl" class="block text-sm text-foreground-muted">
              Lien vers le repo (optionnel)
            </label>
            <input
              id="repoUrl"
              v-model="form.repoUrl"
              type="url"
              placeholder="https://github.com/..."
              class="w-full px-4 py-3 bg-background border border-border/20 rounded-xl text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:border-foreground-muted transition-colors"
            />
          </div>

          <div class="space-y-2">
            <label for="websiteUrl" class="block text-sm text-foreground-muted">
              Lien vers le site / landing page (optionnel)
            </label>
            <input
              id="websiteUrl"
              v-model="form.websiteUrl"
              type="url"
              placeholder="https://monprojet.fr"
              class="w-full px-4 py-3 bg-background border border-border/20 rounded-xl text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:border-foreground-muted transition-colors"
            />
          </div>

          <div class="space-y-3">
            <label class="block text-sm text-foreground-muted">
              Statut du projet
            </label>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                v-for="status in statusOptions"
                :key="status.value"
                type="button"
                @click="form.status = status.value"
                :class="[
                  'p-4 border rounded-xl text-left transition-all',
                  form.status === status.value
                    ? 'border-primary bg-primary/10'
                    : 'border-border/10 hover:border-foreground-muted'
                ]"
              >
                <span class="block font-medium text-sm">{{ status.label }}</span>
                <span class="block text-xs text-foreground-muted mt-1">{{ status.description }}</span>
              </button>
            </div>
          </div>

          <div class="space-y-3">
            <label for="techs" class="block text-sm text-foreground-muted">
              Stack technique
            </label>
            <div class="flex gap-2">
              <input
                id="techs"
                v-model="techInput"
                type="text"
                placeholder="Ex: Vue, TypeScript, Node..."
                @keydown="handleTechKeydown"
                @input="handleTechInput"
                class="flex-1 px-4 py-3 bg-background border border-border/20 rounded-xl text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:border-foreground-muted transition-colors"
              />
              <button
                type="button"
                @click="addTech"
                class="px-4 py-3 border border-border/20 rounded-xl text-foreground-muted hover:text-foreground hover:border-foreground-muted transition-colors"
              >
                Ajouter
              </button>
            </div>
            <div v-if="techs.length" class="flex flex-wrap gap-2">
              <span
                v-for="tech in techs"
                :key="tech"
                class="inline-flex items-center gap-2 px-3 py-1 bg-foreground/[0.04] border border-border/20 rounded-full text-sm"
              >
                {{ tech }}
                <button type="button" @click="removeTech(tech)" class="text-foreground-muted hover:text-foreground" :aria-label="`Supprimer ${tech}`">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </span>
            </div>
          </div>

          <div class="pt-4 flex gap-4">
            <NuxtLink
              :to="`/qg/projects/${projectId}`"
              class="px-8 py-4 border border-border/20 rounded-full font-medium transition-all hover:border-foreground-muted text-center"
            >
              Annuler
            </NuxtLink>
            <button
              type="submit"
              :disabled="saving || !canSubmit"
              class="flex-1 px-8 py-4 bg-foreground border border-b-[3px] border-foreground border-b-foreground-muted/50 text-background rounded-full font-medium transition-all hover:-translate-y-0.5 hover:shadow-glow active:translate-y-px active:border-b active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </template>

      <div v-else class="text-center py-16">
        <p class="text-foreground-muted">Projet non trouvé</p>
      </div>
    </div>
  </div>
</template>
