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
  commentsCount: number
}

const { data: projects, status } = useLazyFetch<SideProject[]>('/api/side-projects')
const isLoading = computed(() => status.value === 'pending')
</script>

<template>
  <section>
    <h2 class="text-lg font-display font-medium mb-6">Side projects de la communauté</h2>

    <div v-if="isLoading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="p-4 border border-border/20 rounded-xl animate-pulse">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-8 h-8 bg-border/20 rounded-full"></div>
          <div class="h-4 bg-border/20 rounded w-24"></div>
        </div>
        <div class="h-4 bg-border/20 rounded w-3/4 mb-2"></div>
        <div class="h-3 bg-border/20 rounded w-1/2"></div>
      </div>
    </div>

    <div v-else-if="!projects?.length" class="py-12 text-center border border-dashed border-border/20 rounded-xl">
      <p class="text-foreground-muted text-sm">Aucun side project pour le moment</p>
      <p class="text-foreground-muted text-xs mt-1">Sois la première à proposer le tien !</p>
    </div>

    <div v-else class="space-y-4">
      <NuxtLink
        v-for="project in projects"
        :key="project.id"
        :to="`/qg/projects/${project.id}`"
        class="block p-4 border border-border/20 rounded-xl hover:border-border/40 transition-colors"
      >
        <div class="flex items-center justify-between gap-3 mb-3">
          <div class="flex items-center gap-3 min-w-0">
            <img
              v-if="project.developer.avatarUrl"
              :src="project.developer.avatarUrl"
              :alt="project.developer.name"
              class="w-8 h-8 rounded-full object-cover"
            />
            <div v-else class="w-8 h-8 rounded-full bg-border/30 flex items-center justify-center">
              <span class="text-xs text-foreground-muted">{{ project.developer.name?.charAt(0) || '?' }}</span>
            </div>
            <span class="text-sm text-foreground-muted truncate">{{ project.developer.name }}</span>
          </div>
          <span :class="['px-2 py-0.5 rounded text-xs', statusColors[project.status]]">
            {{ statusLabels[project.status] }}
          </span>
        </div>

        <p class="text-sm font-medium text-foreground mb-2">{{ project.title }}</p>
        <p class="text-xs text-foreground-muted mb-3 line-clamp-2">{{ project.description }}</p>

        <div class="flex items-center justify-between gap-4">
          <div v-if="project.techs.length" class="flex flex-wrap gap-1.5 min-w-0">
            <span
              v-for="tech in project.techs.slice(0, 4)"
              :key="tech"
              class="px-2 py-0.5 bg-white/5 rounded text-xs text-foreground-muted"
            >
              {{ tech }}
            </span>
            <span v-if="project.techs.length > 4" class="text-xs text-foreground-muted/40">
              +{{ project.techs.length - 4 }}
            </span>
          </div>
          <div class="flex items-center gap-3 shrink-0">
            <span
              v-if="project.commentsCount > 0"
              class="flex items-center gap-1 text-xs text-foreground-muted/60"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              {{ project.commentsCount }}
            </span>
            <span
              v-if="project.repoUrl"
              class="flex items-center gap-1.5 text-xs text-foreground-muted"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Repo
            </span>
            <span
              v-if="project.websiteUrl"
              class="flex items-center gap-1.5 text-xs text-foreground-muted"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              Site
            </span>
          </div>
        </div>
      </NuxtLink>
    </div>
  </section>
</template>
