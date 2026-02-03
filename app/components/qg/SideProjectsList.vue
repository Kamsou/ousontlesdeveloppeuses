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

    <div v-if="isLoading" class="divide-y divide-border/10">
      <div v-for="i in 3" :key="i" class="px-4 py-4 animate-pulse">
        <div class="flex items-center gap-2 mb-1.5">
          <div class="h-4 bg-border/20 rounded w-32"></div>
          <div class="h-4 bg-border/20 rounded w-20"></div>
        </div>
        <div class="h-3 bg-border/20 rounded w-2/3 mb-3"></div>
        <div class="flex gap-1.5 mb-3">
          <div class="h-5 bg-border/20 rounded w-14"></div>
          <div class="h-5 bg-border/20 rounded w-16"></div>
          <div class="h-3 bg-border/20 rounded w-20 self-center"></div>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 bg-border/20 rounded-full"></div>
          <div class="h-3 bg-border/20 rounded w-20"></div>
        </div>
      </div>
    </div>

    <div v-else-if="!projects?.length" class="py-12 text-center border border-dashed border-border/20 rounded-xl">
      <p class="text-foreground-muted text-sm">Aucun side project pour le moment</p>
      <p class="text-foreground-muted text-xs mt-1">Sois la première à proposer le tien !</p>
    </div>

    <div v-else class="divide-y divide-border/10">
      <NuxtLink
        v-for="project in projects"
        :key="project.id"
        :to="`/qg/projects/${project.id}`"
        class="block px-4 py-4 -mx-4 rounded-lg hover:bg-foreground/[0.03] transition-colors group"
      >
        <div class="flex items-center gap-2 mb-1.5">
          <span class="text-sm font-medium text-foreground group-hover:text-foreground-muted transition-colors truncate">
            {{ project.title }}
          </span>
          <span :class="['px-2 py-0.5 rounded text-[11px] shrink-0', statusColors[project.status]]">
            {{ statusLabels[project.status] }}
          </span>
        </div>

        <p class="text-xs text-foreground-muted truncate mb-3">{{ project.description }}</p>

        <div class="flex items-center gap-1.5 flex-wrap mb-3">
          <template v-if="project.techs.length">
            <span
              v-for="tech in project.techs.slice(0, 3)"
              :key="tech"
              class="px-2 py-0.5 bg-subtle rounded text-xs text-foreground-muted"
            >
              {{ tech }}
            </span>
            <span v-if="project.techs.length > 3" class="text-xs text-foreground-muted/40">
              +{{ project.techs.length - 3 }}
            </span>
          </template>
          <span v-if="project.commentsCount > 0" class="text-xs text-foreground-muted/50">
            <span v-if="project.techs.length" class="mr-1">·</span>
            {{ project.commentsCount }} comment{{ project.commentsCount > 1 ? 's' : '' }}
          </span>
          <span v-if="project.repoUrl" class="text-xs text-foreground-muted/50">
            · repo
          </span>
          <span v-if="project.websiteUrl" class="text-xs text-foreground-muted/50">
            · site
          </span>
        </div>

        <div class="flex items-center gap-2">
          <img
            v-if="project.developer.avatarUrl"
            :src="project.developer.avatarUrl"
            :alt="project.developer.name"
            class="w-4 h-4 rounded-full object-cover"
          />
          <div v-else class="w-4 h-4 rounded-full bg-border/30 flex items-center justify-center">
            <span class="text-[9px] text-foreground-muted">{{ project.developer.name?.charAt(0) || '?' }}</span>
          </div>
          <span class="text-xs text-foreground-muted/50">{{ project.developer.name }}</span>
        </div>
      </NuxtLink>
    </div>
  </section>
</template>
