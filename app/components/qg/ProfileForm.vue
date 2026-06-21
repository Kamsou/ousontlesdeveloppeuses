<script setup lang="ts">
import { openToOptions, lookingForOptions, skillGroups, suggestedSkills, experienceOptions } from '~/utils/constants'
import type { QgProfile } from '~/types/qg'

const props = defineProps<{
  profile: QgProfile | null
  sessionUserName?: string
}>()

const emit = defineEmits<{
  saved: []
}>()

const { $clientPosthog } = useNuxtApp()
const { signOut } = useAuth()
const toast = useToast()
const validProfileTypes = [
  "L'Architecte", 'La Détective', 'La Speedrunner', 'La Perfectionniste',
  'La Connectrice', "L'Exploratrice", 'La Gardienne', 'La Créative'
]

interface ProfileFormState {
  firstName: string
  lastName: string
  bio: string
  title: string
  location: string
  yearsExperience: number | null
  website: string
  linkedinUrl: string
  twitterUrl: string
  skills: string[]
  lookingFor: string[]
  openTo: string[]
  speakerTopics: string[]
  pastTalksUrl: string
  remoteOk: boolean
  travelWilling: boolean
  emailOptIn: boolean
  commentsNotificationsEnabled: boolean
  cocAccepted: boolean
}

const form = reactive<ProfileFormState>({
  firstName: '',
  lastName: '',
  bio: '',
  title: '',
  location: '',
  yearsExperience: null,
  website: '',
  linkedinUrl: '',
  twitterUrl: '',
  skills: [],
  lookingFor: [],
  openTo: [],
  speakerTopics: [],
  pastTalksUrl: '',
  remoteOk: true,
  travelWilling: false,
  emailOptIn: false,
  commentsNotificationsEnabled: true,
  cocAccepted: false
})

const newSkill = ref('')
const newTopic = ref('')
const saving = ref(false)
const experienceDropdownOpen = ref(false)
const experienceDropdownRef = ref<HTMLElement>()

const selectedExperienceLabel = computed(() => {
  if (form.yearsExperience === null) return null
  const option = experienceOptions.find(o => o.value === form.yearsExperience)
  return option?.label ?? null
})

function selectExperience(value: number) {
  form.yearsExperience = value
  experienceDropdownOpen.value = false
}

function handleClickOutsideExperience(e: MouseEvent) {
  if (experienceDropdownRef.value && e.target instanceof Node && !experienceDropdownRef.value.contains(e.target)) {
    experienceDropdownOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutsideExperience))
onUnmounted(() => document.removeEventListener('click', handleClickOutsideExperience))
const error = ref('')
const deleting = ref(false)
const stickysentinel = ref<HTMLElement>()
const isSticky = ref(false)
const submitted = ref(false)
const isNewProfile = computed(() => !props.profile)

const lookingForDaysLeft = computed(() => {
  if (!props.profile?.lookingForSince || !props.profile?.lookingFor?.length) return null
  const since = new Date(props.profile.lookingForSince).getTime()
  const expiresAt = since + 30 * 24 * 60 * 60 * 1000
  const daysLeft = Math.ceil((expiresAt - Date.now()) / (24 * 60 * 60 * 1000))
  return daysLeft
})

const lookingForExpired = computed(() => {
  if (lookingForDaysLeft.value === null) return false
  return lookingForDaysLeft.value <= 0
})

const hasValidExperienceProfile = computed(() => {
  return props.profile?.profileType &&
    props.profile?.profilePhrase &&
    validProfileTypes.includes(props.profile.profileType)
})

const fieldErrors = computed(() => ({
  lastName: submitted.value && !form.lastName.trim() ? 'Le nom est requis' : '',
  firstName: submitted.value && !form.firstName.trim() ? 'Le prénom est requis' : '',
  linkedinUrl: submitted.value && !form.linkedinUrl.trim() ? 'Le lien LinkedIn est requis' : '',
  cocAccepted: submitted.value && isNewProfile.value && !form.cocAccepted ? 'Tu dois accepter le code de conduite' : ''
}))
function toggleSkill(skill: string) {
  const index = form.skills.indexOf(skill)
  if (index > -1) {
    form.skills.splice(index, 1)
  } else {
    form.skills.push(skill)
  }
}

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

function toggleLookingFor(value: string) {
  const index = form.lookingFor.indexOf(value)
  if (index > -1) {
    form.lookingFor.splice(index, 1)
  } else {
    form.lookingFor.push(value)
  }
}

