<script setup lang="ts">
const props = defineProps<{
  id: string
  label: string
  hint?: string
  error?: string
  required?: boolean
}>()

const describedBy = computed(() => [props.hint ? `${props.id}-hint` : '', props.error ? `${props.id}-error` : ''].filter(Boolean).join(' ') || undefined)
</script>

<template>
  <div class="flex flex-col gap-2">
    <label :for="id" class="text-sm font-medium text-foreground">
      {{ label }}<span v-if="required" class="text-foreground-muted" aria-hidden="true"> *</span>
    </label>
    <slot :described-by="describedBy" :invalid="!!error" />
    <p v-if="error" :id="`${id}-error`" class="text-xs text-red-700 dark:text-red-400">{{ error }}</p>
    <p v-else-if="hint" :id="`${id}-hint`" class="text-xs text-foreground-muted">{{ hint }}</p>
  </div>
</template>
