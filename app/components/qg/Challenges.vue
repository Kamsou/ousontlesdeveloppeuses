<script setup lang="ts">
import type { Challenge } from '~/types/qg'
import { challengePacks, challengeTemplates, challengeLevels, getXpForDifficulty } from '~/utils/challengeCategories'

const { $clientPosthog } = useNuxtApp()
const { data: userChallenges, status: challengesStatus, refresh } = useLazyFetch<Challenge[]>('/api/challenges/current')

const openPackId = ref<string | null>(null)
const openCategories = ref<Set<string>>(new Set())
const openChallengeId = ref<string | null>(null)
const showReflection = ref(false)
const reflection = ref('')
const completing = ref(false)
const starting = ref(false)
const error = ref('')
const hasAutoOpened = ref(false)

const isLoading = computed(() => challengesStatus.value === 'pending')

const categoryColors: Record<string, string> = {
  comparer: '#3B82F6',
  verifier: '#3B82F6',
  enseigner: '#3B82F6',
  collaborer: '#3B82F6',
  resister: '#3B82F6'
}

const statusMap = computed(() => {
  const map = new Map<string, Challenge>()
  for (const c of userChallenges.value || []) {
    map.set(c.templateId, c)
  }
  return map
})

const activeChallenge = computed(() =>
  (userChallenges.value || []).find(c => c.status === 'active') || null
)

const activeChallengePack = computed(() => {
  if (!activeChallenge.value) return null
  const template = challengeTemplates.find(t => t.id === activeChallenge.value!.templateId)
  return template?.packId || null
})

const activeXp = computed(() => {
  if (!activeChallenge.value) return 0
  const template = challengeTemplates.find(t => t.id === activeChallenge.value!.templateId)
  return template ? getXpForDifficulty(template.difficulty) : 0
})

const totalXp = computed(() => {
  return challengeTemplates
    .filter(t => statusMap.value.get(t.id)?.status === 'completed')
    .reduce((sum, t) => sum + getXpForDifficulty(t.difficulty), 0)
})

const currentLevel = computed(() => {
  const found = [...challengeLevels].reverse().find(l => totalXp.value >= l.minXp)
  return found ?? { level: 1, name: 'Débutante', minXp: 0 }
})

const nextLevel = computed(() => {
  return challengeLevels.find(l => l.minXp > totalXp.value) || null
})

const progressToNextLevel = computed(() => {
  if (!nextLevel.value) return 100
  const current = currentLevel.value.minXp
  const next = nextLevel.value.minXp
  return Math.round(((totalXp.value - current) / (next - current)) * 100)
})

function getPackTemplates(packId: string) {
  return challengeTemplates.filter(t => t.packId === packId)
}

function getCategoryTemplates(packId: string, category: string) {
  return challengeTemplates.filter(t => t.packId === packId && t.category === category)
}

function packCompletedCount(packId: string) {
  return getPackTemplates(packId).filter(t => statusMap.value.get(t.id)?.status === 'completed').length
}

function categoryCompletedCount(packId: string, category: string) {
  return getCategoryTemplates(packId, category).filter(t => statusMap.value.get(t.id)?.status === 'completed').length
}

function togglePack(packId: string) {
  openPackId.value = openPackId.value === packId ? null : packId
}

function toggleCategory(category: string) {
  if (openCategories.value.has(category)) {
    openCategories.value.delete(category)
  } else {
    openCategories.value.add(category)
  }
  openCategories.value = new Set(openCategories.value)
}

function getStatus(templateId: string) {
  return statusMap.value.get(templateId) || null
}

function toggleChallenge(templateId: string) {
  openChallengeId.value = openChallengeId.value === templateId ? null : templateId
  showReflection.value = false
  reflection.value = ''
}

async function startChallenge(templateId: string) {
  starting.value = true
  error.value = ''

  try {
    await $fetch('/api/challenges/start', {
      method: 'POST',
      body: { templateId }
    })
    $clientPosthog?.capture('challenge_started', { templateId })
    await refresh()
  } catch (e: any) {
    error.value = e.data?.message || 'Erreur'
  } finally {
    starting.value = false
  }
}

async function completeChallenge(challengeId: number) {
  completing.value = true

  try {
    await $fetch(`/api/challenges/${challengeId}`, {
      method: 'PATCH',
      body: {
        status: 'completed',
        reflection: reflection.value.trim() || undefined
      }
    })
    showReflection.value = false
    reflection.value = ''
    openChallengeId.value = null
    await refresh()
  } catch (e: any) {
    error.value = e.data?.message || 'Erreur'
  } finally {
    completing.value = false
  }
}

