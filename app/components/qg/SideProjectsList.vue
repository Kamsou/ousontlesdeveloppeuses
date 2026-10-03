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
    <h2 class="text-base font-display font-bold uppercase tracking-wide mb-6">Side projects</h2>

    <div v-if="isLoading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="p-5 border-2 border-border/15 rounded-2xl animate-pulse">
        <div class="flex items-center gap-2 mb-3">
          <div class="h-4 bg-border/10 rounded w-32"></div>
          <div class="h-4 bg-border/10 rounded w-20"></div>
        </div>
        <div class="h-3 bg-border/10 rounded w-2/3 mb-3"></div>
        <div class="flex gap-1.5">
          <div class="h-5 bg-border/10 rounded w-14"></div>
          <div class="h-5 bg-border/10 rounded w-16"></div>
        </div>
      </div>
    </div>

    <div v-else-if="!projects?.length" class="py-16 text-center">
      <p class="text-foreground-muted text-sm">Aucun side project pour le moment</p>
    </div>

    <div v-else class="space-y-4">
      <NuxtLink
        v-for="project in projects"
        :key="project.id"
        :to="`/qg/projects/${project.id}`"
        :class="['block p-5 border-2 border-border/15 rounded-2xl hover:border-primary/40 transition-all group', project.status === 'completed' && 'opacity-40']"
      >
        <div class="flex items-center justify-between gap-3 mb-2">
          <div class="flex items-center gap-2.5 min-w-0">
            <img
              v-if="project.developer.avatarUrl"
              :src="optimizedAvatar(project.developer.avatarUrl, 72)"
              :alt="project.developer.name"
              class="w-6 h-6 rounded-full object-cover shrink-0"
            />
            <div v-else class="w-6 h-6 rounded-full bg-foreground/[0.05] flex items-center justify-center shrink-0">
              <span class="text-[9px] font-medium text-foreground-muted">{{ project.developer.name?.charAt(0) || '?' }}</span>
            </div>
            <span class="text-xs text-foreground-muted truncate">{{ project.developer.name }}</span>
          </div>
          <span :class="['px-2 py-0.5 rounded text-[11px] shrink-0', statusColors[project.status]]">
            {{ statusLabels[project.status] }}
          </span>
        </div>

        <h3 class="text-[15px] font-medium text-foreground group-hover:text-primary transition-colors leading-snug mb-1.5">
          {{ project.title }}
        </h3>
        <p class="text-xs text-foreground-muted line-clamp-2 mb-3">{{ project.description }}</p>

        <div class="flex items-center gap-2 flex-wrap">
          <template v-if="project.techs.length">
            <span
              v-for="tech in project.techs.slice(0, 3)"
              :key="tech"
              class="px-2 py-0.5 bg-foreground/[0.04] rounded text-[11px] text-foreground-muted"
            >
              {{ tech }}
            </span>
            <span v-if="project.techs.length > 3" class="text-[11px] text-foreground-muted">
              +{{ project.techs.length - 3 }}
            </span>
          </template>
          <div class="flex items-center gap-2 ml-auto text-[11px] text-foreground-muted">
            <span v-if="project.commentsCount > 0" class="flex items-center gap-1">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              {{ project.commentsCount }}
            </span>
            <span v-if="project.repoUrl">repo</span>
            <span v-if="project.websiteUrl">site</span>
          </div>
        </div>
      </NuxtLink>
    </div>
  </section>
</template>
