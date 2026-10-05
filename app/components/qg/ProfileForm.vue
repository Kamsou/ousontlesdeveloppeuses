<script setup lang="ts">
import { quizProfileTypes } from '#shared/utils/quiz'
import type { QgProfile } from '~/types/qg'

const props = defineProps<{
  profile: QgProfile
}>()

const emit = defineEmits<{
  saved: []
}>()

const { $clientPosthog } = useNuxtApp()
const { data: session, signOut } = useAuth()
const toast = useToast()
const profileForm = useProfileForm(toRef(props, 'profile'), computed(() => session.value?.user))
provide(profileFormKey, profileForm)
const { validateAndFocus, save, saving, serverError } = profileForm

const deleting = ref(false)

const hasQuizProfile = computed(() => !!props.profile.profileType && !!props.profile.profilePhrase && quizProfileTypes.includes(props.profile.profileType))

async function submit() {
  if (!validateAndFocus(PROFILE_STEPS.flatMap(step => step.fields))) return
  const result = await save()
  if (!result) {
    toast.error(serverError.value)
    return
  }
  toast.success('Profil mis à jour')
  emit('saved')
}

async function deleteProfile() {
  if (!confirm('Supprimer définitivement ton profil de l\'annuaire ? Cette action est irréversible.')) return

  deleting.value = true
  try {
    await $fetch('/api/developers/me', { method: 'DELETE' })
    $clientPosthog?.capture('profile_deleted')
    await signOut({ callbackUrl: '/' })
  } catch (e: any) {
    toast.error(e.data?.message || 'Erreur lors de la suppression')
    deleting.value = false
  }
}
</script>

<template>
  <div>
    <section v-if="hasQuizProfile" class="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 md:p-6 rounded-2xl border border-border/15">
      <div class="min-w-0">
        <p class="font-mono text-xs text-foreground-muted mb-1"># ton profil quiz</p>
        <p class="font-display text-2xl font-medium tracking-tight">{{ profile.profileType }}</p>
        <p class="text-sm text-foreground-muted leading-relaxed">{{ profile.profilePhrase }}</p>
      </div>
      <NuxtLink to="/experience" class="shrink-0 self-start sm:self-center px-5 py-2.5 rounded-full border border-border/20 text-sm text-foreground no-underline hover:border-foreground/50 transition-colors">
        Refaire le quiz
      </NuxtLink>
    </section>

    <div class="grid xl:grid-cols-[minmax(0,1fr)_20rem] gap-12 items-start">
      <form novalidate class="min-w-0" @submit.prevent="submit">
        <section v-for="(step, i) in PROFILE_STEPS" :key="step.key" :aria-labelledby="`profile-section-${step.key}`" :class="['py-8', i > 0 ? 'border-t border-border/10' : 'pt-0']">
          <h2 :id="`profile-section-${step.key}`" class="font-display text-2xl font-medium tracking-tight mb-6">
            <span class="font-mono text-xs text-foreground-muted align-middle mr-2">0{{ i + 1 }}</span>{{ step.label }}
          </h2>
          <ProfileStepIdentity v-if="step.key === 'toi'" />
          <ProfileStepStack v-else-if="step.key === 'stack'" />
          <ProfileStepContact v-else />
        </section>

        <p v-if="serverError" role="alert" class="mt-2 p-4 rounded-2xl border border-red-500/30 bg-red-500/10 text-sm text-red-700 dark:text-red-400">{{ serverError }}</p>

        <div class="sticky bottom-0 z-30 -mx-4 px-4 md:-mx-6 md:px-6 mt-6 py-4 bg-background/90 backdrop-blur-lg border-t border-border/10 flex justify-end">
          <button
            type="submit"
            :disabled="saving"
            class="w-full md:w-auto px-8 py-3.5 bg-foreground border border-b-[3px] border-foreground border-b-foreground-muted/50 rounded-full text-background text-sm font-medium cursor-pointer transition-all motion-reduce:transition-none hover:-translate-y-0.5 hover:shadow-glow active:translate-y-px active:border-b active:shadow-none disabled:opacity-60 disabled:cursor-wait disabled:translate-y-0"
          >
            {{ saving ? 'Enregistrement…' : 'Enregistrer' }}
          </button>
        </div>
      </form>

      <aside class="hidden xl:block sticky top-8">
        <ProfileCardPreview />
      </aside>
    </div>

    <section class="mt-12 pt-8 border-t border-red-500/20" aria-labelledby="danger-zone">
      <h2 id="danger-zone" class="font-mono text-xs text-red-700 dark:text-red-400 mb-4"># zone de danger</h2>
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-red-500/20 rounded-2xl">
        <div>
          <p class="text-sm text-foreground">Supprimer mon profil</p>
          <p class="text-xs text-foreground-muted mt-1">Ton profil disparaît de l'annuaire. Cette action est irréversible.</p>
        </div>
        <button
          type="button"
          :disabled="deleting"
          class="px-6 py-3 bg-transparent border border-red-500/30 text-red-700 dark:text-red-400 rounded-full text-sm cursor-pointer transition-colors hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
          @click="deleteProfile"
        >
          {{ deleting ? 'Suppression…' : 'Supprimer' }}
        </button>
      </div>
    </section>
  </div>
</template>
