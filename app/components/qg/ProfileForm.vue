<script setup lang="ts">
import { openToOptions } from '~/utils/constants'

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

const props = defineProps<{
  profile: Profile | null
  sessionUserName?: string
}>()

const emit = defineEmits<{
  saved: []
}>()

const { $clientPosthog } = useNuxtApp()
const { signOut } = useAuth()
const toast = useToast()

const isNewProfile = computed(() => !props.profile)

const validProfileTypes = [
  "L'Architecte", 'La Détective', 'La Speedrunner', 'La Perfectionniste',
  'La Connectrice', "L'Exploratrice", 'La Gardienne', 'La Créative'
]

const hasValidExperienceProfile = computed(() => {
  return props.profile?.profileType &&
    props.profile?.profilePhrase &&
    validProfileTypes.includes(props.profile.profileType)
})

const form = reactive({
  firstName: '',
  lastName: '',
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
  emailOptIn: false,
  cocAccepted: false
})

const newSkill = ref('')
const newTopic = ref('')
const saving = ref(false)
const error = ref('')
const deleting = ref(false)

watch(() => props.profile, (p) => {
  if (p) {
    const nameParts = (p.name || '').split(' ')
    form.firstName = nameParts[0] || ''
    form.lastName = nameParts.slice(1).join(' ') || ''
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
  } else if (props.sessionUserName) {
    const nameParts = props.sessionUserName.split(' ')
    form.firstName = nameParts[0] || ''
    form.lastName = nameParts.slice(1).join(' ') || ''
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

async function save() {
  saving.value = true
  error.value = ''

  const payload = {
    ...form,
    name: `${form.firstName.trim()} ${form.lastName.trim()}`.trim()
  }

  try {
    if (isNewProfile.value) {
      await $fetch('/api/developers', {
        method: 'POST',
        body: payload
      })
      $clientPosthog?.capture('profile_created', {
        location: form.location,
        skills_count: form.skills.length,
        is_speaker: form.openTo.includes('conference')
      })
    } else {
      await $fetch(`/api/developers/${props.profile!.id}`, {
        method: 'PUT',
        body: payload
      })
      $clientPosthog?.capture('profile_updated')
    }
    toast.success(isNewProfile.value ? 'Profil créé' : 'Profil mis à jour')
    emit('saved')
  } catch (e: any) {
    error.value = e.data?.message || 'Une erreur est survenue'
    toast.error(error.value)
  } finally {
    saving.value = false
  }
}

async function deleteProfile() {
  if (!confirm('Supprimer définitivement ton profil de l\'annuaire ? Cette action est irréversible.')) return

  deleting.value = true
  try {
    await $fetch('/api/developers/me', { method: 'DELETE' } as any)
    $clientPosthog?.capture('profile_deleted')
    await signOut({ callbackUrl: '/' })
  } catch (e: any) {
    error.value = e.data?.message || 'Erreur lors de la suppression'
    deleting.value = false
  }
}
</script>

<template>
  <div>
    <ClientOnly>
      <div v-if="isNewProfile" class="mb-8 p-4 bg-primary/10 border border-primary/30 rounded-xl">
        <p class="text-sm text-foreground">
          Cet espace est reservé aux <strong>développeuses francophones</strong>, contente de t'accueillir !
        </p>
      </div>
    </ClientOnly>

    <ClientOnly>
      <section v-if="hasValidExperienceProfile" class="mb-10 relative group">
        <div class="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div class="relative p-6 md:p-8 border border-border/50 rounded-2xl">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div class="flex-1 min-w-0">
              <span class="text-[0.6rem] uppercase tracking-[0.25em] text-foreground-muted mb-2 block">Ton profil quiz</span>
              <p class="font-display text-2xl md:text-3xl font-medium tracking-tight mb-1">{{ profile?.profileType }}</p>
              <p class="text-foreground-muted text-sm leading-relaxed">{{ profile?.profilePhrase }}</p>
            </div>
            <NuxtLink to="/experience" class="group/btn flex items-center gap-3 px-5 py-3 border border-border/50 rounded-full hover:border-foreground/30 hover:bg-white/[0.02] transition-all duration-300 shrink-0">
              <span class="text-sm text-foreground-muted group-hover/btn:text-foreground transition-colors">Refaire</span>
              <span class="w-6 h-6 flex items-center justify-center rounded-full bg-white/5 group-hover/btn:bg-white/10 transition-colors">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-foreground-muted group-hover/btn:text-foreground transition-colors">
                  <path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
                </svg>
              </span>
            </NuxtLink>
          </div>
        </div>
      </section>
    </ClientOnly>

    <ClientOnly>
      <template #fallback>
        <div class="animate-pulse space-y-8">
          <div class="py-5 border-b border-border">
            <div class="h-6 bg-border/50 rounded w-24 mb-6"></div>
            <div class="space-y-6">
              <div class="h-12 bg-border/50 rounded"></div>
              <div class="h-24 bg-border/50 rounded"></div>
            </div>
          </div>
        </div>
      </template>

      <form @submit.prevent="save">
        <div v-if="error" class="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 mb-8">{{ error }}</div>

        <section class="py-5 border-b border-border">
          <h2 class="font-display text-xl font-medium mb-4">Identité</h2>

          <div class="flex flex-col gap-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="flex flex-col gap-2">
                <label for="lastName" class="text-xs uppercase tracking-wide text-foreground-muted">Nom *</label>
                <input id="lastName" v-model="form.lastName" type="text" required class="px-4 py-3 bg-background-card border border-border rounded-lg text-foreground text-sm transition-colors focus:outline-none focus:border-foreground-muted" />
              </div>
              <div class="flex flex-col gap-2">
                <label for="firstName" class="text-xs uppercase tracking-wide text-foreground-muted">Prénom *</label>
                <input id="firstName" v-model="form.firstName" type="text" required class="px-4 py-3 bg-background-card border border-border rounded-lg text-foreground text-sm transition-colors focus:outline-none focus:border-foreground-muted" />
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <label for="bio" class="text-xs uppercase tracking-wide text-foreground-muted">Bio</label>
              <textarea id="bio" v-model="form.bio" rows="3" placeholder="Ce que tu fais, ce qui te passionne..." class="px-4 py-3 bg-background-card border border-border rounded-lg text-foreground text-sm transition-colors focus:outline-none focus:border-foreground-muted resize-y min-h-[80px] placeholder:text-foreground-muted"></textarea>
            </div>
          </div>
        </section>

        <section class="py-5 border-b border-border">
          <h2 class="font-display text-xl font-medium mb-4">Localisation & Expérience</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <label for="location" class="text-xs uppercase tracking-wide text-foreground-muted">Ville</label>
              <input id="location" v-model="form.location" type="text" placeholder="Paris" class="px-4 py-3 bg-background-card border border-border rounded-lg text-foreground text-sm transition-colors focus:outline-none focus:border-foreground-muted placeholder:text-foreground-muted" />
            </div>

            <div class="flex flex-col gap-2">
              <label for="years-experience" class="text-xs uppercase tracking-wide text-foreground-muted">Années d'expérience</label>
              <input id="years-experience" v-model.number="form.yearsExperience" type="number" min="0" max="50" class="px-4 py-3 bg-background-card border border-border rounded-lg text-foreground text-sm transition-colors focus:outline-none focus:border-foreground-muted" />
            </div>
          </div>
        </section>

        <section class="py-5 border-b border-border">
          <h2 id="competences-label" class="font-display text-xl font-medium mb-4">Compétences</h2>

          <div class="flex gap-2 mb-4">
            <input
              id="new-skill"
              v-model="newSkill"
              type="text"
              placeholder="Vue.js, TypeScript, Node..."
              aria-labelledby="competences-label"
              class="flex-1 px-4 py-3 bg-background-card border border-border rounded-lg text-foreground text-sm transition-colors focus:outline-none focus:border-foreground-muted placeholder:text-foreground-muted"
              @keydown.enter.prevent="addSkill"
            />
            <button type="button" @click="addSkill" class="px-6 py-3 bg-background-card border border-border rounded-lg text-foreground cursor-pointer transition-all hover:bg-background-card-hover">Ajouter</button>
          </div>

          <div class="flex flex-wrap gap-2">
            <span v-for="skill in form.skills" :key="skill" class="flex items-center gap-2 px-4 py-2 bg-background-card border border-border rounded-full text-sm">
              {{ skill }}
              <button type="button" @click="removeSkill(skill)" class="bg-transparent border-none text-foreground-muted cursor-pointer text-lg leading-none p-0 hover:text-foreground">&times;</button>
            </span>
            <span v-if="form.skills.length === 0" class="text-sm text-foreground-muted">Aucune compétence ajoutée</span>
          </div>
        </section>

        <section class="py-5 border-b border-border">
          <h2 class="font-display text-xl font-medium mb-2">Disponible pour</h2>
          <p class="text-foreground-muted text-sm mb-6">Qu'est-ce qui t'intéresse ?</p>

          <div class="flex flex-col md:flex-row flex-wrap gap-3">
            <button
              v-for="option in openToOptions"
              :key="option.value"
              type="button"
              :class="[
                'px-6 py-3 border rounded-full cursor-pointer text-sm transition-all w-full md:w-auto text-center',
                form.openTo.includes(option.value)
                  ? 'bg-foreground border-foreground text-background'
                  : 'bg-transparent border-border text-foreground-muted hover:border-foreground hover:text-foreground'
              ]"
              @click="toggleOpenTo(option.value)"
            >
              {{ option.label }}
            </button>
          </div>

          <div v-if="form.openTo.includes('conference')" class="mt-8 pt-8 border-t border-border/50">
            <h3 class="font-medium text-lg mb-2">Profil Speakeuse</h3>
            <p class="text-foreground-muted text-sm mb-6">Infos pour les organisateurs d'événements</p>

            <div class="flex flex-col gap-2 mb-4">
              <label for="new-topic" class="text-xs uppercase tracking-wide text-foreground-muted">Sujets de talk</label>
              <div class="flex gap-2 mb-4">
                <input
                  id="new-topic"
                  v-model="newTopic"
                  type="text"
                  placeholder="Vue.js, Women in Tech..."
                  class="flex-1 px-4 py-3 bg-background-card border border-border rounded-lg text-foreground text-sm transition-colors focus:outline-none focus:border-foreground-muted placeholder:text-foreground-muted"
                  @keydown.enter.prevent="addTopic"
                />
                <button type="button" @click="addTopic" class="px-6 py-3 bg-background-card border border-border rounded-lg text-foreground cursor-pointer transition-all hover:bg-background-card-hover">Ajouter</button>
              </div>
              <div class="flex flex-wrap gap-2">
                <span v-for="topic in form.speakerTopics" :key="topic" class="flex items-center gap-2 px-4 py-2 bg-background-card border border-border rounded-full text-sm">
                  {{ topic }}
                  <button type="button" @click="removeTopic(topic)" class="bg-transparent border-none text-foreground-muted cursor-pointer text-lg leading-none p-0 hover:text-foreground">&times;</button>
                </span>
                <span v-if="form.speakerTopics.length === 0" class="text-sm text-foreground-muted">Aucun sujet ajouté</span>
              </div>
            </div>

            <div class="flex flex-col md:flex-row gap-4 md:gap-8 mt-4">
              <label class="flex items-center gap-2 cursor-pointer text-foreground-muted hover:text-foreground transition-colors">
                <input v-model="form.remoteOk" type="checkbox" class="w-[18px] h-[18px] accent-foreground" />
                <span>Disponible en remote</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer text-foreground-muted hover:text-foreground transition-colors">
                <input v-model="form.travelWilling" type="checkbox" class="w-[18px] h-[18px] accent-foreground" />
                <span>Prête à me déplacer</span>
              </label>
            </div>
          </div>
        </section>

        <section class="py-5 border-b border-border">
          <h2 class="font-display text-xl font-medium mb-2">Liens</h2>
          <p class="text-foreground-muted text-sm mb-6">Où te trouver sur le web</p>

          <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-2">
              <label for="linkedin" class="text-xs uppercase tracking-wide text-foreground-muted">LinkedIn *</label>
              <input id="linkedin" v-model="form.linkedinUrl" type="url" placeholder="https://linkedin.com/in/..." required class="px-4 py-3 bg-background-card border border-border rounded-lg text-foreground text-sm transition-colors focus:outline-none focus:border-foreground-muted placeholder:text-foreground-muted" />
            </div>

            <div class="flex flex-col gap-2">
              <label for="website" class="text-xs uppercase tracking-wide text-foreground-muted">Site web / Portfolio</label>
              <input id="website" v-model="form.website" type="url" placeholder="https://..." class="px-4 py-3 bg-background-card border border-border rounded-lg text-foreground text-sm transition-colors focus:outline-none focus:border-foreground-muted placeholder:text-foreground-muted" />
            </div>

            <div class="flex flex-col gap-2">
              <label for="twitter" class="text-xs uppercase tracking-wide text-foreground-muted">Twitter / X</label>
              <input id="twitter" v-model="form.twitterUrl" type="url" placeholder="https://twitter.com/..." class="px-4 py-3 bg-background-card border border-border rounded-lg text-foreground text-sm transition-colors focus:outline-none focus:border-foreground-muted placeholder:text-foreground-muted" />
            </div>
          </div>
        </section>

        <section class="py-5 border-b border-border">
          <h2 class="font-display text-xl font-medium mb-4">Préférences</h2>

          <label class="flex items-start gap-3 cursor-pointer group">
            <input
              v-model="form.emailOptIn"
              type="checkbox"
              class="w-[18px] h-[18px] accent-primary mt-0.5 shrink-0"
            />
            <div class="flex flex-col gap-1">
              <span class="text-foreground group-hover:text-primary transition-colors">
                Recevoir les actualités OSLD
              </span>
              <span class="text-xs text-foreground-muted">
                News sur l'avancée du projet, sondages pour améliorer l'app. Zéro spam.
              </span>
            </div>
          </label>
        </section>

        <section v-if="isNewProfile" class="p-6 border border-primary/30 rounded-2xl bg-primary/5">
          <label class="flex items-start gap-3 cursor-pointer group">
            <input
              v-model="form.cocAccepted"
              type="checkbox"
              class="w-[18px] h-[18px] accent-primary mt-0.5 shrink-0"
            />
            <div class="flex flex-col gap-1">
              <span class="text-foreground group-hover:text-primary transition-colors">
                J'accepte le code de conduite *
              </span>
              <span class="text-xs text-foreground-muted">
                En cochant cette case, tu t'engages a respecter le
                <NuxtLink to="/coc" target="_blank" class="text-primary underline hover:text-foreground transition-colors">code de conduite</NuxtLink>
                de la communaute OSLD.
              </span>
            </div>
          </label>
        </section>

        <div class="flex justify-end gap-4 pt-8">
          <button type="submit" :disabled="saving || (isNewProfile && !form.cocAccepted)" class="px-8 py-4 bg-foreground border-none rounded-full text-background text-sm font-medium cursor-pointer transition-all hover:bg-foreground-muted disabled:opacity-50 disabled:cursor-not-allowed">
            {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        </div>
      </form>

      <section v-if="!isNewProfile" class="mt-16 pt-8 border-t border-red-500/20">
        <h2 class="text-sm font-medium text-red-400 mb-4">Zone de danger</h2>
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-red-500/20 rounded-xl">
          <div>
            <p class="text-sm text-foreground">Supprimer mon profil</p>
            <p class="text-xs text-foreground-muted mt-1">Cette action est irréversible.</p>
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
    </ClientOnly>
  </div>
</template>
