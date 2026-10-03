<script setup lang="ts">
const props = defineProps<{
  label?: string
  title?: string
  outline?: string
  subtitle?: string
  count?: number | null
  countLabel?: string
  avatars?: string[]
}>()

const avatarList = computed(() => (props.avatars ?? []).slice(0, 5))
</script>

<template>
  <div
    class="flex-col" style="display: flex; flex-wrap: nowrap; flex-direction: column; justify-content: space-between; width: 100%; height: 100%; padding: 64px 72px; background-color: #0a0a0f; background-image: linear-gradient(rgba(248, 250, 252, 0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(248, 250, 252, 0.045) 1px, transparent 1px); background-size: 64px 64px; font-family: 'Space Grotesk'; color: #f8fafc; position: relative;"
  >
    <div style="position: absolute; top: 0; left: 0; width: 1200px; height: 630px; display: flex; flex-wrap: nowrap; background-image: radial-gradient(circle at 82% 18%, rgba(248, 250, 252, 0.13), transparent 52%);" />

    <div class="flex-row" style="display: flex; flex-direction: row; flex-wrap: nowrap; justify-content: space-between; align-items: center; width: 100%;">
      <span style="font-family: 'JetBrains Mono'; font-size: 24px; color: #94a3b8;"># {{ label || 'annuaire' }}</span>
      <span style="font-size: 28px; font-weight: 700; letter-spacing: 6px;">OSLD</span>
    </div>

    <div class="flex-col" style="display: flex; flex-wrap: nowrap; flex-direction: column;">
      <span style="font-size: 104px; font-weight: 500; line-height: 0.95; letter-spacing: -3px;">{{ title || 'Où sont les' }}</span>
      <span
        v-show="outline"
        style="font-size: 104px; font-weight: 500; line-height: 1.05; letter-spacing: -3px; color: #0a0a0f; -webkit-text-stroke-width: 2px; -webkit-text-stroke-color: #f8fafc;"
      >{{ outline }}</span>
      <span v-show="subtitle" style="margin-top: 24px; font-size: 32px; color: #94a3b8;">{{ subtitle }}</span>
    </div>

    <div class="flex-row" style="display: flex; flex-direction: row; flex-wrap: nowrap; justify-content: space-between; align-items: flex-end; width: 100%;">
      <div v-show="count" class="flex-col" style="display: flex; flex-wrap: nowrap; flex-direction: column;">
        <span style="font-size: 72px; font-weight: 700; line-height: 1; letter-spacing: -2px;">{{ count }}</span>
        <span style="margin-top: 8px; font-size: 26px; color: #94a3b8;">{{ countLabel || 'développeuses' }}</span>
      </div>
      <span v-show="!count" style="font-family: 'JetBrains Mono'; font-size: 22px; color: #94a3b8;">ousontlesdeveloppeuses.fr</span>

      <div v-show="avatarList.length" class="flex-row" style="display: flex; flex-direction: row; flex-wrap: nowrap; align-items: center;">
        <div
          v-for="(avatar, i) in avatarList"
          :key="avatar"
          class="flex-row" :style="`display: flex; width: 72px; height: 72px; margin-left: ${i === 0 ? 0 : -18}px; border-radius: 9999px; border: 4px solid #0a0a0f; background-image: url(${avatar}); background-size: 64px 64px;`"
        />
        <span class="flex-row" style="display: flex; flex-direction: row; flex-wrap: nowrap; align-items: center; justify-content: center; width: 72px; height: 72px; margin-left: -18px; border-radius: 9999px; border: 4px solid #0a0a0f; background-color: #f8fafc; color: #0a0a0f; font-size: 30px; font-weight: 700;">+</span>
      </div>
    </div>
  </div>
</template>
