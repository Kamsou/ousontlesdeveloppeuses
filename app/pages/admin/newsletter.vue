<script setup lang="ts">
definePageMeta({
  middleware: 'sidebase-auth'
})

useSeoMeta({
  title: 'Newsletter - Admin',
  robots: 'noindex'
})

const { data: session } = useAuth()
const { preference: themePreference, cycle: cycleTheme } = useQgTheme()
const themeLabel = computed(() => {
  if (themePreference.value === 'system') return 'Thème système'
  if (themePreference.value === 'light') return 'Thème clair'
  return 'Thème sombre'
})

interface Subscriber {
  id: number
  name: string | null
  email: string | null
  emailOptInDate: string | null
}

const { data: subscribers, status } = await useFetch<Subscriber[]>('/api/admin/newsletter')

const copied = ref(false)

async function copyEmails() {
  if (!subscribers.value) return
  const emails = subscribers.value
    .map(s => s.email)
    .filter(Boolean)
    .join(', ')
  await navigator.clipboard.writeText(emails)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

function formatDate(date: string | null) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <header class="sticky top-0 z-50 px-4 md:px-8 py-3 backdrop-blur-xl bg-background/80 border-b border-border/20">
      <div class="max-w-3xl mx-auto flex items-center justify-between">
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

    <div class="max-w-3xl mx-auto px-6 py-8">
      <div class="flex flex-wrap gap-3 mb-8">
        <NuxtLink to="/admin" class="px-4 py-2 border border-border/10 rounded-lg text-sm font-medium hover:border-foreground-muted transition-colors no-underline">
          Développeuses
        </NuxtLink>
        <NuxtLink to="/admin/programs" class="px-4 py-2 border border-border/10 rounded-lg text-sm font-medium hover:border-foreground-muted transition-colors no-underline">
          Programmes
        </NuxtLink>
        <NuxtLink to="/admin/podcasts" class="px-4 py-2 border border-border/10 rounded-lg text-sm font-medium hover:border-foreground-muted transition-colors no-underline">
          Podcasts
        </NuxtLink>
        <NuxtLink to="/admin/stats" class="px-4 py-2 border border-border/10 rounded-lg text-sm font-medium hover:border-foreground-muted transition-colors no-underline">
          Stats
        </NuxtLink>
        <NuxtLink to="/admin/newsletter" class="px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium no-underline">
          Newsletter
        </NuxtLink>
      </div>

      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 class="font-display text-2xl font-medium tracking-tight">Newsletter</h2>
          <p class="text-foreground-muted text-sm mt-1">{{ subscribers?.length || 0 }} inscrit{{ (subscribers?.length || 0) > 1 ? 's' : '' }}</p>
        </div>
        <button
          v-if="subscribers?.length"
          @click="copyEmails"
          class="px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground-muted transition-colors flex items-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          {{ copied ? 'Copié !' : 'Copier les e-mails' }}
        </button>
      </div>

      <div v-if="status === 'pending'" class="flex justify-center py-20">
        <div class="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin"></div>
      </div>

      <div v-else-if="!subscribers?.length" class="text-center py-12 text-foreground-muted border border-border/10 rounded-2xl">
        Aucun inscrit à la newsletter
      </div>

      <div v-else class="border border-border/10 rounded-xl overflow-hidden">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border/10 bg-border/5">
              <th class="text-left py-3 px-4 text-xs uppercase tracking-widest text-foreground-muted font-medium">Nom</th>
              <th class="text-left py-3 px-4 text-xs uppercase tracking-widest text-foreground-muted font-medium">E-mail</th>
              <th class="text-right py-3 px-4 text-xs uppercase tracking-widest text-foreground-muted font-medium">Inscrit le</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sub in subscribers" :key="sub.id" class="border-b border-border/5 last:border-b-0 hover:bg-border/5 transition-colors">
              <td class="py-3 px-4 text-sm">{{ sub.name || '-' }}</td>
              <td class="py-3 px-4 text-sm text-foreground-muted">{{ sub.email }}</td>
              <td class="py-3 px-4 text-sm text-foreground-muted text-right">{{ formatDate(sub.emailOptInDate) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
