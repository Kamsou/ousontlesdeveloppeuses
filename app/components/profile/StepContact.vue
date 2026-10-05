<script setup lang="ts">
import { openToOptions, lookingForOptions } from '~/utils/constants'

const { form, isNew, fieldError, touch, normalizeLinks, toggle, addTo, removeFrom } = useInjectedProfileForm()

const newTopic = ref('')

const isSpeaker = computed(() => form.openTo.includes('conference'))

function addTopic() {
  if (addTo('speakerTopics', newTopic.value)) newTopic.value = ''
}

function handleTopicKeydown(e: KeyboardEvent) {
  if (e.key !== 'Enter' && e.key !== ',') return
  e.preventDefault()
  addTopic()
}

function handleLinkedinBlur() {
  normalizeLinks()
  touch('linkedinUrl')
}
</script>

<template>
  <div class="flex flex-col gap-8">
    <fieldset class="min-w-0">
      <legend class="text-sm font-medium text-foreground mb-1">Disponible pour</legend>
      <p class="text-xs text-foreground-muted mb-3">Ce que tu acceptes qu'on te propose.</p>
      <div class="flex flex-wrap gap-2">
        <ProfileChip v-for="option in openToOptions" :key="option.value" :selected="form.openTo.includes(option.value)" @click="toggle('openTo', option.value)">
          {{ option.label }}
        </ProfileChip>
      </div>
    </fieldset>

    <div v-if="isSpeaker" class="flex flex-col gap-5 p-5 md:p-6 rounded-2xl border border-border/10 bg-background-card">
      <div>
        <p class="font-mono text-xs text-foreground-muted"># speakeuse</p>
        <p class="text-sm text-foreground-muted mt-1">Tu apparaîtras sur la page Speakeuses. Ces infos aident les orgas à te proposer le bon événement.</p>
      </div>

      <ProfileField id="new-topic" label="Sujets de talk" hint="Entrée ou virgule pour ajouter.">
        <template #default="{ describedBy }">
          <div class="flex gap-2">
            <input id="new-topic" v-model="newTopic" type="text" placeholder="Accessibilité, Vue.js, reconversion" :aria-describedby="describedBy" :class="profileInputClass()" @keydown="handleTopicKeydown" />
            <button type="button" class="shrink-0 px-5 rounded-xl border border-border/20 text-sm text-foreground cursor-pointer hover:border-foreground/50 transition-colors" @click="addTopic">Ajouter</button>
          </div>
        </template>
      </ProfileField>

      <ul v-if="form.speakerTopics.length" class="flex flex-wrap gap-2" aria-label="Sujets ajoutés">
        <li v-for="topic in form.speakerTopics" :key="topic" class="inline-flex items-center gap-1 pl-3.5 pr-1.5 py-1 rounded-full bg-foreground text-background text-sm">
          {{ topic }}
          <button type="button" class="w-6 h-6 inline-flex items-center justify-center rounded-full cursor-pointer hover:bg-background/20" :aria-label="`Retirer ${topic}`" @click="removeFrom('speakerTopics', topic)">
            <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </li>
      </ul>

      <ProfileField id="past-talks" label="Talks passés" hint="Une vidéo, des slides, ta page Sessionize.">
        <template #default="{ describedBy }">
          <input id="past-talks" v-model="form.pastTalksUrl" type="url" inputmode="url" placeholder="https://" :aria-describedby="describedBy" :class="profileInputClass()" />
        </template>
      </ProfileField>

      <div class="flex flex-col sm:flex-row gap-3 sm:gap-6 text-sm">
        <label class="inline-flex items-center gap-2.5 cursor-pointer">
          <input v-model="form.remoteOk" type="checkbox" class="w-[18px] h-[18px] accent-foreground" />
          Talks en remote
        </label>
        <label class="inline-flex items-center gap-2.5 cursor-pointer">
          <input v-model="form.travelWilling" type="checkbox" class="w-[18px] h-[18px] accent-foreground" />
          Prête à me déplacer
        </label>
      </div>
    </div>

    <fieldset class="min-w-0">
      <legend class="text-sm font-medium text-foreground mb-1">En recherche active</legend>
      <p class="text-xs text-foreground-muted mb-3">Un badge visible 30 jours sur ton profil, renouvelable. Laisse vide si tu ne cherches pas.</p>
      <div class="flex flex-wrap gap-2">
        <ProfileChip v-for="option in lookingForOptions" :key="option.value" :selected="form.lookingFor.includes(option.value)" @click="toggle('lookingFor', option.value)">
          {{ option.label }}
        </ProfileChip>
      </div>
    </fieldset>

    <div class="flex flex-col gap-4">
      <ProfileField id="linkedin" label="LinkedIn" required :error="fieldError('linkedinUrl')" hint="Ton email n'est jamais affiché : c'est par LinkedIn qu'on peut te joindre directement.">
        <template #default="{ describedBy, invalid }">
          <input id="linkedin" v-model="form.linkedinUrl" type="url" inputmode="url" autocomplete="url" required placeholder="linkedin.com/in/ton-nom" :aria-invalid="invalid" :aria-describedby="describedBy" :class="profileInputClass(invalid)" @blur="handleLinkedinBlur" />
        </template>
      </ProfileField>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ProfileField id="website" label="Site ou portfolio">
          <template #default>
            <input id="website" v-model="form.website" type="url" inputmode="url" placeholder="https://" :class="profileInputClass()" @blur="normalizeLinks" />
          </template>
        </ProfileField>
        <ProfileField id="twitter" label="X / Twitter">
          <template #default>
            <input id="twitter" v-model="form.twitterUrl" type="url" inputmode="url" placeholder="x.com/ton-pseudo" :class="profileInputClass()" @blur="normalizeLinks" />
          </template>
        </ProfileField>
      </div>
    </div>

    <div class="flex flex-col gap-4 pt-6 border-t border-border/10">
      <label class="flex items-start gap-3 cursor-pointer">
        <input v-model="form.emailOptIn" type="checkbox" class="w-[18px] h-[18px] mt-0.5 shrink-0 accent-foreground" />
        <span class="flex flex-col gap-0.5">
          <span class="text-sm text-foreground">Recevoir les nouvelles d'OSLD</span>
          <span class="text-xs text-foreground-muted">Un récap de temps en temps, des sondages pour améliorer le site. Zéro spam.</span>
        </span>
      </label>

      <div v-if="isNew">
        <label class="flex items-start gap-3 cursor-pointer">
          <input id="coc" v-model="form.cocAccepted" type="checkbox" required class="w-[18px] h-[18px] mt-0.5 shrink-0 accent-foreground" :aria-invalid="!!fieldError('cocAccepted')" :aria-describedby="fieldError('cocAccepted') ? 'coc-error' : undefined" @change="touch('cocAccepted')" />
          <span class="text-sm text-foreground">
            J'accepte le <NuxtLink to="/coc" target="_blank" class="underline underline-offset-2">code de conduite</NuxtLink> de la communauté<span class="text-foreground-muted" aria-hidden="true"> *</span>
          </span>
        </label>
        <p v-if="fieldError('cocAccepted')" id="coc-error" class="text-xs text-red-700 dark:text-red-400 mt-2 ml-[30px]">{{ fieldError('cocAccepted') }}</p>
      </div>
    </div>
  </div>
</template>
