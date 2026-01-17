<script setup lang="ts">
definePageMeta({
  middleware: 'sidebase-auth'
})

useSeoMeta({
  title: 'Demander de l\'aide',
  robots: 'noindex'
})

const router = useRouter()

const { data: activity } = await useFetch<{ profileComplete?: boolean }>('/api/qg/activity')
if (activity.value?.profileComplete === false) {
  await navigateTo('/qg?tab=profil')
}

const form = ref({
  title: '',
  description: '',
  helpType: 'bug' as 'bug' | 'review' | 'advice' | 'pair' | 'other',
  techs: [] as string[]
})

const techInput = ref('')
const saving = ref(false)
const error = ref('')

const canSubmit = computed(() => form.value.title.trim().length > 0)

const helpTypes = [
  { value: 'bug', label: 'Bug', description: 'Un truc qui marche pas' },
  { value: 'review', label: 'Review', description: 'Relire mon code' },
  { value: 'advice', label: 'Conseil', description: 'Avis sur une approche' },
  { value: 'pair', label: 'Pair', description: 'Coder ensemble' },
  { value: 'other', label: 'Autre', description: 'Autre chose' }
]

function addTech() {
  const tech = techInput.value.trim()
  if (tech && !form.value.techs.includes(tech)) {
    form.value.techs.push(tech)
    techInput.value = ''
  }
}

function removeTech(tech: string) {
  form.value.techs = form.value.techs.filter(t => t !== tech)
}

function handleTechKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault()
    addTech()
  }
}

async function submit() {
  if (!form.value.title.trim()) {
    error.value = 'Dis-nous sur quoi tu bloques'
    return
  }

  saving.value = true
  error.value = ''

  try {
    const result = await $fetch('/api/help-requests', {
      method: 'POST',
      body: {
        title: form.value.title,
        description: form.value.description,
        helpType: form.value.helpType,
        techs: form.value.techs
      }
    })

    router.push(`/qg/requests/${result.id}`)
  } catch (e: any) {
    error.value = e.data?.message || 'Erreur lors de la création'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <div class="max-w-2xl mx-auto px-6 py-16">
      <NuxtLink to="/qg" class="inline-flex items-center gap-2 text-foreground-muted hover:text-foreground transition-colors mb-8">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Mon QG
      </NuxtLink>

      <h1 class="font-display text-3xl md:text-4xl font-medium mb-3">
        Bloquée sur un truc ?
      </h1>
      <p class="text-foreground-muted text-lg mb-10">
        Décris ton besoin et on trouvera quelqu'un pour t'aider.
      </p>

      <form @submit.prevent="submit" class="space-y-8">
        <div v-if="error" class="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
          {{ error }}
        </div>

        <div class="space-y-2">
          <label for="title" class="block text-sm text-foreground-muted">
            C'est quoi le problème ? *
          </label>
          <input
            id="title"
            v-model="form.title"
            type="text"
            placeholder="Ex: Bug TypeScript avec les generics"
            class="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:border-foreground-muted transition-colors"
          />
        </div>

        <div class="space-y-2">
          <label for="description" class="block text-sm text-foreground-muted">
            Plus de contexte (optionnel)
          </label>
          <textarea
            id="description"
            v-model="form.description"
            rows="4"
            placeholder="Décris un peu plus le contexte, ce que t'as déjà essayé..."
            class="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:border-foreground-muted transition-colors resize-none"
          />
        </div>

        <div class="space-y-3">
          <label class="block text-sm text-foreground-muted">
            Type d'aide
          </label>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <button
              v-for="type in helpTypes"
              :key="type.value"
              type="button"
              @click="form.helpType = type.value as typeof form.helpType"
              :class="[
                'p-4 border rounded-xl text-left transition-all',
                form.helpType === type.value
                  ? 'border-foreground bg-white/5'
                  : 'border-border hover:border-foreground-muted'
              ]"
            >
              <span class="block font-medium text-sm">{{ type.label }}</span>
              <span class="block text-xs text-foreground-muted mt-1">{{ type.description }}</span>
            </button>
          </div>
        </div>

        <div class="space-y-3">
          <label for="techs" class="block text-sm text-foreground-muted">
            Technologies concernées
          </label>
          <div class="flex gap-2">
            <input
              id="techs"
              v-model="techInput"
              type="text"
              placeholder="Ex: Vue, TypeScript, Node..."
              @keydown="handleTechKeydown"
              class="flex-1 px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:border-foreground-muted transition-colors"
            />
            <button
              type="button"
              @click="addTech"
              class="px-4 py-3 border border-border rounded-lg text-foreground-muted hover:text-foreground hover:border-foreground-muted transition-colors"
            >
              Ajouter
            </button>
          </div>
          <div v-if="form.techs.length" class="flex flex-wrap gap-2">
            <span
              v-for="tech in form.techs"
              :key="tech"
              class="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-border rounded-full text-sm"
            >
              {{ tech }}
              <button type="button" @click="removeTech(tech)" class="text-foreground-muted hover:text-foreground">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </span>
          </div>
        </div>

        <div class="pt-4 space-y-3">
          <button
            type="submit"
            :disabled="saving || !canSubmit"
            class="w-full px-8 py-4 bg-foreground text-background rounded-full font-medium transition-all hover:bg-foreground-muted disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ saving ? 'Création...' : 'Trouver de l\'aide' }}
          </button>
          <ClientOnly>
            <p v-if="!canSubmit" class="text-center text-sm text-foreground-muted">
              Remplis le champ "C'est quoi le problème ?" pour continuer
            </p>
          </ClientOnly>
        </div>
      </form>
    </div>
  </div>
</template>
