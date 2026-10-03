<script setup lang="ts">
const props = defineProps<{
  title?: string
  description?: string
  name?: string
  jobTitle?: string
  location?: string
  skills?: string[]
  avatarUrl?: string
  isSpeaker?: boolean
  openTo?: string[]
}>()

const subtitle = computed(() => {
  const job = props.jobTitle && props.jobTitle.length <= 42 ? props.jobTitle : 'Développeuse'
  return [job, props.location?.split(',')[0]?.trim()].filter(Boolean).join(' · ')
})
</script>

<template>
  <div
    class="flex-col" style="display: flex; flex-wrap: nowrap; flex-direction: column; justify-content: space-between; width: 100%; height: 100%; padding: 64px 72px; background-color: #0a0a0f; background-image: linear-gradient(rgba(248, 250, 252, 0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(248, 250, 252, 0.045) 1px, transparent 1px); background-size: 64px 64px; font-family: 'Space Grotesk'; color: #f8fafc; position: relative;"
  >
    <div style="position: absolute; top: 0; left: 0; width: 1200px; height: 630px; display: flex; flex-wrap: nowrap; background-image: radial-gradient(circle at 18% 55%, rgba(248, 250, 252, 0.12), transparent 50%);" />

    <div class="flex-row" style="display: flex; flex-direction: row; flex-wrap: nowrap; justify-content: space-between; align-items: center; width: 100%;">
      <span style="font-family: 'JetBrains Mono'; font-size: 24px; color: #94a3b8;"># {{ name ? 'développeuse' : 'osld' }}</span>
      <span style="font-size: 28px; font-weight: 700; letter-spacing: 6px;">OSLD</span>
    </div>

    <div class="flex-row" style="display: flex; flex-wrap: nowrap; flex-direction: row; align-items: center; width: 1056px;">
      <div
        v-show="avatarUrl"
        class="flex-row" :style="`display: flex; width: 200px; height: 200px; margin-right: 56px; border-radius: 9999px; border: 2px solid rgba(248, 250, 252, 0.25); background-image: url(${avatarUrl}); background-size: 196px 196px;`"
      />
      <div class="flex-col" style="display: flex; flex-wrap: nowrap; flex-direction: column; width: 800px;">
        <span style="font-size: 80px; font-weight: 500; line-height: 1; letter-spacing: -3px;">{{ name || title || 'Où sont les développeuses' }}</span>
        <span v-show="name ? subtitle : description" style="margin-top: 16px; font-size: 32px; color: #94a3b8;">{{ name ? subtitle : description }}</span>
        <div v-show="skills?.length" class="flex-row flex-wrap" style="display: flex; flex-direction: row; flex-wrap: wrap; margin-top: 28px;">
          <span
            v-for="skill in (skills ?? []).slice(0, 4)"
            :key="skill"
            class="flex-row" style="display: flex; flex-direction: row; flex-wrap: nowrap; padding: 8px 20px; margin-right: 12px; margin-bottom: 8px; border: 2px solid rgba(248, 250, 252, 0.2); border-radius: 9999px; font-size: 24px;"
          >{{ skill }}</span>
          <span v-show="(skills?.length ?? 0) > 4" style="display: flex; flex-direction: row; flex-wrap: nowrap; padding: 8px 4px; font-size: 24px; color: #94a3b8;">+{{ (skills?.length ?? 0) - 4 }}</span>
        </div>
      </div>
    </div>

    <div class="flex-row" style="display: flex; flex-direction: row; flex-wrap: nowrap; justify-content: space-between; align-items: center; width: 100%;">
      <div class="flex-row" style="display: flex; flex-direction: row; flex-wrap: nowrap; align-items: center;">
        <span v-show="isSpeaker" class="flex-row" style="display: flex; flex-direction: row; flex-wrap: nowrap; padding: 8px 20px; margin-right: 20px; border-radius: 9999px; background-color: #f8fafc; color: #0a0a0f; font-size: 22px; font-weight: 700;">Speakeuse</span>
        <span v-show="openTo?.length" style="font-family: 'JetBrains Mono'; font-size: 22px; color: #94a3b8;">dispo : {{ (openTo ?? []).slice(0, 2).join(' · ') }}</span>
      </div>
      <span style="font-family: 'JetBrains Mono'; font-size: 22px; color: #94a3b8;">ousontlesdeveloppeuses.fr</span>
    </div>
  </div>
</template>
