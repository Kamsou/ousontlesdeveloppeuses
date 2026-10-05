<script setup lang="ts">
import type { QgProfile } from '~/types/qg'

definePageMeta({
  middleware: 'sidebase-auth'
})

useSeoMeta({
  title: 'Crée ton profil',
  robots: 'noindex'
})

const { data: session } = useAuth()
const { $clientPosthog } = useNuxtApp()
const toast = useToast()
const noProfileCheckedAt = useState<number>('no-profile-checked-at', () => 0)
const profileForm = useProfileForm(ref(null), computed(() => session.value?.user))
provide(profileFormKey, profileForm)
const { validateAndFocus, save, saving, serverError } = profileForm

// /qg just checked and found no profile: skip a second /me request
const { data: existingProfile, error: loadError, refresh: reloadProfile } = await useFetch<QgProfile | null>('/api/developers/me', {
  default: () => null,
  immediate: Date.now() - noProfileCheckedAt.value > 10_000
})

if (existingProfile.value) {
  await navigateTo('/qg', { replace: true })
}

const SITE_URL = 'https://ousontlesdeveloppeuses.fr'

const step = ref(0)
const createdSlug = ref<string | null>(null)
const headingRef = ref<HTMLElement | null>(null)

const currentStep = computed(() => PROFILE_STEPS[step.value]!)
const isLastStep = computed(() => step.value === PROFILE_STEPS.length - 1)
const publicUrl = computed(() => createdSlug.value ? `${SITE_URL}/directory/${createdSlug.value}` : SITE_URL)
const linkedinShareUrl = computed(() => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(publicUrl.value)}`)

async function focusHeading() {
  await nextTick()
  headingRef.value?.focus({ preventScroll: true })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function next() {
  if (!validateAndFocus(currentStep.value.fields)) return
  if (!isLastStep.value) {
    $clientPosthog?.capture('onboarding_step_completed', { step: currentStep.value.key })
    step.value++
    focusHeading()
    return
  }
  const result = await save()
  if (!result) {
    toast.error(serverError.value)
    return
  }
  $clientPosthog?.capture('onboarding_step_completed', { step: currentStep.value.key })
  createdSlug.value = result.slug
  focusHeading()
}

async function retryLoad() {
  await reloadProfile()
  if (existingProfile.value) await navigateTo('/qg', { replace: true })
}

function back() {
  if (step.value === 0) return
  step.value--
  focusHeading()
}

function handleShare() {
  $clientPosthog?.capture('cta_clicked', { cta: 'onboarding_share_linkedin' })
}
</script>

<template>
  <div class="px-4 md:px-16 pt-10 md:pt-16 pb-24">
    <div class="w-full max-w-6xl mx-auto">
      <div v-if="loadError" role="alert" class="max-w-xl py-16">
        <p class="font-mono text-xs text-foreground-muted mb-4"># oups</p>
        <h1 class="font-display text-4xl md:text-5xl font-medium tracking-tight">On n'arrive pas à charger ton profil.</h1>
        <p class="mt-4 text-foreground-muted">Ce n'est pas de ton fait : réessaie dans un instant.</p>
        <button type="button" class="mt-8 px-6 py-3.5 rounded-full border border-border/20 text-sm text-foreground cursor-pointer hover:border-foreground/50 transition-colors" @click="retryLoad">
          Réessayer
        </button>
      </div>

      <template v-else-if="!createdSlug">
        <header class="mb-10 md:mb-14">
          <p class="font-mono text-xs text-foreground-muted mb-4"># rejoindre / étape {{ step + 1 }} sur {{ PROFILE_STEPS.length }}</p>
          <h1 ref="headingRef" tabindex="-1" class="font-display text-4xl md:text-6xl font-medium tracking-tight leading-[1.02] outline-none">
            {{ step === 0 ? 'Crée ton profil.' : currentStep.label + '.' }}
          </h1>
          <p class="mt-4 text-foreground-muted max-w-xl">
            Trois étapes, deux minutes. Tu pourras tout modifier ensuite depuis ton espace.
          </p>

          <ol class="mt-8 grid grid-cols-3 gap-2 max-w-xl" aria-label="Étapes">
            <li v-for="(item, i) in PROFILE_STEPS" :key="item.key" :aria-current="i === step ? 'step' : undefined" class="flex flex-col gap-2">
              <span :class="['h-1 rounded-full transition-colors motion-reduce:transition-none', i <= step ? 'bg-foreground' : 'bg-foreground/15']"></span>
              <span :class="['font-mono text-xs', i === step ? 'text-foreground' : 'text-foreground-muted']">0{{ i + 1 }} {{ item.label.toLowerCase() }}</span>
            </li>
          </ol>
        </header>

        <div class="grid lg:grid-cols-[minmax(0,1fr)_22rem] gap-12 lg:gap-16 items-start">
          <form novalidate class="min-w-0" @submit.prevent="next">
            <ProfileStepIdentity v-if="step === 0" />
            <ProfileStepStack v-else-if="step === 1" />
            <ProfileStepContact v-else />

            <p v-if="serverError" role="alert" class="mt-8 p-4 rounded-2xl border border-red-500/30 bg-red-500/10 text-sm text-red-700 dark:text-red-400">{{ serverError }}</p>

            <div class="sticky bottom-0 -mx-4 px-4 md:mx-0 md:px-0 mt-10 py-4 bg-background/90 backdrop-blur-lg border-t border-border/10 flex items-center justify-between gap-4">
              <button v-if="step > 0" type="button" class="px-5 py-3 rounded-full border border-border/20 text-sm text-foreground cursor-pointer hover:border-foreground/50 transition-colors" @click="back">
                Retour
              </button>
              <span v-else></span>
              <button
                type="submit"
                :disabled="saving"
                class="inline-flex items-center gap-3 px-6 py-3.5 bg-foreground border border-b-[3px] border-foreground border-b-foreground-muted/50 text-background rounded-full text-sm font-medium cursor-pointer transition-all motion-reduce:transition-none hover:-translate-y-0.5 hover:shadow-glow active:translate-y-px active:border-b active:shadow-none disabled:opacity-60 disabled:cursor-wait disabled:translate-y-0"
              >
                {{ saving ? 'Création…' : isLastStep ? 'Rejoindre l\'annuaire' : 'Continuer' }}
                <svg v-if="!saving" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </form>

          <aside class="hidden lg:block sticky top-28">
            <ProfileCardPreview />
          </aside>
        </div>
      </template>

      <section v-else class="grid lg:grid-cols-[minmax(0,1fr)_22rem] gap-12 lg:gap-16 items-center min-h-[60svh]">
        <div>
          <p class="font-mono text-xs text-foreground-muted mb-4"># bienvenue</p>
          <h1 ref="headingRef" tabindex="-1" class="font-display text-5xl md:text-7xl font-medium tracking-tight leading-[0.95] outline-none">
            Tu es dans l'annuaire.
          </h1>
          <p class="mt-6 text-foreground-muted text-lg max-w-lg leading-relaxed">
            Les orgas, recruteurs, recruteuses et autres devs peuvent maintenant te trouver. La liste de l'annuaire se met à jour d'ici quelques minutes.
          </p>

          <div class="mt-10 flex flex-col sm:flex-row sm:flex-wrap gap-3">
            <NuxtLink
              :to="`/directory/${createdSlug}`"
              class="inline-flex items-center justify-center gap-3 px-6 py-3.5 bg-foreground border border-b-[3px] border-foreground border-b-foreground-muted/50 text-background rounded-full text-sm font-medium no-underline transition-all motion-reduce:transition-none hover:-translate-y-0.5 hover:shadow-glow active:translate-y-px active:border-b active:shadow-none"
            >
              Voir mon profil public
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </NuxtLink>
            <a
              :href="linkedinShareUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full border border-border/20 text-sm text-foreground no-underline hover:border-foreground/50 transition-colors"
              @click="handleShare"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/></svg>
              Partager sur LinkedIn
              <span class="sr-only">(nouvel onglet)</span>
            </a>
          </div>

          <div class="mt-12 pt-8 border-t border-border/10 grid sm:grid-cols-2 gap-6 max-w-lg">
            <NuxtLink to="/experience" class="group no-underline text-foreground">
              <span class="font-mono text-xs text-foreground-muted">/experience</span>
              <span class="block font-display text-lg font-medium mt-1 underline-offset-4 group-hover:underline">Quel dev es-tu ?</span>
              <span class="block text-sm text-foreground-muted mt-1">Le quiz ajoute ton profil type à ta fiche.</span>
            </NuxtLink>
            <NuxtLink to="/qg" class="group no-underline text-foreground">
              <span class="font-mono text-xs text-foreground-muted">/qg</span>
              <span class="block font-display text-lg font-medium mt-1 underline-offset-4 group-hover:underline">Mon espace</span>
              <span class="block text-sm text-foreground-muted mt-1">Modifier ton profil, suivre les contacts reçus.</span>
            </NuxtLink>
          </div>
        </div>

        <ProfileCardPreview />
      </section>
    </div>
  </div>
</template>
