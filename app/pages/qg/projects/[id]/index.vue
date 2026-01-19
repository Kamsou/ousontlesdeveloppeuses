<script setup lang="ts">
import { statusLabels, statusColors, type SideProjectStatus } from '~/utils/sideProjectStatus'

interface SideProject {
  id: number
  title: string
  description: string
  repoUrl: string | null
  websiteUrl: string | null
  status: SideProjectStatus
  createdAt: string
  developer: {
    id: number
    name: string
    avatarUrl: string | null
    location: string | null
  }
  techs: string[]
}

definePageMeta({
  middleware: 'sidebase-auth'
})

const route = useRoute()
const router = useRouter()
const projectId = route.params.id
const toast = useToast()

const { data: project, status: projectStatus, refresh } = await useFetch<SideProject>(`/api/side-projects/${projectId}`)
const { data: currentUser } = useLazyFetch<{ id: number } | null>('/api/developers/me')

const currentUserId = computed(() => currentUser.value?.id ?? null)
const isOwner = computed(() => currentUserId.value === project.value?.developer.id)

useSeoMeta({
  title: project.value?.title || 'Side project',
  robots: 'noindex'
})

const showDeleteDialog = ref(false)
const isDeleting = ref(false)

async function markAsCompleted() {
  try {
    await $fetch(`/api/side-projects/${projectId}`, {
      method: 'PATCH',
      body: { status: 'completed' }
    })
    await refresh()
    toast.success('Projet marqué comme terminé')
  } catch (e: any) {
    toast.error(e.data?.message || 'Erreur')
  }
}

async function deleteProject() {
  isDeleting.value = true
  try {
    await $fetch(`/api/side-projects/${projectId}`, { method: 'DELETE' })
    toast.success('Projet supprimé')
    router.push('/qg?tab=projects')
  } catch (e: any) {
    toast.error(e.data?.message || 'Erreur')
    isDeleting.value = false
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <div class="max-w-3xl mx-auto px-6 py-16">
      <NuxtLink
        :to="{ path: '/qg', query: { tab: 'projects' } }"
        class="inline-flex items-center gap-2 text-foreground-muted hover:text-foreground transition-colors mb-8"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Side Projects
      </NuxtLink>

      <div v-if="projectStatus === 'pending'" class="animate-pulse space-y-4">
        <div class="h-8 bg-border/50 rounded w-2/3"></div>
        <div class="h-4 bg-border/50 rounded w-1/3"></div>
        <div class="h-24 bg-border/50 rounded w-full mt-6"></div>
      </div>

      <div v-else-if="project">
        <div class="flex items-start justify-between gap-4 mb-6">
          <div class="min-w-0">
            <h1 class="font-display text-2xl font-medium mb-3">{{ project.title }}</h1>
            <span :class="['px-2.5 py-1 rounded text-xs', statusColors[project.status]]">
              {{ statusLabels[project.status] }}
            </span>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <a
              v-if="project.repoUrl"
              :href="project.repoUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm text-foreground-muted hover:text-foreground hover:border-foreground-muted transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Repo
            </a>
            <a
              v-if="project.websiteUrl"
              :href="project.websiteUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm text-foreground-muted hover:text-foreground hover:border-foreground-muted transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              Site
            </a>
          </div>
        </div>

        <NuxtLink
          :to="`/annuaire/${project.developer.id}`"
          class="flex items-center gap-3 mb-8 group"
        >
          <img
            v-if="project.developer.avatarUrl"
            :src="project.developer.avatarUrl"
            :alt="project.developer.name"
            class="w-10 h-10 rounded-full object-cover"
          />
          <div v-else class="w-10 h-10 rounded-full bg-border/30 flex items-center justify-center">
            <span class="text-sm text-foreground-muted">{{ project.developer.name?.charAt(0) || '?' }}</span>
          </div>
          <div>
            <span class="text-sm font-medium group-hover:text-foreground-muted transition-colors">{{ project.developer.name }}</span>
            <p class="text-xs text-foreground-muted">Publié le {{ formatDate(project.createdAt) }}</p>
          </div>
        </NuxtLink>

        <div class="mb-8">
          <p class="text-foreground-muted whitespace-pre-wrap">{{ project.description }}</p>
        </div>

        <div v-if="project.techs?.length" class="mb-8">
          <h2 class="text-sm font-medium mb-3">Stack technique</h2>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="tech in project.techs"
              :key="tech"
              class="px-3 py-1 bg-white/5 border border-border/30 rounded-full text-sm text-foreground-muted"
            >
              {{ tech }}
            </span>
          </div>
        </div>

        <div v-if="isOwner" class="flex items-center gap-4 pt-6 border-t border-border/20 mb-8">
          <NuxtLink
            :to="`/qg/projects/${projectId}/edit`"
            class="text-sm text-foreground-muted hover:text-foreground transition-colors"
          >
            Modifier
          </NuxtLink>
          <button
            v-if="project.status !== 'completed'"
            @click="markAsCompleted"
            class="text-sm text-foreground-muted hover:text-green-400 transition-colors"
          >
            Marquer terminé
          </button>
          <button
            @click="showDeleteDialog = true"
            class="text-sm text-foreground-muted hover:text-red-400 transition-colors ml-auto"
          >
            Supprimer
          </button>
        </div>

        <QgComments :side-project-id="Number(projectId)" :current-user-id="currentUserId" />
      </div>

      <div v-else class="text-center py-16">
        <p class="text-foreground-muted">Projet non trouvé</p>
        <NuxtLink
          :to="{ path: '/qg', query: { tab: 'projects' } }"
          class="inline-block mt-4 text-primary hover:underline"
        >
          Retour aux Side Projects
        </NuxtLink>
      </div>
    </div>

    <ConfirmDialog
      :open="showDeleteDialog"
      title="Supprimer le projet"
      message="Cette action est irréversible."
      confirm-label="Supprimer"
      variant="danger"
      :loading="isDeleting"
      @confirm="deleteProject"
      @cancel="showDeleteDialog = false"
    />
  </div>
</template>
