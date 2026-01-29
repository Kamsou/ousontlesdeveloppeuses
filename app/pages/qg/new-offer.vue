<script setup lang="ts">
definePageMeta({
  middleware: 'sidebase-auth'
})

useSeoMeta({
  title: 'Poster une offre',
  robots: 'noindex'
})

const router = useRouter()
const toast = useToast()

const { data: activity } = await useFetch<{ profileComplete?: boolean }>('/api/qg/activity')
if (activity.value?.profileComplete === false) {
  await navigateTo('/qg?tab=profil')
}

const form = ref({
  title: '',
  description: '',
  url: '',
  type: 'alternance' as string,
  location: ''
})

const saving = ref(false)
const error = ref('')

const typeOptions = [
  { value: 'alternance', label: 'Alternance', description: 'Contrat d\'alternance' },
  { value: 'stage', label: 'Stage', description: 'Stage conventionné' },
  { value: 'cdi', label: 'CDI', description: 'Contrat à durée indéterminée' },
  { value: 'freelance', label: 'Freelance', description: 'Mission freelance' },
  { value: 'other', label: 'Autre', description: 'Autre type d\'offre' }
]

const canSubmit = computed(() => form.value.title.trim().length > 0)

async function submit() {
  if (!form.value.title.trim()) {
    error.value = 'Le titre est requis'
    return
  }

  saving.value = true
  error.value = ''

  try {
    await $fetch('/api/offers', {
      method: 'POST',
      body: {
        title: form.value.title,
        description: form.value.description || null,
        url: form.value.url || null,
        type: form.value.type,
        location: form.value.location || null
      }
    })

    toast.success('Offre publiée')
    router.push('/qg?tab=offres')
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
      <NuxtLink to="/qg?tab=offres" class="inline-flex items-center gap-2 text-foreground-muted hover:text-foreground transition-colors mb-8">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Offres
      </NuxtLink>

      <h1 class="font-display text-3xl md:text-4xl font-medium mb-3">
        Poster une offre
      </h1>
      <p class="text-foreground-muted text-lg mb-10">
        Partage une offre avec la communauté.
      </p>

      <form @submit.prevent="submit" class="space-y-8">
        <div v-if="error" class="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
          {{ error }}
        </div>

        <div class="space-y-2">
          <label for="title" class="block text-sm text-foreground-muted">
            Titre de l'offre *
          </label>
          <input
            id="title"
            v-model="form.title"
            type="text"
            placeholder="Ex: Alternance développeuse Svelte - Paris"
            class="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:border-foreground-muted transition-colors"
          />
        </div>

        <div class="space-y-3">
          <label class="block text-sm text-foreground-muted">
            Type d'offre
          </label>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <button
              v-for="opt in typeOptions"
              :key="opt.value"
              type="button"
              @click="form.type = opt.value"
              :class="[
                'p-4 border rounded-xl text-left transition-all',
                form.type === opt.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-foreground-muted'
              ]"
            >
              <span class="block font-medium text-sm">{{ opt.label }}</span>
              <span class="block text-xs text-foreground-muted mt-1">{{ opt.description }}</span>
            </button>
          </div>
        </div>

        <div class="space-y-2">
          <label for="location" class="block text-sm text-foreground-muted">
            Localisation (optionnel)
          </label>
          <input
            id="location"
            v-model="form.location"
            type="text"
            placeholder="Ex: Paris, Remote, Lyon..."
            class="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:border-foreground-muted transition-colors"
          />
        </div>

        <div class="space-y-2">
          <label for="description" class="block text-sm text-foreground-muted">
            Description (optionnel)
          </label>
          <textarea
            id="description"
            v-model="form.description"
            rows="3"
            placeholder="Quelques détails sur l'offre..."
            class="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:border-foreground-muted transition-colors resize-none"
          />
        </div>

        <div class="space-y-2">
          <label for="url" class="block text-sm text-foreground-muted">
            Lien vers l'offre (optionnel)
          </label>
          <input
            id="url"
            v-model="form.url"
            type="url"
            placeholder="https://..."
            class="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:border-foreground-muted transition-colors"
          />
        </div>

        <div class="pt-4 space-y-3">
          <button
            type="submit"
            :disabled="saving || !canSubmit"
            class="w-full px-8 py-4 bg-foreground text-background rounded-full font-medium transition-all hover:bg-foreground-muted disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ saving ? 'Publication...' : 'Publier l\'offre' }}
          </button>
          <p class="text-center text-xs text-foreground-muted">
            L'offre sera visible avec un badge "non vérifié" jusqu'à validation par l'équipe.
          </p>
        </div>
      </form>
    </div>
  </div>
</template>
