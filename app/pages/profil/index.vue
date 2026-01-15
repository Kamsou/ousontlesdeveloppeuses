<script setup lang="ts">
interface Profile {
  id: number
  name: string
  email: string | null
  avatarUrl: string | null
  bio: string | null
  location: string | null
  yearsExperience: number | null
  website: string | null
  githubUrl: string | null
  linkedinUrl: string | null
  twitterUrl: string | null
  profileType: string | null
  profilePhrase: string | null
  skills: string[]
  openTo: string[]
  speakerProfile: {
    topics: string[]
    available: boolean | null
    remoteOk: boolean | null
    travelWilling: boolean | null
  } | null
  emailOptIn: boolean
  emailOptInAsked: boolean
}

definePageMeta({
  middleware: 'sidebase-auth'
})

useSeoMeta({
  title: 'Mon Profil - OSLD',
  robots: 'noindex, nofollow'
})

const { data: session, signOut } = useAuth()
const router = useRouter()

const openToOptions = [
  { value: 'conference', label: 'Conférence' },
  { value: 'mentoring', label: 'Mentoring' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'cdi', label: 'CDI' },
  { value: 'coffee_chat', label: 'Coffee chat' },
  { value: 'pair_programming', label: 'Pair programming' },
  { value: 'cv_review', label: 'Relecture CV' }
]

const { data: profile, refresh } = await useFetch<Profile | null>('/api/developers/me')

const isNewProfile = computed(() => !profile.value)

const validProfileTypes = [
  "L'Architecte",
  'La Détective',
  'La Speedrunner',
  'La Perfectionniste',
  'La Connectrice',
  "L'Exploratrice",
  'La Gardienne',
  'La Créative'
]

const hasValidExperienceProfile = computed(() => {
  return profile.value?.profileType &&
    profile.value?.profilePhrase &&
    validProfileTypes.includes(profile.value.profileType)
})

const form = reactive({
  name: '',
  bio: '',
  location: '',
  yearsExperience: null as number | null,
  website: '',
  linkedinUrl: '',
  twitterUrl: '',
  skills: [] as string[],
  openTo: [] as string[],
  speakerTopics: [] as string[],
  remoteOk: true,
  travelWilling: false,
  emailOptIn: false
})

const newSkill = ref('')
const newTopic = ref('')
const saving = ref(false)
const error = ref('')
watch(profile, (p) => {
  if (p) {
    form.name = p.name || ''
    form.bio = p.bio || ''
    form.location = p.location || ''
    form.yearsExperience = p.yearsExperience
    form.website = p.website || ''
    form.linkedinUrl = p.linkedinUrl || ''
    form.twitterUrl = p.twitterUrl || ''
    form.skills = p.skills || []
    form.openTo = p.openTo || []
    form.speakerTopics = p.speakerProfile?.topics || []
    form.remoteOk = p.speakerProfile?.remoteOk ?? true
    form.travelWilling = p.speakerProfile?.travelWilling ?? false
    form.emailOptIn = p.emailOptIn ?? false
  } else if (session.value?.user) {
    form.name = session.value.user.name || ''
  }
}, { immediate: true })

function addSkill() {
  if (newSkill.value && !form.skills.includes(newSkill.value)) {
    form.skills.push(newSkill.value)
    newSkill.value = ''
  }
}

function removeSkill(skill: string) {
  form.skills = form.skills.filter(s => s !== skill)
}

function addTopic() {
  if (newTopic.value && !form.speakerTopics.includes(newTopic.value)) {
    form.speakerTopics.push(newTopic.value)
    newTopic.value = ''
  }
}

function removeTopic(topic: string) {
  form.speakerTopics = form.speakerTopics.filter(t => t !== topic)
}

function toggleOpenTo(value: string) {
  const index = form.openTo.indexOf(value)
  if (index > -1) {
    form.openTo.splice(index, 1)
  } else {
    form.openTo.push(value)
  }
}