async function save() {
  submitted.value = true

  const hasErrors = Object.values(fieldErrors.value).some(Boolean)
  if (hasErrors) return

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
    } else if (props.profile) {
      await $fetch(`/api/developers/${props.profile.id}`, {
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
    await $fetch('/api/developers/me', { method: 'DELETE' })
    $clientPosthog?.capture('profile_deleted')
    await signOut({ callbackUrl: '/' })
  } catch (e: any) {
    error.value = e.data?.message || 'Erreur lors de la suppression'
    deleting.value = false
  }
}
watch(() => props.profile, (p) => {
  if (p) {
    const nameParts = (p.name || '').split(' ')
    form.firstName = nameParts[0] || ''
    form.lastName = nameParts.slice(1).join(' ') || ''
    form.bio = p.bio || ''
    form.title = p.title || ''
    form.location = p.location || ''
    form.yearsExperience = p.yearsExperience
    form.website = p.website || ''
    form.linkedinUrl = p.linkedinUrl || ''
    form.twitterUrl = p.twitterUrl || ''
    form.skills = p.skills || []
    form.lookingFor = p.lookingFor || []
    form.openTo = p.openTo || []
    form.speakerTopics = p.speakerProfile?.topics || []
    form.pastTalksUrl = p.speakerProfile?.pastTalksUrl || ''
    form.remoteOk = p.speakerProfile?.remoteOk ?? true
    form.travelWilling = p.speakerProfile?.travelWilling ?? false
    form.emailOptIn = p.emailOptIn ?? false
    form.commentsNotificationsEnabled = p.commentsNotificationsEnabled ?? true
  } else if (props.sessionUserName) {
    const nameParts = props.sessionUserName.split(' ')
    form.firstName = nameParts[0] || ''
    form.lastName = nameParts.slice(1).join(' ') || ''
  }
}, { immediate: true })

useIntersectionObserver(stickysentinel, (entries) => {
  isSticky.value = !entries[0]?.isIntersecting
}, { threshold: 0 })
</script>

<template>
  <div>
    <ClientOnly>
      <template #fallback>
        <div class="animate-pulse space-y-8">
          <div class="py-5 border-b border-border/20">
            <div class="h-6 bg-border/50 rounded w-24 mb-6"></div>
            <div class="space-y-6">
              <div class="h-12 bg-border/50 rounded"></div>
              <div class="h-24 bg-border/50 rounded"></div>
            </div>
          </div>
        </div>
      </template>

      <div v-if="isNewProfile" class="mb-8 p-4 bg-primary/10 border border-primary/30 rounded-xl">
        <p class="text-sm text-foreground">
          Cet espace est reservé aux <strong>développeuses francophones</strong>, contente de t'accueillir !
        </p>
      </div>

      <section v-if="hasValidExperienceProfile" class="mb-10 relative group">
        <div class="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div class="relative p-6 md:p-8 border-2 border-border/15 rounded-2xl">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div class="flex-1 min-w-0">
              <span class="text-[0.6rem] uppercase tracking-[0.25em] text-foreground-muted mb-2 block">Ton profil quiz</span>
              <p class="font-display text-2xl md:text-3xl font-bold tracking-tight mb-1">{{ profile?.profileType }}</p>
              <p class="text-foreground-muted text-sm leading-relaxed">{{ profile?.profilePhrase }}</p>
            </div>
            <NuxtLink to="/experience" class="group/btn flex items-center gap-3 px-5 py-3 border border-b-[3px] border-primary/20 border-b-primary/60 rounded-full transition-all duration-300 shrink-0 hover:border-primary/40 hover:bg-primary/[0.03] hover:shadow-glow hover:-translate-y-0.5 active:translate-y-px active:border-b active:shadow-none">
              <span class="text-sm text-foreground-muted group-hover/btn:text-foreground transition-colors">Refaire</span>
              <span class="w-6 h-6 flex items-center justify-center rounded-full bg-subtle group-hover/btn:bg-foreground/10 transition-colors">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-foreground-muted group-hover/btn:text-foreground transition-colors">
                  <path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
                </svg>
              </span>
            </NuxtLink>
          </div>
        </div>
      </section>

      <form @submit.prevent="save" novalidate>
        <div v-if="error" class="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 mb-8">{{ error }}</div>

        <section class="py-5 border-b border-border/20">
          <h2 class="font-display text-xl font-bold mb-4">Identité</h2>

          <div class="flex flex-col gap-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="flex flex-col gap-2">
                <label for="lastName" class="text-xs uppercase tracking-wide text-foreground-muted">Nom *</label>
                <input id="lastName" v-model="form.lastName" type="text" :class="['px-4 py-3 bg-background-card border rounded-lg text-foreground text-sm transition-colors focus:outline-none', fieldErrors.lastName ? 'border-red-500/50 focus:border-red-500' : 'border-border/20 focus:border-foreground-muted']" />
                <p v-if="fieldErrors.lastName" class="text-xs text-red-700 dark:text-red-400">{{ fieldErrors.lastName }}</p>
              </div>
              <div class="flex flex-col gap-2">
                <label for="firstName" class="text-xs uppercase tracking-wide text-foreground-muted">Prénom *</label>
                <input id="firstName" v-model="form.firstName" type="text" :class="['px-4 py-3 bg-background-card border rounded-lg text-foreground text-sm transition-colors focus:outline-none', fieldErrors.firstName ? 'border-red-500/50 focus:border-red-500' : 'border-border/20 focus:border-foreground-muted']" />
                <p v-if="fieldErrors.firstName" class="text-xs text-red-700 dark:text-red-400">{{ fieldErrors.firstName }}</p>
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <label for="email" class="text-xs uppercase tracking-wide text-foreground-muted">Email</label>
              <input id="email" :value="profile?.email || 'Non renseigné'" type="email" disabled class="px-4 py-3 bg-border/5 border border-border/20 rounded-lg text-foreground text-sm cursor-not-allowed opacity-60" />
              <p class="text-xs text-foreground-muted">Synchronisé automatiquement depuis GitHub</p>
            </div>

            <div class="flex flex-col gap-2">
              <label for="title" class="text-xs uppercase tracking-wide text-foreground-muted">En quelques mots</label>
              <div class="relative">
                <input id="title" v-model="form.title" type="text" maxlength="120" placeholder="Ex : Dev fullstack Vue/Node, freelance..." class="w-full px-4 py-3 bg-background-card border border-border/20 rounded-lg text-foreground text-sm transition-colors focus:outline-none focus:border-foreground-muted placeholder:text-foreground-muted/40" />
                <span v-if="form.title.length > 80" class="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] tabular-nums text-foreground-muted/40">{{ form.title.length }}/120</span>
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <label for="bio" class="text-xs uppercase tracking-wide text-foreground-muted">Bio</label>
              <textarea id="bio" v-model="form.bio" rows="3" placeholder="Ex : Ce que tu fais, ce qui te passionne..." class="px-4 py-3 bg-background-card border border-border/20 rounded-lg text-foreground text-sm transition-colors focus:outline-none focus:border-foreground-muted resize-y min-h-[80px] placeholder:text-foreground-muted/40"></textarea>
            </div>
          </div>
        </section>

        <section class="py-5 border-b border-border/20">
          <h2 class="font-display text-xl font-bold mb-4">Localisation & Expérience</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <label for="location" class="text-xs uppercase tracking-wide text-foreground-muted">Ville</label>
              <input id="location" v-model="form.location" type="text" placeholder="Ex : Paris" class="px-4 py-3 bg-background-card border border-border/20 rounded-lg text-foreground text-sm transition-colors focus:outline-none focus:border-foreground-muted placeholder:text-foreground-muted/40" />
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-xs uppercase tracking-wide text-foreground-muted">Expérience</label>
              <div ref="experienceDropdownRef" class="relative z-30">
                <button
                  type="button"
                  @click="experienceDropdownOpen = !experienceDropdownOpen"
                  class="w-full flex items-center justify-between px-4 py-3 bg-background-card border border-border/20 rounded-lg text-sm transition-colors focus:outline-none focus:border-foreground-muted"
                  :class="selectedExperienceLabel ? 'text-foreground' : 'text-foreground-muted'"
                >
                  <span>{{ selectedExperienceLabel || 'Sélectionner' }}</span>
                  <svg class="w-4 h-4 text-foreground-muted transition-transform" :class="experienceDropdownOpen && 'rotate-180'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </button>
                <Transition
                  enter-active-class="transition duration-150 ease-out"
                  enter-from-class="opacity-0 -translate-y-1"
                  enter-to-class="opacity-100 translate-y-0"
                  leave-active-class="transition duration-100 ease-in"
                  leave-from-class="opacity-100 translate-y-0"
                  leave-to-class="opacity-0 -translate-y-1"
                >
                  <div v-if="experienceDropdownOpen" class="absolute z-50 top-full left-0 right-0 mt-1 bg-background border border-border/20 rounded-lg shadow-lg overflow-hidden">
                    <button
                      v-for="option in experienceOptions"
                      :key="option.value"
                      type="button"
                      @click="selectExperience(option.value)"
                      class="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-foreground/5"
                      :class="form.yearsExperience === option.value ? 'text-foreground font-medium' : 'text-foreground-muted'"
                    >
                      {{ option.label }}
                    </button>
                  </div>
                </Transition>
              </div>
            </div>
          </div>
        </section>

        <section class="py-5 border-b border-border/20">
          <h2 id="competences-label" class="font-display text-xl font-bold mb-2">Compétences</h2>
          <p class="text-foreground-muted text-sm mb-4">Clique pour ajouter ou retirer</p>

          <div class="space-y-3 mb-6">
            <div v-for="group in skillGroups" :key="group.label">
              <span class="text-[10px] uppercase tracking-wide text-foreground-muted/50 mb-1.5 block">{{ group.label }}</span>
              <div class="flex flex-wrap gap-2 md:gap-1.5">
                <button
                  v-for="skill in group.skills"
                  :key="skill"
                  type="button"
                  :class="[
                    'px-4 py-2 md:px-3 md:py-1 border rounded-full cursor-pointer text-sm md:text-xs transition-all',
                    form.skills.includes(skill)
                      ? 'bg-primary/10 border-primary/40 text-primary'
                      : 'bg-transparent border-border/40 text-foreground-muted hover:border-border/10 hover:text-foreground'
                  ]"
                  @click="toggleSkill(skill)"
                >
                  {{ skill }}
                </button>
              </div>
            </div>
          </div>

          <div class="flex gap-2 mb-4">
            <input
              id="new-skill"
              v-model="newSkill"
              type="text"
              placeholder="Autre compétence..."
              aria-labelledby="competences-label"
              class="flex-1 px-4 py-3 bg-background-card border border-border/20 rounded-lg text-foreground text-sm transition-colors focus:outline-none focus:border-foreground-muted placeholder:text-foreground-muted/40"
              @keydown.enter.prevent="addSkill"
            />
            <button type="button" @click="addSkill" class="px-6 py-3 bg-background-card border border-b-[3px] border-primary/20 border-b-primary/60 rounded-lg text-foreground cursor-pointer transition-all hover:border-primary/40 hover:bg-primary/[0.03] hover:shadow-glow hover:-translate-y-0.5 active:translate-y-px active:border-b active:shadow-none">Ajouter</button>
          </div>

          <div v-if="form.skills.some(s => !suggestedSkills.includes(s))" class="flex flex-wrap gap-2">
            <template v-for="skill in form.skills" :key="skill">
              <span v-if="!suggestedSkills.includes(skill)" class="flex items-center gap-2 px-4 py-2 bg-background-card border border-border/10 rounded-full text-sm">
                {{ skill }}
                <button type="button" @click="removeSkill(skill)" class="bg-transparent border-none text-foreground-muted cursor-pointer text-lg leading-none p-0 hover:text-foreground">&times;</button>
              </span>
            </template>
          </div>
        </section>

        <section class="py-5 border-b border-border/20">
          <h2 class="font-display text-xl font-bold mb-2">En recherche active</h2>
          <p class="text-foreground-muted text-sm mb-6">Tu cherches activement ? Signale-le sur ton profil. Visible 30 jours, renouvelable.</p>

          <div v-if="lookingForExpired && profile?.lookingFor?.length" class="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <p class="text-sm text-amber-700 dark:text-amber-400">Ta recherche a expiré. Enregistre pour la renouveler.</p>
          </div>
          <div v-else-if="lookingForDaysLeft !== null && lookingForDaysLeft <= 7 && lookingForDaysLeft > 0" class="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <p class="text-sm text-amber-700 dark:text-amber-400">Ta recherche expire dans {{ lookingForDaysLeft }} jour{{ lookingForDaysLeft > 1 ? 's' : '' }}. Enregistre pour la renouveler.</p>
          </div>

          <div class="flex flex-col md:flex-row flex-wrap gap-3">
            <button
              v-for="option in lookingForOptions"
              :key="option.value"
              type="button"
              :class="[
                'px-5 py-2.5 border rounded-full cursor-pointer text-sm transition-all w-full md:w-auto text-center',
                form.lookingFor.includes(option.value)
                  ? 'bg-primary/10 border-primary/40 text-primary'
                  : 'bg-transparent border-border/40 text-foreground-muted hover:border-border/10 hover:text-foreground'
              ]"
              @click="toggleLookingFor(option.value)"
            >
              {{ option.label }}
            </button>
          </div>
        </section>

        <section class="py-5 border-b border-border/20">
          <h2 class="font-display text-xl font-bold mb-2">Échanges</h2>
          <p class="text-foreground-muted text-sm mb-6">Quels types d'échanges t'intéressent ?</p>

          <div class="flex flex-col md:flex-row flex-wrap gap-3">
            <button
              v-for="option in openToOptions"
              :key="option.value"
              type="button"
              :class="[
                'px-5 py-2.5 border rounded-full cursor-pointer text-sm transition-all w-full md:w-auto text-center',
                form.openTo.includes(option.value)
                  ? 'bg-primary/10 border-primary/40 text-primary'
                  : 'bg-transparent border-border/40 text-foreground-muted hover:border-border/10 hover:text-foreground'
              ]"
              @click="toggleOpenTo(option.value)"
            >
              {{ option.label }}
            </button>
          </div>

          <div v-if="form.openTo.includes('conference')" class="mt-8 pt-8 border-t border-border/20">
            <h3 class="font-bold text-lg mb-2">Profil Speakeuse</h3>
            <p class="text-foreground-muted text-sm mb-6">Infos pour les organisateurs d'événements</p>

            <div class="flex flex-col gap-2 mb-4">
              <label for="new-topic" class="text-xs uppercase tracking-wide text-foreground-muted">Sujets de talk</label>
              <div class="flex gap-2 mb-4">
                <input
                  id="new-topic"
                  v-model="newTopic"
                  type="text"
                  placeholder="Ex : Vue.js, Women in Tech..."
                  class="flex-1 px-4 py-3 bg-background-card border border-border/20 rounded-lg text-foreground text-sm transition-colors focus:outline-none focus:border-foreground-muted placeholder:text-foreground-muted/40"
                  @keydown.enter.prevent="addTopic"
                />
                <button type="button" @click="addTopic" class="px-6 py-3 bg-background-card border border-b-[3px] border-primary/20 border-b-primary/60 rounded-lg text-foreground cursor-pointer transition-all hover:border-primary/40 hover:bg-primary/[0.03] hover:shadow-glow hover:-translate-y-0.5 active:translate-y-px active:border-b active:shadow-none">Ajouter</button>
              </div>
              <div class="flex flex-wrap gap-2">
                <span v-for="topic in form.speakerTopics" :key="topic" class="flex items-center gap-2 px-4 py-2 bg-background-card border border-border/10 rounded-full text-sm">
                  {{ topic }}
                  <button type="button" @click="removeTopic(topic)" class="bg-transparent border-none text-foreground-muted cursor-pointer text-lg leading-none p-0 hover:text-foreground">&times;</button>
                </span>
                <span v-if="form.speakerTopics.length === 0" class="text-sm text-foreground-muted">Aucun sujet ajouté</span>
              </div>
            </div>

            <div class="flex flex-col gap-2 mb-4">
              <label for="past-talks" class="text-xs uppercase tracking-wide text-foreground-muted">Talks passés</label>
              <input
                id="past-talks"
                v-model="form.pastTalksUrl"
                type="url"
                placeholder="Lien vers une vidéo, des slides, ta page Sessionize..."
                class="w-full px-4 py-3 bg-background-card border border-border/20 rounded-lg text-foreground text-sm transition-colors focus:outline-none focus:border-foreground-muted placeholder:text-foreground-muted/40"
              />
              <span class="text-xs text-foreground-muted">Aide les organisateurs à découvrir tes interventions précédentes.</span>
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

        <section class="py-5 border-b border-border/20">
          <h2 class="font-display text-xl font-bold mb-2">Liens</h2>
          <p class="text-foreground-muted text-sm mb-6">Où te trouver sur le web</p>

          <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-2">
              <label for="linkedin" class="text-xs uppercase tracking-wide text-foreground-muted">LinkedIn *</label>
              <input id="linkedin" v-model="form.linkedinUrl" type="url" placeholder="https://linkedin.com/in/..." :class="['px-4 py-3 bg-background-card border rounded-lg text-foreground text-sm transition-colors focus:outline-none placeholder:text-foreground-muted', fieldErrors.linkedinUrl ? 'border-red-500/50 focus:border-red-500' : 'border-border/20 focus:border-foreground-muted']" />
              <p v-if="fieldErrors.linkedinUrl" class="text-xs text-red-700 dark:text-red-400">{{ fieldErrors.linkedinUrl }}</p>
            </div>

            <div class="flex flex-col gap-2">
              <label for="website" class="text-xs uppercase tracking-wide text-foreground-muted">Site web / Portfolio</label>
              <input id="website" v-model="form.website" type="url" placeholder="https://..." class="px-4 py-3 bg-background-card border border-border/20 rounded-lg text-foreground text-sm transition-colors focus:outline-none focus:border-foreground-muted placeholder:text-foreground-muted/40" />
            </div>

            <div class="flex flex-col gap-2">
              <label for="twitter" class="text-xs uppercase tracking-wide text-foreground-muted">Twitter / X</label>
              <input id="twitter" v-model="form.twitterUrl" type="url" placeholder="https://twitter.com/..." class="px-4 py-3 bg-background-card border border-border/20 rounded-lg text-foreground text-sm transition-colors focus:outline-none focus:border-foreground-muted placeholder:text-foreground-muted/40" />
            </div>
          </div>
        </section>

        <section class="py-5 border-b border-border/20">
          <h2 class="font-display text-xl font-bold mb-4">Préférences</h2>

          <div class="space-y-4">
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

            <label class="flex items-start gap-3 cursor-pointer group">
              <input
                v-model="form.commentsNotificationsEnabled"
                type="checkbox"
                class="w-[18px] h-[18px] accent-primary mt-0.5 shrink-0"
              />
              <div class="flex flex-col gap-1">
                <span class="text-foreground group-hover:text-primary transition-colors">
                  Notifications de commentaires
                </span>
                <span class="text-xs text-foreground-muted">
                  Recevoir un email quand quelqu'un commente tes opportunités ou répond à tes commentaires
                </span>
              </div>
            </label>
          </div>
        </section>

        <section v-if="isNewProfile" :class="['p-6 rounded-2xl', fieldErrors.cocAccepted ? 'border border-red-500/50 bg-red-500/5' : 'border border-primary/30 bg-primary/5']">
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
              <span v-if="fieldErrors.cocAccepted" class="text-xs text-red-700 dark:text-red-400">{{ fieldErrors.cocAccepted }}</span>
            </div>
          </label>
        </section>

        <div ref="stickysentinel" class="h-0" aria-hidden="true"></div>
        <div :class="['sticky bottom-[calc(3.5rem+env(safe-area-inset-bottom,0px))] md:bottom-0 -mx-6 px-6 py-3 bg-background/90 backdrop-blur-lg mt-6 transition-colors', isSticky ? 'border-t border-border/20' : '', experienceDropdownOpen ? 'z-0' : 'z-40']">
          <div class="flex md:justify-end">
            <button type="submit" :disabled="saving || (isNewProfile && !form.cocAccepted)" class="w-full md:w-auto px-8 py-4 bg-foreground border border-b-[3px] border-foreground border-b-foreground-muted/50 rounded-full text-background text-sm font-medium cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-glow active:translate-y-px active:border-b active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed">
              {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </div>
      </form>

      <section v-if="!isNewProfile" class="mt-10 pt-8 border-t border-red-500/20">
        <h2 class="text-sm font-bold text-red-700 dark:text-red-400 mb-4 uppercase tracking-wide">Zone de danger</h2>
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-red-500/20 rounded-xl">
          <div>
            <p class="text-sm text-foreground">Supprimer mon profil</p>
            <p class="text-xs text-foreground-muted mt-1">Cette action est irréversible.</p>
          </div>
          <button
            type="button"
            @click="deleteProfile"
            :disabled="deleting"
            class="px-6 py-3 bg-transparent border border-red-500/30 text-red-700 dark:text-red-400 rounded-full text-sm cursor-pointer transition-all hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ deleting ? 'Suppression...' : 'Supprimer' }}
          </button>
        </div>
      </section>
    </ClientOnly>
  </div>
</template>
