<script setup lang="ts">
import { QG_FROZEN } from '#shared/utils/qg'
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
    slug: string
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

const projectUrl = `/api/side-projects/${projectId}`
const { data: project, status: projectStatus, refresh } = useLazyFetch<SideProject>(projectUrl)
const { data: currentUser } = useLazyFetch<{ id: number } | null>('/api/developers/me', {
  default: () => null
})

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
    await $fetch(projectUrl, {
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
    await $fetch(projectUrl, { method: 'DELETE' })
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
        :to="{ path: '/qg', query: { tab: 'opportunites' } }"
        class="inline-flex items-center gap-2 text-foreground-muted/60 hover:text-foreground transition-colors mb-10 text-xs uppercase tracking-widest font-medium"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Side Projects
      </NuxtLink>

      <div v-if="projectStatus === 'pending'" class="animate-pulse space-y-4">
        <div class="h-8 bg-border/10 rounded w-2/3"></div>
        <div class="h-4 bg-border/10 rounded w-1/3"></div>
        <div class="h-24 bg-border/10 rounded w-full mt-6"></div>
      </div>

      <div v-else-if="project">
        <div class="mb-8">
          <span :class="['inline-block px-2.5 py-1 rounded-full text-[11px] font-medium mb-3', statusColors[project.status]]">
            {{ statusLabels[project.status] }}
          </span>
          <h1 class="font-display text-2xl md:text-3xl font-bold leading-tight mb-4">{{ project.title }}</h1>
          <div v-if="safeHref(project.repoUrl) || safeHref(project.websiteUrl)" class="flex items-center gap-2">
            <a
              v-if="safeHref(project.repoUrl)"
              :href="safeHref(project.repoUrl)"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 px-4 py-2 border border-border/20 rounded-full text-sm text-foreground-muted hover:text-foreground hover:border-foreground-muted transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Repo
            </a>
            <a
              v-if="safeHref(project.websiteUrl)"
              :href="safeHref(project.websiteUrl)"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 px-4 py-2 border border-border/20 rounded-full text-sm text-foreground-muted hover:text-foreground hover:border-foreground-muted transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              Site
            </a>
          </div>
        </div>

        <NuxtLink
          :to="`/directory/${project.developer.slug}`"
          class="flex items-center gap-3 mb-8 group"
        >
          <img
            v-if="project.developer.avatarUrl"
            :src="project.developer.avatarUrl"
            :alt="project.developer.name"
            class="w-10 h-10 rounded-full object-cover ring-2 ring-border/20"
          />
          <div v-else class="w-10 h-10 rounded-full bg-foreground/[0.05] flex items-center justify-center ring-2 ring-border/20">
            <span class="text-sm text-foreground-muted">{{ project.developer.name?.charAt(0) || '?' }}</span>
          </div>
          <div>
            <span class="text-sm font-bold group-hover:text-primary transition-colors">{{ project.developer.name }}</span>
            <p class="text-xs text-foreground-muted/50">{{ formatDate(project.createdAt) }}</p>
          </div>
        </NuxtLink>

        <div class="mb-8">
          <p class="text-foreground-muted leading-relaxed whitespace-pre-wrap">{{ project.description }}</p>
        </div>

        <div v-if="project.techs?.length" class="mb-8">
          <h2 class="text-sm font-display font-bold uppercase tracking-wide mb-3">Stack technique</h2>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="tech in project.techs"
              :key="tech"
              class="px-2.5 py-1 bg-foreground/[0.04] rounded-full text-sm text-foreground-muted"
            >
              {{ tech }}
            </span>
          </div>
        </div>

        <div v-if="isOwner" class="flex items-center gap-3 pt-6 border-t-2 border-border/15 mb-8">
          <NuxtLink
            v-if="!QG_FROZEN"
            :to="`/qg/projects/${projectId}/edit`"
            class="px-4 py-2 text-sm font-medium border border-border/20 rounded-full hover:border-foreground-muted hover:text-foreground transition-colors text-foreground-muted"
          >
            Modifier
          </NuxtLink>
          <button
            v-if="project.status !== 'completed'"
            @click="markAsCompleted"
            class="px-4 py-2 text-sm font-medium border border-border/20 rounded-full hover:border-primary hover:text-primary transition-colors text-foreground-muted"
          >
            Marquer terminé
          </button>
          <button
            @click="showDeleteDialog = true"
            class="px-4 py-2 text-sm font-medium border border-border/20 rounded-full hover:border-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors text-foreground-muted ml-auto"
          >
            Supprimer
          </button>
        </div>

        <QgComments :side-project-id="Number(projectId)" :current-user-id="currentUserId" :is-owner="isOwner" />
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