async function skipChallenge(challengeId: number) {
  try {
    await $fetch(`/api/challenges/${challengeId}`, {
      method: 'PATCH',
      body: { status: 'skipped' }
    })
    openChallengeId.value = null
    await refresh()
  } catch (e: any) {
    error.value = e.data?.message || 'Erreur'
  }
}

function autoOpenPack(challenges: Challenge[]) {
  if (hasAutoOpened.value) return
  hasAutoOpened.value = true
  const active = challenges.find(c => c.status === 'active')
  if (active) {
    const template = challengeTemplates.find(t => t.id === active.templateId)
    if (template) {
      openPackId.value = template.packId
      return
    }
  }
  openPackId.value = challengePacks.find(p => !p.comingSoon)?.id || null
}

watch(userChallenges, (challenges) => {
  if (challenges) autoOpenPack(challenges)
})

onMounted(() => {
  if (userChallenges.value) autoOpenPack(userChallenges.value)
})
</script>

<template>
  <div>
    <div v-if="error" class="text-sm text-red-400/80 mb-6">{{ error }}</div>

    <div v-if="!isLoading && activeChallenge" class="mb-12 flex flex-col md:flex-row md:items-stretch gap-4">
      <div class="flex items-center gap-4 px-6 py-5 rounded-2xl bg-white/[0.02] shrink-0">
        <span
          class="text-5xl font-bold leading-none tabular-nums"
          style="font-family: 'Satoshi', sans-serif; background: linear-gradient(180deg, #3B82F6, #1d4ed8); background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent; color: transparent"
        >{{ currentLevel.level }}</span>
        <div class="flex flex-col gap-1">
          <span class="font-display font-medium">{{ currentLevel.name }}</span>
          <div class="flex items-center gap-2.5">
            <div class="w-16 h-1 rounded-full bg-border/10 overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-700 ease-out"
                :style="{
                  width: progressToNextLevel + '%',
                  background: 'linear-gradient(90deg, #3B82F6, #60a5fa)'
                }"
              ></div>
            </div>
            <span class="text-xs tabular-nums text-primary">{{ totalXp }} XP</span>
          </div>
        </div>
      </div>

      <div class="flex-1 p-5 rounded-2xl border border-primary/15 bg-primary/[0.03] flex flex-col min-w-0">
        <div class="flex-1 min-w-0">
          <p class="text-xs text-primary mb-1">Challenge en cours</p>
          <h3 class="font-display font-medium text-base">{{ activeChallenge.title }}</h3>
          <p class="text-[13px] text-foreground-muted mt-1 line-clamp-2">{{ activeChallenge.description }}</p>
        </div>
        <div v-if="!showReflection" class="flex items-center gap-4 mt-auto pt-4">
          <button
            @click="showReflection = true"
            class="px-5 py-2 bg-primary rounded-full text-sm font-medium text-white transition-all hover:brightness-110"
          >
            C'est fait ! +{{ activeXp }} XP
          </button>
          <button
            @click="skipChallenge(activeChallenge.id)"
            class="text-sm text-foreground-muted hover:text-foreground transition-colors"
          >
            Passer
          </button>
        </div>
        <div v-else class="mt-auto pt-4 space-y-3">
          <textarea
            v-model="reflection"
            rows="2"
            placeholder="Qu'est-ce que tu en retiens ? (optionnel)"
            class="w-full px-4 py-3 bg-transparent border border-primary/15 rounded-xl text-sm text-foreground placeholder:text-foreground-muted/20 focus:outline-none transition-colors resize-none"
          />
          <div class="flex items-center gap-4">
            <button
              @click="completeChallenge(activeChallenge.id)"
              :disabled="completing"
              class="px-5 py-2 bg-primary rounded-full text-sm font-medium text-white transition-all hover:brightness-110 disabled:opacity-50"
            >
              {{ completing ? '...' : 'Valider' }}
            </button>
            <button
              @click="showReflection = false; reflection = ''"
              class="text-sm text-foreground-muted hover:text-foreground transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="!isLoading" class="mb-12 flex items-center gap-4">
      <span
        class="text-5xl font-bold leading-none tabular-nums"
        style="font-family: 'Satoshi', sans-serif; background: linear-gradient(180deg, #3B82F6, #1d4ed8); background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent; color: transparent"
      >{{ currentLevel.level }}</span>
      <div class="flex flex-col gap-1">
        <span class="font-display font-medium text-lg">{{ currentLevel.name }}</span>
        <div class="flex items-center gap-2.5">
          <div class="w-20 h-1 rounded-full bg-border/10 overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-700 ease-out"
              :style="{
                width: progressToNextLevel + '%',
                background: 'linear-gradient(90deg, #3B82F6, #60a5fa)'
              }"
            ></div>
          </div>
          <span class="text-xs tabular-nums text-primary">{{ totalXp }} XP</span>
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="space-y-6">
      <div v-for="i in 5" :key="i" class="h-14 rounded-lg animate-pulse bg-border/5"></div>
    </div>

    <div v-else>
      <section v-for="pack in challengePacks" :key="pack.id" class="mb-10 last:mb-0">
        <button
          @click="togglePack(pack.id)"
          class="flex items-baseline gap-3 text-left w-full cursor-pointer"
          :class="openPackId === pack.id ? 'mb-8' : 'mb-0'"
        >
          <h3 class="font-display text-xl tracking-tight" :class="pack.comingSoon ? 'text-foreground-muted' : ''">{{ pack.title }}</h3>
          <span
            v-if="activeChallengePack === pack.id"
            class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0"
          ></span>
          <span v-if="pack.comingSoon" class="text-[11px] text-foreground-muted border border-border/20 rounded-full px-2.5 py-0.5">bientôt</span>
          <span v-else-if="packCompletedCount(pack.id) > 0" class="text-xs tabular-nums text-foreground-muted">
            {{ packCompletedCount(pack.id) }}/{{ getPackTemplates(pack.id).length }}
          </span>
        </button>

        <Transition
          enter-active-class="transition-all duration-300 ease-out overflow-hidden"
          leave-active-class="transition-all duration-200 ease-in overflow-hidden"
          enter-from-class="opacity-0 max-h-0"
          enter-to-class="opacity-100 max-h-[2000px]"
          leave-from-class="opacity-100 max-h-[2000px]"
          leave-to-class="opacity-0 max-h-0"
        >
        <div v-if="pack.comingSoon && openPackId === pack.id" class="space-y-2">
          <div v-for="cat in pack.categories" :key="cat.value">
            <div class="w-full flex items-center gap-0 text-left py-3 cursor-default">
              <div class="w-1 self-stretch rounded-full mr-4 bg-foreground-muted/20"></div>
              <div class="flex-1 min-w-0">
                <span class="font-display font-medium text-[15px] text-foreground-muted">{{ cat.label }}</span>
                <p class="text-[13px] text-foreground-muted mt-0.5">{{ cat.description }}</p>
              </div>
            </div>
          </div>
        </div>
        </Transition>

        <Transition
          enter-active-class="transition-all duration-300 ease-out overflow-hidden"
          leave-active-class="transition-all duration-200 ease-in overflow-hidden"
          enter-from-class="opacity-0 max-h-0"
          enter-to-class="opacity-100 max-h-[2000px]"
          leave-from-class="opacity-100 max-h-[2000px]"
          leave-to-class="opacity-0 max-h-0"
        >
        <div v-if="!pack.comingSoon && openPackId === pack.id" class="space-y-2">
          <div v-for="cat in pack.categories" :key="cat.value">
            <button
              @click="toggleCategory(cat.value)"
              class="w-full flex items-center gap-0 text-left py-3 group"
            >
              <div
                class="w-1 self-stretch rounded-full mr-4 transition-all duration-300"
                :style="{ backgroundColor: openCategories.has(cat.value) ? categoryColors[cat.value] : categoryColors[cat.value] + '30' }"
              ></div>
              <div class="flex-1 min-w-0">
                <span class="font-display font-medium text-[15px]">{{ cat.label }}</span>
                <p class="text-[13px] text-foreground-muted mt-0.5">{{ cat.description }}</p>
              </div>
              <span class="text-xs tabular-nums text-foreground-muted mr-1">
                {{ categoryCompletedCount(pack.id, cat.value) }}/{{ getCategoryTemplates(pack.id, cat.value).length }}
              </span>
            </button>

            <div
              v-if="openCategories.has(cat.value)"
              class="ml-[7px] border-l-[2px] pl-7 pb-3"
              :style="{ borderColor: categoryColors[cat.value] + '12' }"
            >
              <div
                v-for="template in getCategoryTemplates(pack.id, cat.value)"
                :key="template.id"
              >
                <div
                  @click="(getStatus(template.id) || !activeChallenge) && toggleChallenge(template.id)"
                  class="w-full flex items-center gap-3 text-left py-2.5 -ml-2 px-2 rounded-lg transition-colors group/item relative"
                  :class="getStatus(template.id) || !activeChallenge ? 'hover:bg-white/[0.02] cursor-pointer' : 'cursor-default'"
                >
                  <span class="shrink-0 w-4 flex items-center justify-center">
                    <svg
                      v-if="getStatus(template.id)?.status === 'completed'"
                      width="14" height="14" viewBox="0 0 24 24" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"
                      :style="{ stroke: categoryColors[cat.value] }"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    <span
                      v-else-if="getStatus(template.id)?.status === 'active'"
                      class="w-2.5 h-2.5 rounded-full"
                      :style="{
                        backgroundColor: categoryColors[cat.value],
                        boxShadow: `0 0 8px ${categoryColors[cat.value]}50`
                      }"
                    ></span>
                    <span
                      v-else-if="getStatus(template.id)?.status === 'skipped'"
                      class="w-2.5 h-2.5 rounded-full bg-foreground-muted/10"
                    ></span>
                    <span
                      v-else
                      class="w-2.5 h-2.5 rounded-full border border-border/20"
                    ></span>
                  </span>

                  <span
                    class="flex-1 text-sm"
                    :class="[
                      getStatus(template.id)?.status === 'skipped' ? 'text-foreground-muted' : '',
                      getStatus(template.id)?.status === 'completed' ? 'text-foreground-muted' : ''
                    ]"
                  >{{ template.title }}</span>

                  <span
                    v-if="getStatus(template.id)?.status !== 'completed'"
                    class="text-[11px] tabular-nums"
                    :style="{ color: categoryColors[cat.value] }"
                  >+{{ getXpForDifficulty(template.difficulty) }}</span>

                  <button
                    v-if="!getStatus(template.id)"
                    @click.stop="!activeChallenge && (openChallengeId = template.id, startChallenge(template.id))"
                    :disabled="starting || !!activeChallenge"
                    class="hidden md:group-hover/item:inline-flex absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 rounded-full text-xs font-medium border bg-background"
                    :style="{
                      borderColor: categoryColors[cat.value] + ((starting || activeChallenge) ? '15' : '30'),
                      color: categoryColors[cat.value] + ((starting || activeChallenge) ? '40' : 'ff')
                    }"
                  >
                    {{ starting ? '...' : 'Commencer' }}
                  </button>
                </div>

                <div v-if="openChallengeId === template.id" class="ml-7 mt-1 mb-5">
                  <p class="text-[13px] text-foreground-muted leading-relaxed">
                    {{ template.description }}
                  </p>

                  <div
                    class="mt-3 pl-4 border-l-[2px]"
                    :style="{ borderColor: categoryColors[cat.value] + '10' }"
                  >
                    <p class="text-[13px] text-foreground-muted leading-relaxed whitespace-pre-line">{{ template.example }}</p>
                  </div>

                  <div v-if="getStatus(template.id)?.status === 'completed'" class="mt-4">
                    <p v-if="getStatus(template.id)?.reflection" class="text-[13px] text-foreground-muted italic">
                      "{{ getStatus(template.id)?.reflection }}"
                    </p>
                  </div>

                  <div v-else-if="getStatus(template.id)?.status === 'active'" class="mt-4">
                    <p class="text-xs text-primary">En cours</p>
                  </div>

                  <div v-else-if="getStatus(template.id)?.status === 'skipped'" class="mt-4">
                    <button
                      v-if="!activeChallenge"
                      @click="startChallenge(template.id)"
                      :disabled="starting"
                      class="text-sm transition-colors disabled:opacity-50"
                      :style="{ color: categoryColors[cat.value] }"
                    >
                      Réessayer
                    </button>
                  </div>

                  <div v-else class="mt-5 md:hidden">
                    <button
                      v-if="!activeChallenge"
                      @click="startChallenge(template.id)"
                      :disabled="starting"
                      class="px-5 py-2 rounded-full text-sm font-medium border transition-all disabled:opacity-50"
                      :style="{
                        borderColor: categoryColors[cat.value] + '30',
                        color: categoryColors[cat.value]
                      }"
                    >
                      {{ starting ? '...' : 'Commencer' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </Transition>
      </section>
    </div>
  </div>
</template>
