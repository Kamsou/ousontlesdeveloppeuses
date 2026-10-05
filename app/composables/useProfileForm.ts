import type { InjectionKey } from 'vue'
import { LINKEDIN_URL_PATTERN } from '#shared/utils/profile'
import type { QgProfile } from '~/types/qg'

export interface ProfileFormState {
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
  cocAccepted: boolean
}

export type ProfileField = 'firstName' | 'lastName' | 'linkedinUrl' | 'cocAccepted'

const FIELD_INPUT_IDS: Record<ProfileField, string> = {
  firstName: 'firstName',
  lastName: 'lastName',
  linkedinUrl: 'linkedin',
  cocAccepted: 'coc'
}

export const PROFILE_STEPS: { key: string, label: string, fields: ProfileField[] }[] = [
  { key: 'toi', label: 'Toi', fields: ['firstName', 'lastName'] },
  { key: 'stack', label: 'Ta stack', fields: [] },
  { key: 'contact', label: 'Te trouver', fields: ['linkedinUrl', 'cocAccepted'] }
]

export function normalizeUrl(raw: string) {
  const value = raw.trim()
  if (!value) return ''
  return /^https?:\/\//i.test(value) ? value.replace(/^http:/i, 'https:') : `https://${value}`
}

export function normalizeLinkedinUrl(raw: string) {
  const value = normalizeUrl(raw)
  if (!value) return ''
  try {
    const url = new URL(value)
    if (!url.hostname.endsWith('linkedin.com')) return value
    return `https://www.linkedin.com${url.pathname}`
  } catch {
    return value
  }
}

export function useProfileForm(profile: Ref<QgProfile | null>, sessionUser: Ref<{ name?: string | null, email?: string | null, image?: string | null } | undefined>) {
  const { $clientPosthog } = useNuxtApp()

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
    cocAccepted: false
  })

  const touched = reactive(new Set<ProfileField>())
  const saving = ref(false)
  const serverError = ref('')

  const isNew = computed(() => !profile.value)
  const email = computed(() => profile.value?.email ?? sessionUser.value?.email ?? null)
  const avatarUrl = computed(() => profile.value?.avatarUrl ?? sessionUser.value?.image ?? null)
  const fullName = computed(() => `${form.firstName.trim()} ${form.lastName.trim()}`.trim())

  const errors = computed<Record<ProfileField, string>>(() => {
    const linkedin = form.linkedinUrl.trim()
    return {
      firstName: form.firstName.trim() ? '' : 'Ton prénom est requis',
      lastName: form.lastName.trim() ? '' : 'Ton nom est requis',
      linkedinUrl: !linkedin
        ? 'Ton lien LinkedIn est requis'
        : LINKEDIN_URL_PATTERN.test(normalizeLinkedinUrl(linkedin)) ? '' : 'Colle l\'adresse de ton profil, par exemple linkedin.com/in/ton-nom',
      cocAccepted: !isNew.value || form.cocAccepted ? '' : 'Accepte le code de conduite pour rejoindre l\'annuaire'
    }
  })

  function fieldError(field: ProfileField) {
    return touched.has(field) ? errors.value[field] : ''
  }

  function touch(field: ProfileField) {
    touched.add(field)
  }

  function normalizeLinks() {
    form.linkedinUrl = normalizeLinkedinUrl(form.linkedinUrl)
    form.website = normalizeUrl(form.website)
    form.twitterUrl = normalizeUrl(form.twitterUrl)
    form.pastTalksUrl = normalizeUrl(form.pastTalksUrl)
  }

  function validateAndFocus(fields: ProfileField[]) {
    fields.forEach(field => touched.add(field))
    const invalid = fields.find(field => errors.value[field])
    if (invalid) document.getElementById(FIELD_INPUT_IDS[invalid])?.focus()
    return !invalid
  }

  function toggle(list: 'skills' | 'openTo' | 'lookingFor', value: string) {
    const index = form[list].indexOf(value)
    if (index > -1) {
      form[list].splice(index, 1)
    } else {
      form[list].push(value)
    }
  }

  function addTo(list: 'skills' | 'speakerTopics', raw: string) {
    const added = raw.split(',').map(value => value.trim()).filter(value => value && !form[list].includes(value))
    form[list].push(...added)
    return added.length > 0
  }

  function removeFrom(list: 'skills' | 'speakerTopics', value: string) {
    form[list] = form[list].filter(item => item !== value)
  }

  async function save() {
    normalizeLinks()
    saving.value = true
    serverError.value = ''
    const payload = { ...form, name: fullName.value }
    try {
      if (profile.value) {
        await $fetch(`/api/developers/${profile.value.id}`, { method: 'PUT', body: payload })
        $clientPosthog?.capture('profile_updated')
        return { slug: profile.value.slug }
      }
      const created = await $fetch<{ id: number, slug: string }>('/api/developers', { method: 'POST', body: payload })
      $clientPosthog?.capture('profile_created', {
        location: form.location,
        skills_count: form.skills.length,
        is_speaker: form.openTo.includes('conference')
      })
      return { slug: created.slug }
    } catch (e: any) {
      serverError.value = e.data?.message || 'Une erreur est survenue, réessaie dans un instant.'
      return null
    } finally {
      saving.value = false
    }
  }

  watch(profile, (p) => {
    if (!p) return
    const [first = '', ...rest] = (p.name || '').split(' ')
    form.firstName = first
    form.lastName = rest.join(' ')
    form.bio = p.bio || ''
    form.title = p.title || ''
    form.location = p.location || ''
    form.yearsExperience = p.yearsExperience
    form.website = p.website || ''
    form.linkedinUrl = p.linkedinUrl || ''
    form.twitterUrl = p.twitterUrl || ''
    form.skills = [...(p.skills || [])]
    form.lookingFor = [...(p.lookingFor || [])]
    form.openTo = [...(p.openTo || [])]
    form.speakerTopics = [...(p.speakerProfile?.topics || [])]
    form.pastTalksUrl = p.speakerProfile?.pastTalksUrl || ''
    form.remoteOk = p.speakerProfile?.remoteOk ?? true
    form.travelWilling = p.speakerProfile?.travelWilling ?? false
    form.emailOptIn = p.emailOptIn ?? false
  }, { immediate: true })

  // Only the name (a string) is watched: the session object is replaced on every refetch (tab focus)
  watch(() => sessionUser.value?.name, (name) => {
    if (profile.value || !name || form.firstName || form.lastName) return
    const [first = '', ...rest] = name.split(' ')
    form.firstName = first
    form.lastName = rest.join(' ')
  }, { immediate: true })

  return { form, isNew, email, avatarUrl, fullName, errors, fieldError, touch, normalizeLinks, validateAndFocus, toggle, addTo, removeFrom, save, saving, serverError }
}

export type ProfileFormApi = ReturnType<typeof useProfileForm>

export const profileFormKey: InjectionKey<ProfileFormApi> = Symbol('profile-form')

export function useInjectedProfileForm() {
  const api = inject(profileFormKey)
  if (!api) throw new Error('useInjectedProfileForm must be used inside a profile form')
  return api
}

export function profileInputClass(invalid = false) {
  return [
    'w-full px-4 py-3 bg-background-card border rounded-xl text-foreground text-sm transition-colors motion-reduce:transition-none placeholder:text-foreground-muted/70',
    invalid ? 'border-red-500/60' : 'border-border/15 hover:border-border/30 focus:border-foreground/50'
  ]
}
