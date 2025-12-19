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
  skills: string[]
  openTo: string[]
  speakerProfile: {
    topics: string[]
    available: boolean | null
    remoteOk: boolean | null
    travelWilling: boolean | null
  } | null
}

useSeoMeta({
  title: 'Mon Profil - OSLD',
  robots: 'noindex, nofollow'
})

const { data: session, status } = useAuth()
const router = useRouter()

if (status.value !== 'authenticated') {
  navigateTo('/')
}

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
</script>

<template>
  <div class="profil-edit">
    <header class="page-header">
      <span class="page-label">
        <span class="label-line"></span>
        {{ isNewProfile ? 'Créer' : 'Modifier' }} mon profil
      </span>
      <h1 class="page-title">{{ isNewProfile ? 'Bienvenue' : 'Mon profil' }}</h1>
    </header>

    <form @submit.prevent="save" class="form">
      <div v-if="error" class="error-message">{{ error }}</div>

      <section class="form-section">
        <h2 class="section-title">Informations</h2>

        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Nom *</label>
            <input v-model="form.name" type="text" required class="form-input" />
          </div>

          <div class="form-group">
            <label class="form-label">Ville</label>
            <input v-model="form.location" type="text" placeholder="Paris" class="form-input" />
          </div>

          <div class="form-group">
            <label class="form-label">Années d'expérience</label>
            <input v-model.number="form.yearsExperience" type="number" min="0" max="50" class="form-input" />
          </div>

          <div class="form-group">
            <label class="form-label">Site web</label>
            <input v-model="form.website" type="url" placeholder="https://" class="form-input" />
          </div>

          <div class="form-group">
            <label class="form-label">LinkedIn *</label>
            <input v-model="form.linkedinUrl" type="url" placeholder="https://linkedin.com/in/..." class="form-input" required />
          </div>

          <div class="form-group">
            <label class="form-label">Twitter/X</label>
            <input v-model="form.twitterUrl" type="url" placeholder="https://twitter.com/..." class="form-input" />
          </div>
        </div>

        <div class="form-group full-width">
          <label class="form-label">Bio</label>
          <textarea v-model="form.bio" rows="4" placeholder="Présentez-vous en quelques mots..." class="form-textarea"></textarea>
        </div>
      </section>

      <section class="form-section">
        <h2 class="section-title">Technologies</h2>

        <div class="skills-input">
          <input
            v-model="newSkill"
            type="text"
            placeholder="Ajouter une techno..."
            class="form-input"
            @keydown.enter.prevent="addSkill"
          />
          <button type="button" @click="addSkill" class="btn-add">Ajouter</button>
        </div>

        <div class="skills-list">
          <span v-for="skill in form.skills" :key="skill" class="skill-tag">
            {{ skill }}
            <button type="button" @click="removeSkill(skill)" class="remove-btn">&times;</button>
          </span>
        </div>
      </section>

      <section class="form-section">
        <h2 class="section-title">Disponible pour</h2>
        <p class="section-description">Indiquez ce pour quoi vous êtes disponible</p>

        <div class="open-to-grid">
          <button
            v-for="option in openToOptions"
            :key="option.value"
            type="button"
            :class="['open-to-btn', { active: form.openTo.includes(option.value) }]"
            @click="toggleOpenTo(option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </section>

      <section v-if="form.openTo.includes('conference')" class="form-section">
        <h2 class="section-title">Profil Speakeuse</h2>
        <p class="section-description">Informations pour les organisateurs d'événements</p>

        <div class="form-group">
          <label class="form-label">Sujets de talk</label>
          <div class="skills-input">
            <input
              v-model="newTopic"
              type="text"
              placeholder="React, Women in Tech..."
              class="form-input"
              @keydown.enter.prevent="addTopic"
            />
            <button type="button" @click="addTopic" class="btn-add">Ajouter</button>
          </div>
          <div class="skills-list">
            <span v-for="topic in form.speakerTopics" :key="topic" class="skill-tag">
              {{ topic }}
              <button type="button" @click="removeTopic(topic)" class="remove-btn">&times;</button>
            </span>
          </div>
        </div>

        <div class="checkbox-group">
          <label class="checkbox-label">
            <input v-model="form.remoteOk" type="checkbox" />
            <span>Disponible en remote</span>
          </label>
          <label class="checkbox-label">
            <input v-model="form.travelWilling" type="checkbox" />
            <span>Prête à me déplacer</span>
          </label>
        </div>
      </section>

      <div class="form-actions">
        <NuxtLink to="/annuaire" class="btn-cancel">Annuler</NuxtLink>
        <button type="submit" :disabled="saving" class="btn-save">
          {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.profil-edit {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem 4rem;
}

.page-header {
  padding: 3rem 0;
  border-bottom: 1px solid var(--border);
  margin-bottom: 2rem;
}

.page-label {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--text-muted);
  margin-bottom: 1rem;
}

.label-line {
  width: 40px;
  height: 1px;
  background: var(--text-muted);
}

.page-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 3rem;
  font-weight: 500;
  letter-spacing: -0.03em;
}

.error-message {
  padding: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  color: #ef4444;
  margin-bottom: 2rem;
}

.form-section {
  padding: 2rem 0;
  border-bottom: 1px solid var(--border);
}

.section-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.section-description {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
}

.form-input,
.form-textarea {
  padding: 0.75rem 1rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  font-size: 0.9rem;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--text-muted);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.skills-input {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.btn-add {
  padding: 0.75rem 1.5rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}

.btn-add:hover {
  background: var(--bg-card-hover);
}

.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.skill-tag {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 100px;
  font-size: 0.85rem;
}

.remove-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 1.2rem;
  line-height: 1;
  padding: 0;
}

.remove-btn:hover {
  color: var(--text);
}

.open-to-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.open-to-btn {
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 100px;
  color: var(--text-muted);
  cursor: pointer;
  font-family: inherit;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.open-to-btn:hover {
  border-color: var(--text);
  color: var(--text);
}

.open-to-btn.active {
  background: var(--text);
  border-color: var(--text);
  color: var(--bg);
}

.checkbox-group {
  display: flex;
  gap: 2rem;
  margin-top: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: var(--text-muted);
}

.checkbox-label input {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 2rem;
}

.btn-cancel {
  padding: 1rem 2rem;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 100px;
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn-cancel:hover {
  border-color: var(--text);
  color: var(--text);
}

.btn-save {
  padding: 1rem 2rem;
  background: var(--text);
  border: none;
  border-radius: 100px;
  color: var(--bg);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}

.btn-save:hover:not(:disabled) {
  background: var(--text-muted);
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .profil-edit {
    padding: 0 1.5rem 4rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .open-to-grid {
    flex-direction: column;
  }

  .open-to-btn {
    width: 100%;
    text-align: center;
  }

  .checkbox-group {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
