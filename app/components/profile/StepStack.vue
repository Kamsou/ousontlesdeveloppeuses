<script setup lang="ts">
import { skillGroups, suggestedSkills } from '~/utils/constants'

const { form, toggle, addTo, removeFrom } = useInjectedProfileForm()

const newSkill = ref('')

const customSkills = computed(() => form.skills.filter(skill => !suggestedSkills.includes(skill)))

function addSkill() {
  if (addTo('skills', newSkill.value)) newSkill.value = ''
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key !== 'Enter' && e.key !== ',') return
  e.preventDefault()
  addSkill()
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <p class="text-sm text-foreground-muted" aria-live="polite">
      <span class="text-foreground font-medium">{{ form.skills.length }}</span>
      {{ form.skills.length > 1 ? 'technos sélectionnées' : 'techno sélectionnée' }}. C'est ce que filtrent les recruteurs, recruteuses et orgas.
    </p>

    <fieldset v-for="group in skillGroups" :key="group.label" class="min-w-0">
      <legend class="font-mono text-xs text-foreground-muted mb-2.5"># {{ group.label.toLowerCase() }}</legend>
      <div class="flex flex-wrap gap-2">
        <ProfileChip v-for="skill in group.skills" :key="skill" :selected="form.skills.includes(skill)" @click="toggle('skills', skill)">
          {{ skill }}
        </ProfileChip>
      </div>
    </fieldset>

    <ProfileField id="new-skill" label="Autre techno" hint="Entrée ou virgule pour ajouter.">
      <template #default="{ describedBy }">
        <div class="flex gap-2">
          <input id="new-skill" v-model="newSkill" type="text" placeholder="Elixir, Figma, Terraform" :aria-describedby="describedBy" :class="profileInputClass()" @keydown="handleKeydown" />
          <button type="button" class="shrink-0 px-5 rounded-xl border border-border/20 text-sm text-foreground cursor-pointer hover:border-foreground/50 transition-colors" @click="addSkill">Ajouter</button>
        </div>
      </template>
    </ProfileField>

    <ul v-if="customSkills.length" class="flex flex-wrap gap-2" aria-label="Technos ajoutées">
      <li v-for="skill in customSkills" :key="skill" class="inline-flex items-center gap-1 pl-3.5 pr-1.5 py-1 rounded-full bg-foreground text-background text-sm">
        {{ skill }}
        <button type="button" class="w-6 h-6 inline-flex items-center justify-center rounded-full cursor-pointer hover:bg-background/20" :aria-label="`Retirer ${skill}`" @click="removeFrom('skills', skill)">
          <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </li>
    </ul>
  </div>
</template>
