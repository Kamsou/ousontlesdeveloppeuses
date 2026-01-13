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
  travelWilling: false
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

    <section v-if="hasValidExperienceProfile" class="mb-16 -mx-4 md:-mx-8 px-4 md:px-8 py-12 border-y border-border relative overflow-hidden">
      <div class="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <span class="font-display text-[20rem] md:text-[28rem] font-bold text-text opacity-[0.02] leading-none tracking-tighter">*</span>
      </div>

      <div class="relative">
        <div class="flex flex-col gap-8">
          <span class="text-[0.65rem] uppercase tracking-[0.3em] text-text-muted">Profil généré</span>

          <div class="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 md:gap-16 items-end">
            <div>
              <h2 class="font-display text-4xl md:text-6xl lg:text-7xl font-medium tracking-tight leading-[0.9] mb-6">{{ profile?.profileType }}</h2>
              <p class="text-text-muted text-lg md:text-xl leading-relaxed max-w-xl">{{ profile?.profilePhrase }}</p>
            </div>

            <NuxtLink to="/experience" class="group flex items-center gap-3 self-end pb-2">
              <span class="text-sm text-text-muted group-hover:text-text transition-colors">Refaire</span>
              <span class="w-10 h-10 flex items-center justify-center border border-border rounded-full group-hover:border-text group-hover:bg-text group-hover:text-bg transition-all">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
                </svg>
              </span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <form @submit.prevent="save">
      <div v-if="error" class="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 mb-8">{{ error }}</div>

      <section class="py-8 border-b border-border">
        <h2 class="font-display text-xl font-medium mb-2">Informations</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div class="flex flex-col gap-2">
            <label for="name" class="text-xs uppercase tracking-wide text-text-muted">Nom *</label>
            <input id="name" v-model="form.name" type="text" required class="px-4 py-3 bg-bg-card border border-border rounded-lg text-text text-sm transition-colors focus:outline-none focus:border-text-muted" />
          </div>

          <div class="flex flex-col gap-2">
            <label for="location" class="text-xs uppercase tracking-wide text-text-muted">Ville</label>
            <input id="location" v-model="form.location" type="text" placeholder="Paris" class="px-4 py-3 bg-bg-card border border-border rounded-lg text-text text-sm transition-colors focus:outline-none focus:border-text-muted placeholder:text-text-muted" />
          </div>

          <div class="flex flex-col gap-2">
            <label for="years-experience" class="text-xs uppercase tracking-wide text-text-muted">Années d'expérience</label>
            <input id="years-experience" v-model.number="form.yearsExperience" type="number" min="0" max="50" class="px-4 py-3 bg-bg-card border border-border rounded-lg text-text text-sm transition-colors focus:outline-none focus:border-text-muted" />
          </div>

          <div class="flex flex-col gap-2">
            <label for="website" class="text-xs uppercase tracking-wide text-text-muted">Site web</label>
            <input id="website" v-model="form.website" type="url" placeholder="https://" class="px-4 py-3 bg-bg-card border border-border rounded-lg text-text text-sm transition-colors focus:outline-none focus:border-text-muted placeholder:text-text-muted" />
          </div>

          <div class="flex flex-col gap-2">
            <label for="linkedin" class="text-xs uppercase tracking-wide text-text-muted">LinkedIn *</label>
            <input id="linkedin" v-model="form.linkedinUrl" type="url" placeholder="https://linkedin.com/in/..." class="px-4 py-3 bg-bg-card border border-border rounded-lg text-text text-sm transition-colors focus:outline-none focus:border-text-muted placeholder:text-text-muted" required />
          </div>

          <div class="flex flex-col gap-2">
            <label for="twitter" class="text-xs uppercase tracking-wide text-text-muted">Twitter/X</label>
            <input id="twitter" v-model="form.twitterUrl" type="url" placeholder="https://twitter.com/..." class="px-4 py-3 bg-bg-card border border-border rounded-lg text-text text-sm transition-colors focus:outline-none focus:border-text-muted placeholder:text-text-muted" />
          </div>
        </div>

        <div class="flex flex-col gap-2 md:col-span-2">
          <label for="bio" class="text-xs uppercase tracking-wide text-text-muted">Bio</label>
          <textarea id="bio" v-model="form.bio" rows="4" placeholder="Présentez-vous en quelques mots..." class="px-4 py-3 bg-bg-card border border-border rounded-lg text-text text-sm transition-colors focus:outline-none focus:border-text-muted resize-y min-h-[100px] placeholder:text-text-muted"></textarea>
        </div>
      </section>

      <section class="py-8 border-b border-border">
        <h2 id="technologies-label" class="font-display text-xl font-medium mb-4">Technologies</h2>

        <div class="flex gap-2 mb-4">
          <input
            id="new-skill"
            v-model="newSkill"
            type="text"
            placeholder="Ajouter une techno..."
            aria-labelledby="technologies-label"
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
        </div>
      </section>

      <section class="py-8 border-b border-border">
        <h2 class="font-display text-xl font-medium mb-2">Disponible pour</h2>
        <p class="text-text-muted text-sm mb-6">Indiquez ce pour quoi vous êtes disponible</p>

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
      </section>

      <section v-if="form.openTo.includes('conference')" class="py-8 border-b border-border">
        <h2 class="font-display text-xl font-medium mb-2">Profil Speakeuse</h2>
        <p class="text-text-muted text-sm mb-6">Informations pour les organisateurs d'événements</p>

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
          </div>
        </div>

        <div class="flex flex-col md:flex-row gap-4 md:gap-8 mt-4">
          <label class="flex items-center gap-2 cursor-pointer text-text-muted">
            <input v-model="form.remoteOk" type="checkbox" class="w-[18px] h-[18px] accent-text" />
            <span>Disponible en remote</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer text-text-muted">
            <input v-model="form.travelWilling" type="checkbox" class="w-[18px] h-[18px] accent-text" />
            <span>Prête à me déplacer</span>
          </label>
        </div>
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
