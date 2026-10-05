<script setup lang="ts">
import { experienceOptions } from '~/utils/constants'

const { form, email, fieldError, touch } = useInjectedProfileForm()

const { data: landingIndex } = useLazyFetch<{ cities: { slug: string, label: string }[] }>('/api/landings', {
  server: false,
  default: () => ({ cities: [] })
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <ProfileField id="firstName" label="Prénom" required :error="fieldError('firstName')">
        <template #default="{ describedBy, invalid }">
          <input id="firstName" v-model="form.firstName" type="text" autocomplete="given-name" required :aria-invalid="invalid" :aria-describedby="describedBy" :class="profileInputClass(invalid)" @blur="touch('firstName')" />
        </template>
      </ProfileField>
      <ProfileField id="lastName" label="Nom" required :error="fieldError('lastName')">
        <template #default="{ describedBy, invalid }">
          <input id="lastName" v-model="form.lastName" type="text" autocomplete="family-name" required :aria-invalid="invalid" :aria-describedby="describedBy" :class="profileInputClass(invalid)" @blur="touch('lastName')" />
        </template>
      </ProfileField>
    </div>

    <ProfileField id="title" label="En quelques mots" :hint="form.title.length > 80 ? `${form.title.length}/120` : 'Ce qu\'on lit sous ton nom dans l\'annuaire.'">
      <template #default="{ describedBy }">
        <input id="title" v-model="form.title" type="text" maxlength="120" placeholder="Dev fullstack Vue/Node, freelance" :aria-describedby="describedBy" :class="profileInputClass()" />
      </template>
    </ProfileField>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <ProfileField id="location" label="Ville" hint="Pour apparaître sur la page de ta ville.">
        <template #default="{ describedBy }">
          <input id="location" v-model="form.location" type="text" list="profile-cities" autocomplete="address-level2" placeholder="Lyon" :aria-describedby="describedBy" :class="profileInputClass()" />
          <datalist id="profile-cities">
            <option v-for="city in landingIndex.cities" :key="city.slug" :value="city.label" />
          </datalist>
        </template>
      </ProfileField>

      <fieldset class="flex flex-col gap-2 min-w-0">
        <legend class="text-sm font-medium text-foreground mb-2">Expérience</legend>
        <div class="flex flex-wrap gap-2">
          <label v-for="option in experienceOptions" :key="option.value" class="relative">
            <input v-model="form.yearsExperience" type="radio" name="yearsExperience" :value="option.value" class="peer sr-only" />
            <span class="inline-flex px-3.5 py-2 md:py-1.5 rounded-full border text-sm cursor-pointer transition-colors motion-reduce:transition-none border-border/20 text-foreground-muted hover:text-foreground hover:border-foreground/40 peer-checked:bg-foreground peer-checked:text-background peer-checked:border-foreground peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-foreground">
              {{ option.label }}
            </span>
          </label>
        </div>
      </fieldset>
    </div>

    <ProfileField id="bio" label="Bio" hint="Ce que tu fais, ce qui te passionne. Quelques lignes suffisent.">
      <template #default="{ describedBy }">
        <textarea id="bio" v-model="form.bio" rows="3" :aria-describedby="describedBy" :class="[profileInputClass(), 'resize-y min-h-[88px]']"></textarea>
      </template>
    </ProfileField>

    <div class="flex items-start gap-3 p-4 rounded-2xl border border-border/10 text-sm">
      <svg class="w-4 h-4 mt-0.5 shrink-0 text-foreground-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <rect x="2" y="4" width="20" height="16" rx="2"/>
        <path d="M22 6l-10 7L2 6"/>
      </svg>
      <p v-if="email" class="text-foreground-muted leading-relaxed">
        Les demandes de contact arriveront sur <span class="text-foreground font-medium break-words">{{ email }}</span>. Ton email n'est jamais affiché sur le site. Il vient de ton compte GitHub : pour le changer, modifie ton email principal sur GitHub puis reconnecte-toi.
      </p>
      <p v-else class="text-foreground-muted leading-relaxed">
        On n'a pas pu récupérer d'email depuis GitHub. Ton profil sera visible, mais les demandes de contact passeront uniquement par LinkedIn.
      </p>
    </div>
  </div>
</template>
