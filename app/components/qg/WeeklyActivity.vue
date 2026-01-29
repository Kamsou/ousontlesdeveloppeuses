<script setup lang="ts">
interface UnreadComment {
  type: 'project' | 'request'
  id: number
  title: string
  count: number
}

interface Activity {
  isNew: boolean
  weeklyContactsReceived?: number
  weeklyContactsSent?: number
  unreadComments?: UnreadComment[]
  totalHelpGiven?: number
  profileComplete?: boolean
  communityNewMembers?: number
  communityHelpRequests?: number
  communityNewProjects?: number
}

defineProps<{
  activity: Activity
}>()

const emit = defineEmits<{
  'go-to-profile': []
}>()
</script>

<template>
  <section>
    <h2 class="text-sm font-medium text-foreground-muted mb-3">Cette semaine</h2>
    <div class="flex flex-wrap gap-2">
      <div v-if="activity.weeklyContactsReceived && activity.weeklyContactsReceived > 0" class="flex items-center gap-2 px-3 py-1.5 bg-primary/5 border border-primary/10 rounded-full">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-primary">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span class="text-xs text-foreground">
          <span class="font-medium">{{ activity.weeklyContactsReceived }}</span>
          {{ activity.weeklyContactsReceived === 1 ? 'message recu' : 'messages recus' }}
        </span>
      </div>

      <div v-if="activity.weeklyContactsSent && activity.weeklyContactsSent > 0" class="flex items-center gap-2 px-3 py-1.5 bg-green-500/5 border border-green-500/10 rounded-full">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-green-400">
          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
        </svg>
        <span class="text-xs text-foreground">
          <span class="font-medium">{{ activity.weeklyContactsSent }}</span>
          {{ activity.weeklyContactsSent === 1 ? 'message envoye' : 'messages envoyes' }}
        </span>
      </div>

      <NuxtLink
        v-for="comment in activity.unreadComments"
        :key="`${comment.type}-${comment.id}`"
        :to="comment.type === 'project' ? `/qg/projects/${comment.id}` : `/qg/requests/${comment.id}`"
        class="flex items-center gap-2 px-3 py-1.5 bg-primary/5 border border-primary/10 rounded-full no-underline hover:bg-primary/10 transition-colors"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-primary shrink-0">
          <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
        </svg>
        <span class="text-xs text-foreground">
          <span class="font-medium">{{ comment.count }}</span>
          {{ comment.count === 1 ? 'commentaire' : 'commentaires' }} sur {{ comment.title }}
        </span>
      </NuxtLink>

      <div v-if="activity.profileComplete === false" class="flex items-center gap-2 px-3 py-1.5 bg-amber-500/5 border border-amber-500/10 rounded-full">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-amber-400">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <button @click="emit('go-to-profile')" class="text-xs text-foreground hover:text-amber-400 transition-colors">
          Profil incomplet
        </button>
      </div>

      <div v-if="activity.profileComplete" class="flex items-center gap-2 px-3 py-1.5 bg-green-500/5 border border-green-500/10 rounded-full">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-green-400">
          <path d="M20 6L9 17l-5-5" />
        </svg>
        <span class="text-xs text-foreground-muted">Profil complet</span>
      </div>

      <div v-if="activity.communityNewMembers && activity.communityNewMembers > 0" class="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-border/20 rounded-full">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-foreground-muted">
          <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <line x1="19" y1="8" x2="19" y2="14" />
          <line x1="22" y1="11" x2="16" y2="11" />
        </svg>
        <span class="text-xs text-foreground-muted">
          <span class="font-medium text-foreground">{{ activity.communityNewMembers }}</span>
          {{ activity.communityNewMembers === 1 ? 'nouvelle inscrite' : 'nouvelles inscrites' }}
        </span>
      </div>

      <div v-if="activity.communityHelpRequests && activity.communityHelpRequests > 0" class="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-border/20 rounded-full">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-foreground-muted">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <span class="text-xs text-foreground-muted">
          <span class="font-medium text-foreground">{{ activity.communityHelpRequests }}</span>
          {{ activity.communityHelpRequests === 1 ? 'demande d\'aide' : 'demandes d\'aide' }}
        </span>
      </div>

      <div v-if="activity.communityNewProjects && activity.communityNewProjects > 0" class="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-border/20 rounded-full">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-foreground-muted">
          <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
        <span class="text-xs text-foreground-muted">
          <span class="font-medium text-foreground">{{ activity.communityNewProjects }}</span>
          {{ activity.communityNewProjects === 1 ? 'nouveau projet' : 'nouveaux projets' }}
        </span>
      </div>
    </div>

    <p v-if="activity.totalHelpGiven && activity.totalHelpGiven > 0" class="text-xs text-foreground-muted/50 mt-3">
      Tu as propose ton aide {{ activity.totalHelpGiven }} fois au total
    </p>
  </section>
</template>
