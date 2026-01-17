<script setup lang="ts">
const props = defineProps<{
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'default'
  loading?: boolean
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'danger':
      return 'bg-red-500 hover:bg-red-600'
    case 'warning':
      return 'bg-amber-500 hover:bg-amber-600'
    default:
      return 'bg-foreground hover:bg-foreground-muted'
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div
          class="absolute inset-0 bg-black/60 backdrop-blur-sm"
          @click="emit('cancel')"
        />

        <Transition
          enter-active-class="duration-200 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="duration-150 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="open"
            class="relative w-full max-w-sm bg-background border border-border rounded-2xl p-6"
          >
            <h3 class="font-display text-lg font-medium mb-2">
              {{ title }}
            </h3>
            <p class="text-foreground-muted text-sm mb-6">
              {{ message }}
            </p>

            <div class="flex gap-3">
              <button
                @click="emit('cancel')"
                :disabled="loading"
                class="flex-1 py-2.5 text-sm text-foreground-muted border border-border rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                {{ cancelLabel || 'Annuler' }}
              </button>
              <button
                @click="emit('confirm')"
                :disabled="loading"
                :class="[
                  'flex-1 py-2.5 text-sm text-background rounded-lg transition-colors disabled:opacity-50',
                  variantClasses
                ]"
              >
                {{ loading ? '...' : (confirmLabel || 'Confirmer') }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