const deleting = ref(false)

const showOptInModal = ref(false)

onMounted(() => {
  const shouldShow = isNewProfile.value || (profile.value && !profile.value.emailOptInAsked)
  if (shouldShow) {
    showOptInModal.value = true
  }
})

async function handleOptInChoice(choice: boolean) {
  showOptInModal.value = false
  form.emailOptIn = choice

  if (profile.value) {
    try {
      await $fetch(`/api/developers/${profile.value.id}`, {
        method: 'PUT',
        body: { emailOptIn: choice }
      })
      profile.value.emailOptIn = choice
      profile.value.emailOptInAsked = true
    } catch {
      form.emailOptIn = !choice
    }
  }
}

async function save() {
  saving.value = true
  error.value = ''

  try {
    if (isNewProfile.value) {
      await $fetch('/api/developers', {
        method: 'POST',
        body: form
      })
    } else {
      await $fetch(`/api/developers/${profile.value!.id}`, {
        method: 'PUT',
        body: form
      })
    }
    await refresh()
    router.push(`/profil/${profile.value?.id || 'me'}`)
  } catch (e: any) {
    error.value = e.data?.message || 'Une erreur est survenue'
  } finally {
    saving.value = false
  }
}

async function deleteProfile() {
  if (!confirm('Supprimer définitivement ton profil de l\'annuaire ? Cette action est irréversible.')) return

  deleting.value = true
  try {
    await $fetch('/api/developers/me', { method: 'DELETE' } as any)
    await signOut({ callbackUrl: '/' })
  } catch (e: any) {
    error.value = e.data?.message || 'Erreur lors de la suppression'
    deleting.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="showOptInModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/90 backdrop-blur-md" @click="handleOptInChoice(false)" />
        <dialog open role="dialog" aria-labelledby="optin-title" aria-describedby="optin-desc" class="relative bg-bg border border-border rounded-3xl p-10 max-w-lg w-full overflow-hidden">
          <div class="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
          <div class="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" aria-hidden="true" />

          <div class="relative">
            <p class="text-[0.65rem] uppercase tracking-[0.3em] text-primary mb-6" aria-hidden="true">Psst...</p>

            <h2 id="optin-title" class="font-display text-3xl md:text-4xl font-medium leading-tight mb-4">
              Attends, lis ça<br />
              <span class="text-text-muted">avant de fermer</span>
            </h2>

            <p id="optin-desc" class="text-text-muted text-base leading-relaxed mb-8 max-w-sm">
              News sur l'avancée du projet, sondages pour améliorer l'app ensemble. On construit ça avec toi.
            </p>

            <div class="flex flex-col sm:flex-row gap-3">
              <button
                @click="handleOptInChoice(true)"
                class="group flex-1 px-6 py-4 bg-text text-bg rounded-full font-medium transition-all hover:bg-primary flex items-center justify-center gap-2"
              >
                Je veux ça
                <svg class="w-4 h-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
              <button
                @click="handleOptInChoice(false)"
                class="px-6 py-4 bg-transparent text-text-muted rounded-full font-medium transition-all hover:text-text"
              >
                Pas maintenant
              </button>
            </div>

            <p class="text-[0.7rem] text-text-muted mt-6">
              Zéro spam. Désinscription en 1 clic. Promis.
            </p>
          </div>
        </dialog>
      </div>
    </Transition>
  </Teleport>

  <div class="max-w-3xl mx-auto px-4 md:px-8 pb-16">
    <header class="py-12 mb-8" :class="{ 'border-b border-border': !hasValidExperienceProfile }">
      <span class="text-xs uppercase tracking-[0.2em] text-text-muted mb-4 block">
        {{ isNewProfile ? 'Créer' : 'Modifier' }} mon profil
      </span>
      <h1 class="font-display text-3xl md:text-5xl font-medium tracking-tight">{{ isNewProfile ? 'Bienvenue' : 'Mon profil' }}</h1>
    </header>

    <div v-if="isNewProfile" class="mb-8 p-4 bg-primary/10 border border-primary/30 rounded-xl">
      <p class="text-sm text-text">
        Cet annuaire est réservé aux <strong>développeuses basées en France</strong>.
        Merci de renseigner ta ville française dans le champ "Ville" ci-dessous.
      </p>
    </div>

    <section v-if="hasValidExperienceProfile" class="mb-10 relative group">
      <div class="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div class="relative p-6 md:p-8 border border-border/50 rounded-2xl">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="flex-1 min-w-0">
            <span class="text-[0.6rem] uppercase tracking-[0.25em] text-text-muted/70 mb-2 block">Ton profil</span>
            <p class="font-display text-2xl md:text-3xl font-medium tracking-tight mb-1">{{ profile?.profileType }}</p>
            <p class="text-text-muted text-sm leading-relaxed">{{ profile?.profilePhrase }}</p>
          </div>

          <NuxtLink to="/experience" class="group/btn flex items-center gap-3 px-5 py-3 border border-border/50 rounded-full hover:border-text/30 hover:bg-white/[0.02] transition-all duration-300 shrink-0">
            <span class="text-sm text-text-muted group-hover/btn:text-text transition-colors">Refaire</span>
            <span class="w-6 h-6 flex items-center justify-center rounded-full bg-white/5 group-hover/btn:bg-white/10 transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-text-muted group-hover/btn:text-text transition-colors">
                <path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
              </svg>
            </span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <form @submit.prevent="save">
      <div v-if="error" class="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 mb-8">{{ error }}</div>

      <!-- Section 1: Identité -->
      <section class="py-8 border-b border-border">
        <h2 class="font-display text-xl font-medium mb-6">Identité</h2>

        <div class="flex flex-col gap-6">
          <div class="flex flex-col gap-2">
            <label for="name" class="text-xs uppercase tracking-wide text-text-muted">Nom *</label>
            <input id="name" v-model="form.name" type="text" required class="px-4 py-3 bg-bg-card border border-border rounded-lg text-text text-sm transition-colors focus:outline-none focus:border-text-muted" />
          </div>

          <div class="flex flex-col gap-2">
            <label for="bio" class="text-xs uppercase tracking-wide text-text-muted">Bio</label>
            <textarea id="bio" v-model="form.bio" rows="3" placeholder="Ce que tu fais, ce qui te passionne..." class="px-4 py-3 bg-bg-card border border-border rounded-lg text-text text-sm transition-colors focus:outline-none focus:border-text-muted resize-y min-h-[80px] placeholder:text-text-muted"></textarea>
          </div>
        </div>
      </section>

      <!-- Section 2: Localisation & Expérience -->
      <section class="py-8 border-b border-border">
        <h2 class="font-display text-xl font-medium mb-6">Localisation & Expérience</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="flex flex-col gap-2">
            <label for="location" class="text-xs uppercase tracking-wide text-text-muted">Ville</label>
            <input id="location" v-model="form.location" type="text" placeholder="Paris" class="px-4 py-3 bg-bg-card border border-border rounded-lg text-text text-sm transition-colors focus:outline-none focus:border-text-muted placeholder:text-text-muted" />
          </div>

          <div class="flex flex-col gap-2">
            <label for="years-experience" class="text-xs uppercase tracking-wide text-text-muted">Années d'expérience</label>
            <input id="years-experience" v-model.number="form.yearsExperience" type="number" min="0" max="50" class="px-4 py-3 bg-bg-card border border-border rounded-lg text-text text-sm transition-colors focus:outline-none focus:border-text-muted" />
          </div>
        </div>
      </section>

      <!-- Section 3: Compétences -->
      <section class="py-8 border-b border-border">
        <h2 id="competences-label" class="font-display text-xl font-medium mb-6">Compétences</h2>

        <div class="flex gap-2 mb-4">
          <input
            id="new-skill"
            v-model="newSkill"
            type="text"
            placeholder="Vue.js, TypeScript, Node..."
            aria-labelledby="competences-label"
            class="flex-1 px-4 py-3 bg-bg-card border border-border rounded-lg text-text text-sm transition-colors focus:outline-none focus:border-text-muted placeholder:text-text-muted"
            @keydown.enter.prevent="addSkill"
          />
          <button type="button" @click="addSkill" class="px-6 py-3 bg-bg-card border border-border rounded-lg text-text cursor-pointer transition-all hover:bg-bg-card-hover">Ajouter</button>
        </div>

        <div class="flex flex-wrap gap-2">
          <span v-for="skill in form.skills" :key="skill" class="flex items-center gap-2 px-4 py-2 bg-bg-card border border-border rounded-full text-sm">
            {{ skill }}
            <button type="button" @click="removeSkill(skill)" class="bg-transparent border-none text-text-muted cursor-pointer text-lg leading-none p-0 hover:text-text">&times;</button>
          </span>
          <span v-if="form.skills.length === 0" class="text-sm text-text-muted">Aucune compétence ajoutée</span>
        </div>
      </section>

      <!-- Section 4: Disponibilités -->
      <section class="py-8 border-b border-border">
        <h2 class="font-display text-xl font-medium mb-2">Disponible pour</h2>
        <p class="text-text-muted text-sm mb-6">Qu'est-ce qui t'intéresse ?</p>

        <div class="flex flex-col md:flex-row flex-wrap gap-3">
          <button
            v-for="option in openToOptions"
            :key="option.value"
            type="button"
            :class="[
              'px-6 py-3 border rounded-full cursor-pointer text-sm transition-all w-full md:w-auto text-center',
              form.openTo.includes(option.value)
                ? 'bg-text border-text text-bg'
                : 'bg-transparent border-border text-text-muted hover:border-text hover:text-text'
            ]"
            @click="toggleOpenTo(option.value)"
          >
            {{ option.label }}
          </button>
        </div>

        <!-- Profil Speakeuse (conditionnel) -->
        <div v-if="form.openTo.includes('conference')" class="mt-8 pt-8 border-t border-border/50">
          <h3 class="font-medium text-lg mb-2">Profil Speakeuse</h3>
          <p class="text-text-muted text-sm mb-6">Infos pour les organisateurs d'événements</p>

          <div class="flex flex-col gap-2 mb-4">
            <label for="new-topic" class="text-xs uppercase tracking-wide text-text-muted">Sujets de talk</label>
            <div class="flex gap-2 mb-4">
              <input
                id="new-topic"
                v-model="newTopic"
                type="text"
                placeholder="Vue.js, Women in Tech..."
                class="flex-1 px-4 py-3 bg-bg-card border border-border rounded-lg text-text text-sm transition-colors focus:outline-none focus:border-text-muted placeholder:text-text-muted"
                @keydown.enter.prevent="addTopic"
              />
              <button type="button" @click="addTopic" class="px-6 py-3 bg-bg-card border border-border rounded-lg text-text cursor-pointer transition-all hover:bg-bg-card-hover">Ajouter</button>
            </div>
            <div class="flex flex-wrap gap-2">
              <span v-for="topic in form.speakerTopics" :key="topic" class="flex items-center gap-2 px-4 py-2 bg-bg-card border border-border rounded-full text-sm">
                {{ topic }}
                <button type="button" @click="removeTopic(topic)" class="bg-transparent border-none text-text-muted cursor-pointer text-lg leading-none p-0 hover:text-text">&times;</button>
              </span>
              <span v-if="form.speakerTopics.length === 0" class="text-sm text-text-muted">Aucun sujet ajouté</span>
            </div>
          </div>

          <div class="flex flex-col md:flex-row gap-4 md:gap-8 mt-4">
            <label class="flex items-center gap-2 cursor-pointer text-text-muted hover:text-text transition-colors">
              <input v-model="form.remoteOk" type="checkbox" class="w-[18px] h-[18px] accent-text" />
              <span>Disponible en remote</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer text-text-muted hover:text-text transition-colors">
              <input v-model="form.travelWilling" type="checkbox" class="w-[18px] h-[18px] accent-text" />
              <span>Prête à me déplacer</span>
            </label>
          </div>
        </div>
      </section>

      <!-- Section 5: Liens -->
      <section class="py-8 border-b border-border">
        <h2 class="font-display text-xl font-medium mb-2">Liens</h2>
        <p class="text-text-muted text-sm mb-6">Où te trouver sur le web</p>

        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-2">
            <label for="linkedin" class="text-xs uppercase tracking-wide text-text-muted">LinkedIn *</label>
            <input id="linkedin" v-model="form.linkedinUrl" type="url" placeholder="https://linkedin.com/in/..." required class="px-4 py-3 bg-bg-card border border-border rounded-lg text-text text-sm transition-colors focus:outline-none focus:border-text-muted placeholder:text-text-muted" />
          </div>

          <div class="flex flex-col gap-2">
            <label for="website" class="text-xs uppercase tracking-wide text-text-muted">Site web / Portfolio</label>
            <input id="website" v-model="form.website" type="url" placeholder="https://..." class="px-4 py-3 bg-bg-card border border-border rounded-lg text-text text-sm transition-colors focus:outline-none focus:border-text-muted placeholder:text-text-muted" />
          </div>

          <div class="flex flex-col gap-2">
            <label for="twitter" class="text-xs uppercase tracking-wide text-text-muted">Twitter / X</label>
            <input id="twitter" v-model="form.twitterUrl" type="url" placeholder="https://twitter.com/..." class="px-4 py-3 bg-bg-card border border-border rounded-lg text-text text-sm transition-colors focus:outline-none focus:border-text-muted placeholder:text-text-muted" />
          </div>
        </div>
      </section>

      <!-- Section 6: Préférences -->
      <section class="py-8 border-b border-border">
        <h2 class="font-display text-xl font-medium mb-6">Préférences</h2>

        <label class="flex items-start gap-3 cursor-pointer group">
          <input
            v-model="form.emailOptIn"
            type="checkbox"
            class="w-[18px] h-[18px] accent-primary mt-0.5 shrink-0"
          />
          <div class="flex flex-col gap-1">
            <span class="text-text group-hover:text-primary transition-colors">
              Recevoir les actualités OSLD
            </span>
            <span class="text-xs text-text-muted">
              News sur l'avancée du projet, sondages pour améliorer l'app. Zéro spam.
            </span>
          </div>
        </label>
      </section>

      <div class="flex justify-end gap-4 pt-8">
        <NuxtLink to="/annuaire" class="px-8 py-4 bg-transparent border border-border rounded-full text-text-muted no-underline text-sm transition-all hover:border-text hover:text-text">Annuler</NuxtLink>
        <button type="submit" :disabled="saving" class="px-8 py-4 bg-text border-none rounded-full text-bg text-sm font-medium cursor-pointer transition-all hover:bg-text-muted disabled:opacity-50 disabled:cursor-not-allowed">
          {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
        </button>
      </div>
    </form>

    <section v-if="!isNewProfile" class="mt-16 pt-8 border-t border-red-500/20">
      <h2 class="text-sm font-medium text-red-400 mb-4">Zone de danger</h2>
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-red-500/20 rounded-xl">
        <div>
          <p class="text-sm text-text">Supprimer mon profil</p>
          <p class="text-xs text-text-muted mt-1">Cette action est irréversible.</p>
        </div>
        <button
          type="button"
          @click="deleteProfile"
          :disabled="deleting"
          class="px-6 py-3 bg-transparent border border-red-500/30 text-red-400 rounded-full text-sm cursor-pointer transition-all hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ deleting ? 'Suppression...' : 'Supprimer' }}
        </button>
      </div>
    </section>
  </div>
</template>
