<script setup lang="ts">
import { getExperienceLabel, openToLabels, lookingForLabels } from '~/utils/constants'

const { form, avatarUrl, fullName } = useInjectedProfileForm()

const subtitle = computed(() => [form.location.trim(), getExperienceLabel(form.yearsExperience)].filter(Boolean).join(' · '))
const visibleSkills = computed(() => form.skills.slice(0, 6))
const hiddenSkills = computed(() => Math.max(0, form.skills.length - visibleSkills.value.length))
const lookingForText = computed(() => form.lookingFor.map(type => lookingForLabels[type] || type).join(' · '))
</script>

<template>
  <figure class="flex flex-col gap-3">
    <figcaption class="font-mono text-xs text-foreground-muted"># aperçu dans l'annuaire</figcaption>
    <div class="rounded-3xl border border-border/15 bg-background-card p-6 shadow-[0_40px_80px_-40px_rgb(0_0_0/0.6)]">
      <div class="flex items-center gap-4 mb-5">
        <img v-if="avatarUrl" :src="optimizedAvatar(avatarUrl, 112)" alt="" width="56" height="56" class="w-14 h-14 shrink-0 rounded-full object-cover" />
        <span v-else class="w-14 h-14 shrink-0 rounded-full bg-foreground/10 flex items-center justify-center font-display text-xl" aria-hidden="true">{{ (form.firstName || '?').charAt(0) }}</span>
        <div class="min-w-0 flex-1">
          <p class="font-display text-xl font-medium leading-tight truncate">{{ fullName || 'Ton nom' }}</p>
          <p class="text-sm text-foreground-muted truncate">{{ subtitle || 'Ta ville · ton expérience' }}</p>
        </div>
      </div>

      <p v-if="lookingForText" class="inline-flex mb-4 px-2.5 py-1 rounded-full border border-foreground/40 text-xs font-medium">En recherche · {{ lookingForText }}</p>

      <p class="text-sm leading-relaxed mb-5 text-foreground-muted">
        {{ form.title.trim() || 'Ta phrase « en quelques mots » apparaîtra ici.' }}
      </p>

      <div class="flex flex-wrap gap-1.5 mb-5 min-h-7">
        <span v-for="skill in visibleSkills" :key="skill" class="px-2.5 py-1 text-xs bg-foreground/[0.07] rounded-full">{{ skill }}</span>
        <span v-if="hiddenSkills" class="px-2.5 py-1 text-xs text-foreground-muted">+{{ hiddenSkills }}</span>
        <span v-if="!form.skills.length" class="px-2.5 py-1 text-xs border border-dashed border-border/30 rounded-full text-foreground-muted">Ta stack</span>
      </div>

      <div class="pt-5 border-t border-border/10">
        <p class="font-mono text-[0.65rem] text-foreground-muted mb-2.5">disponible pour</p>
        <div class="flex flex-wrap gap-1.5">
          <span v-for="value in form.openTo" :key="value" class="px-2.5 py-1 text-xs border border-border/20 rounded-full">{{ openToLabels[value] || value }}</span>
          <span v-if="!form.openTo.length" class="px-2.5 py-1 text-xs border border-dashed border-border/30 rounded-full text-foreground-muted">Conférence, mentoring…</span>
        </div>
      </div>
    </div>
  </figure>
</template>
