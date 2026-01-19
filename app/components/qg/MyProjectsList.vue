<script setup lang="ts">
import { statusLabels, statusColors, type SideProjectStatus } from '~/utils/sideProjectStatus'

interface SideProject {
  id: number
  title: string
  status: SideProjectStatus
  techs: string[]
  commentsCount: number
}

const props = defineProps<{
  projects: SideProject[]
  isLoading: boolean
}>()

const emit = defineEmits<{
  'mark-completed': [projectId: number]
}>()

const updatingId = ref<number | null>(null)
const showCompleted = ref(false)

const activeProjects = computed(() =>
  props.projects.filter(p => p.status !== 'completed')
)

const completedProjects = computed(() =>
  props.projects.filter(p => p.status === 'completed')
)

async function markAsCompleted(projectId: number, e: Event) {
  e.preventDefault()
  e.stopPropagation()
  updatingId.value = projectId
  emit('mark-completed', projectId)
  updatingId.value = null
}
</script>

<template>
  <section class="mb-16">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-display font-medium">Tes side projects</h2>
      <span v-if="activeProjects.length > 0" class="flex items-center gap-2 px-2.5 py-1 bg-green-500/10 rounded-full">
        <span class="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
        <span class="text-xs text-green-400">{{ activeProjects.length }} actif{{ activeProjects.length > 1 ? 's' : '' }}</span>
      </span>
    </div>

    <div v-if="isLoading" class="space-y-3">
      <div v-for="i in 2" :key="i" class="p-4 border border-border/30 rounded-xl animate-pulse">
        <div class="h-4 bg-border/20 rounded w-1/2 mb-2"></div>
        <div class="h-3 bg-border/20 rounded w-1/4"></div>
      </div>
    </div>

    <div v-else-if="projects.length === 0" class="py-10 text-center border border-dashed border-border/30 rounded-xl">
      <p class="text-foreground-muted text-sm mb-1">Tu n'as pas encore de side project</p>
      <p class="text-foreground-muted text-xs">Propose le tien pour trouver des contributrices</p>
    </div>

    <div v-else class="space-y-2">
      <NuxtLink
        v-for="project in activeProjects"
        :key="project.id"
        :to="`/qg/projects/${project.id}`"
        class="flex items-center gap-4 p-4 border border-border/30 rounded-xl hover:border-border/60 hover:bg-white/[0.02] transition-all group"
      >
        <span :class="['px-2 py-0.5 rounded text-xs shrink-0', statusColors[project.status]]">
          {{ statusLabels[project.status] }}
        </span>
        <div class="min-w-0 flex-1">
          <span class="text-sm font-medium text-foreground group-hover:text-foreground-muted transition-colors truncate block">
            {{ project.title }}
          </span>
          <div v-if="project.techs?.length" class="flex items-center gap-1.5 mt-1.5">
            <span
              v-for="tech in project.techs.slice(0, 3)"
              :key="tech"
              class="px-2 py-0.5 bg-white/5 rounded text-xs text-foreground-muted"
            >
              {{ tech }}
            </span>
            <span v-if="project.techs.length > 3" class="text-xs text-foreground-muted">
              +{{ project.techs.length - 3 }}
            </span>
          </div>
          <span
            v-if="project.commentsCount > 0"
            class="flex items-center gap-1 text-xs text-foreground-muted ml-auto"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {{ project.commentsCount }}
          </span>
        </div>
        <button
          @click="markAsCompleted(project.id, $event)"
          :disabled="updatingId === project.id"
          class="p-2 text-foreground-muted/30 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-all disabled:opacity-50"
          title="Marquer terminé"
        >
          <span v-if="updatingId === project.id" class="block w-4 h-4 border-2 border-foreground-muted/40 border-t-transparent rounded-full animate-spin"></span>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </button>
      </NuxtLink>

      <NuxtLink
        v-for="project in completedProjects.slice(0, showCompleted ? undefined : 0)"
        :key="project.id"
        :to="`/qg/projects/${project.id}`"
        class="flex items-center gap-4 p-4 rounded-xl hover:bg-white/[0.02] transition-all group"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-green-500/50 shrink-0">
          <path d="M20 6L9 17l-5-5" />
        </svg>
        <span class="text-sm text-foreground-muted/60 group-hover:text-foreground-muted transition-colors truncate">
          {{ project.title }}
        </span>
      </NuxtLink>

      <button
        v-if="completedProjects.length > 0"
        @click="showCompleted = !showCompleted"
        class="flex items-center gap-2 px-4 py-2 text-foreground-muted/50 hover:text-foreground-muted transition-colors text-xs"
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          :class="['transition-transform', showCompleted ? 'rotate-180' : '']"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
        {{ showCompleted ? 'Masquer' : `Voir ${completedProjects.length} terminé${completedProjects.length > 1 ? 's' : ''}` }}
      </button>
    </div>
  </section>
</template>
