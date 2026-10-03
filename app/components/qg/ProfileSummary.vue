<script setup lang="ts">
import { lookingForLabels } from '~/utils/constants'
import type { QgActivity, QgProfile } from '~/types/qg'

const props = defineProps<{
  profile: QgProfile
  activity: QgActivity | null
  lookingForDaysLeft: number | null
}>()

const emit = defineEmits<{
  renew: []
}>()

const lookingForText = computed(() =>
  props.profile.lookingFor.map(type => lookingForLabels[type] || type).join(', ')
)

const totalContacts = computed(() => props.activity?.totalContactsReceived ?? 0)
const weeklyContacts = computed(() => props.activity?.weeklyContactsReceived ?? 0)
</script>

<template>
  <section class="p-5 md:p-6 rounded-2xl border-2 border-border/15">
    <div class="flex flex-col sm:flex-row sm:items-center gap-4">
      <img
        v-if="profile.avatarUrl"
        :src="optimizedAvatar(profile.avatarUrl, 112)"
        :alt="profile.name"
        width="56"
        height="56"
        class="w-14 h-14 rounded-full border border-border/10"
      />
      <div class="flex-1 min-w-0">
        <p class="font-display text-xl font-bold truncate">{{ profile.name }}</p>
        <p v-if="profile.title || profile.location" class="text-sm text-foreground-muted truncate">
          {{ [profile.title, profile.location].filter(Boolean).join(' · ') }}
        </p>
      </div>
      <NuxtLink
        v-if="profile.slug"
        :to="`/directory/${profile.slug}`"
        class="group inline-flex items-center gap-2 self-start sm:self-center px-4 py-2 rounded-full border border-primary/40 text-sm font-medium text-primary no-underline hover:bg-primary/[0.08] transition-colors"
      >
        Voir mon profil public
        <svg class="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M7 17L17 7M8 7h9v9"/>
        </svg>
      </NuxtLink>
    </div>

    <dl class="grid grid-cols-1 sm:grid-cols-3 gap-px mt-5 rounded-xl overflow-hidden bg-border/10">
      <div class="p-4 bg-background">
        <dt class="text-[11px] uppercase tracking-widest text-foreground-muted">Contacts reçus</dt>
        <dd class="mt-1 flex items-baseline gap-2">
          <span class="font-display text-2xl font-bold tabular-nums">{{ totalContacts }}</span>
          <span v-if="weeklyContacts > 0" class="text-xs text-primary">+{{ weeklyContacts }} cette semaine</span>
        </dd>
      </div>

      <div class="p-4 bg-background">
        <dt class="text-[11px] uppercase tracking-widest text-foreground-muted">Profil</dt>
        <dd class="mt-1">
          <span v-if="activity?.profileComplete" class="text-sm font-medium">✓ Complet</span>
          <span v-else-if="activity?.missingFields?.length" class="text-sm font-medium text-amber-700 dark:text-amber-400">
            Il manque : {{ activity.missingFields.join(', ') }}
          </span>
          <span v-else class="text-sm text-foreground-muted">…</span>
        </dd>
      </div>

      <div class="p-4 bg-background">
        <dt class="text-[11px] uppercase tracking-widest text-foreground-muted">Recherche</dt>
        <dd class="mt-1">
          <template v-if="profile.lookingFor.length">
            <p class="text-sm font-medium">{{ lookingForText }}</p>
            <div class="flex items-center gap-2 mt-1">
              <span v-if="lookingForDaysLeft !== null && lookingForDaysLeft > 0" :class="['text-xs', lookingForDaysLeft <= 7 ? 'text-amber-700 dark:text-amber-400' : 'text-foreground-muted']">
                Expire dans {{ lookingForDaysLeft }} jour{{ lookingForDaysLeft > 1 ? 's' : '' }}
              </span>
              <span v-else-if="lookingForDaysLeft !== null" class="text-xs text-amber-700 dark:text-amber-400">Expirée</span>
              <button
                v-if="lookingForDaysLeft !== null && lookingForDaysLeft <= 7"
                class="text-xs font-medium text-primary underline underline-offset-2 cursor-pointer"
                @click="emit('renew')"
              >
                Renouveler
              </button>
            </div>
          </template>
          <span v-else class="text-sm text-foreground-muted">Pas en recherche</span>
        </dd>
      </div>
    </dl>
  </section>
</template>
